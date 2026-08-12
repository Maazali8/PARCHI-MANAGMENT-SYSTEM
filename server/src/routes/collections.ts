import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/collections - List collections
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date, shopkeeperId } = req.query;
    const where: Record<string, unknown> = {};

    if (date) {
      const d = new Date(date as string);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      where.date = { gte: start, lt: end };
    }
    if (shopkeeperId) where.shopkeeperId = shopkeeperId;

    const collections = await prisma.collection.findMany({
      where,
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        collectedBy: { select: { id: true, name: true } },
        parchi: { select: { id: true, amount: true, date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    res.json(collections);
  } catch (error) {
    console.error('List collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/collections/my - Employee's collections
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;
    const where: Record<string, unknown> = { collectedById: req.user!.userId };

    if (date) {
      const d = new Date(date as string);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const collections = await prisma.collection.findMany({
      where,
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        parchi: { select: { id: true, amount: true, date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json(collections);
  } catch (error) {
    console.error('My collections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/collections - Enter collection (CORE BUSINESS LOGIC)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      parchiId,
      discount = 0,
      discountReason,
      goodsAdjustment = 0,
      goodsDescription,
      cashPayment = 0,
      onlinePayment = 0,
      onlineMethod,
      khataPayment = 0,
      khataPaymentCash = 0,
      khataPaymentOnline = 0,
      khataOnlineMethod,
      notes,
    } = req.body;

    if (!parchiId) {
      res.status(400).json({ error: 'Parchi ID is required' });
      return;
    }

    // Fetch the parchi
    const parchi = await prisma.parchi.findUnique({
      where: { id: parchiId },
      include: { shopkeeper: true, collection: true },
    });

    if (!parchi) {
      res.status(404).json({ error: 'Parchi not found' });
      return;
    }

    if (parchi.collection) {
      res.status(400).json({ error: 'Collection already exists for this parchi' });
      return;
    }

    // ===== BUSINESS LOGIC =====
    const parchiAmount = parchi.amount;
    const discountAmt = parseFloat(String(discount)) || 0;
    const goodsAdj = parseFloat(String(goodsAdjustment)) || 0;
    const cashPmt = parseFloat(String(cashPayment)) || 0;
    const onlinePmt = parseFloat(String(onlinePayment)) || 0;
    const khataPmt = parseFloat(String(khataPayment)) || 0;
    const khataCash = parseFloat(String(khataPaymentCash)) || 0;
    const khataOnline = parseFloat(String(khataPaymentOnline)) || 0;

    // Step 1: Calculate net parchi amount
    const netParchiAmount = parchiAmount - discountAmt - goodsAdj;

    // Step 2: Total payment toward today's parchi
    const totalParchiPayment = cashPmt + onlinePmt;

    // Step 3: Calculate what gets added to khata
    let addedToKhata = 0;
    let parchiStatus: 'PAID' | 'PARTIAL' | 'ADDED_TO_KHATA' = 'PAID';

    if (totalParchiPayment >= netParchiAmount) {
      // Fully paid
      addedToKhata = 0;
      parchiStatus = 'PAID';
    } else if (totalParchiPayment > 0) {
      // Partially paid
      addedToKhata = netParchiAmount - totalParchiPayment;
      parchiStatus = 'PARTIAL';
    } else {
      // Nothing paid — entire net amount goes to khata
      addedToKhata = netParchiAmount;
      parchiStatus = 'ADDED_TO_KHATA';
    }

    // Validate: if adding to khata, shopkeeper must have khata enabled
    if (addedToKhata > 0 && !parchi.shopkeeper.hasKhata) {
      res.status(400).json({ error: 'This shopkeeper does not have khata enabled. Full payment is required.' });
      return;
    }

    // Create collection record
    const collection = await prisma.collection.create({
      data: {
        date: new Date(),
        parchiAmount,
        discount: discountAmt,
        discountReason: discountReason || null,
        goodsAdjustment: goodsAdj,
        goodsDescription: goodsDescription || null,
        netParchiAmount,
        cashPayment: cashPmt,
        onlinePayment: onlinePmt,
        onlineMethod: onlinePmt > 0 ? (onlineMethod || null) : null,
        onlineVerified: false,
        addedToKhata,
        khataPayment: khataPmt,
        khataPaymentCash: khataCash,
        khataPaymentOnline: khataOnline,
        khataOnlineMethod: khataOnline > 0 ? (khataOnlineMethod || null) : null,
        khataOnlineVerified: false,
        notes: notes || null,
        parchiId: parchi.id,
        shopkeeperId: parchi.shopkeeperId,
        collectedById: req.user!.userId,
      },
      include: {
        shopkeeper: { select: { shopName: true } },
        collectedBy: { select: { name: true } },
      },
    });

    // Update parchi status
    await prisma.parchi.update({
      where: { id: parchi.id },
      data: { status: parchiStatus },
    });

    // Create Khata entries if applicable
    if (addedToKhata > 0 && parchi.shopkeeper.hasKhata) {
      // Get current balance
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: parchi.shopkeeperId },
        orderBy: { createdAt: 'desc' },
      });
      const currentBalance = lastEntry?.balanceAfter ?? 0;

      await prisma.khataEntry.create({
        data: {
          date: new Date(),
          amount: addedToKhata,
          type: 'PARCHI_ADDED',
          description: `Parchi amount added to khata`,
          balanceAfter: currentBalance + addedToKhata,
          shopkeeperId: parchi.shopkeeperId,
          collectionId: collection.id,
        },
      });
    }

    if (khataPmt > 0 && parchi.shopkeeper.hasKhata) {
      // Get current balance (after possible addition above)
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: parchi.shopkeeperId },
        orderBy: { createdAt: 'desc' },
      });
      const currentBalance = lastEntry?.balanceAfter ?? 0;

      await prisma.khataEntry.create({
        data: {
          date: new Date(),
          amount: -khataPmt,
          type: 'KHATA_PAYMENT',
          description: `Payment against old khata`,
          balanceAfter: currentBalance - khataPmt,
          shopkeeperId: parchi.shopkeeperId,
          collectionId: collection.id,
        },
      });
    }

    res.status(201).json(collection);
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/collections/:id - Get collection details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        shopkeeper: true,
        collectedBy: { select: { id: true, name: true } },
        parchi: true,
      },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/collections/:id/verify - Verify online payment
router.patch('/:id/verify', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const { type } = req.body; // 'parchi' or 'khata'

    const updateData: Record<string, boolean> = {};
    if (type === 'khata') {
      updateData.khataOnlineVerified = true;
    } else {
      updateData.onlineVerified = true;
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
      include: {
        shopkeeper: { select: { shopName: true } },
        collectedBy: { select: { name: true } },
      },
    });

    res.json(collection);
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/collections/:id - Return/Reverse a collection (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        parchi: true,
        shopkeeper: true,
      },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Reverse any khata entries created by this collection
    const khataEntries = await prisma.khataEntry.findMany({
      where: { collectionId: collection.id },
      orderBy: { createdAt: 'desc' },
    });

    for (const entry of khataEntries) {
      // Get the latest balance before we create reversal
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: collection.shopkeeperId },
        orderBy: { createdAt: 'desc' },
      });
      const currentBalance = lastEntry?.balanceAfter ?? 0;
      const reversalAmount = -entry.amount; // flip sign to reverse

      await prisma.khataEntry.create({
        data: {
          date: new Date(),
          amount: reversalAmount,
          type: entry.type,
          description: `Reversal: ${entry.description || 'Parchi returned'}`,
          balanceAfter: currentBalance + reversalAmount,
          shopkeeperId: collection.shopkeeperId,
        },
      });
    }

    // Delete the collection
    await prisma.collection.delete({ where: { id: collection.id } });

    // Reset parchi status back to PENDING
    await prisma.parchi.update({
      where: { id: collection.parchiId },
      data: { status: 'PENDING' },
    });

    res.json({ message: 'Collection reversed successfully. Parchi is now pending again.' });
  } catch (error) {
    console.error('Return collection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/collections/pending-verification - Get unverified online payments
router.get('/pending-verification/list', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      where: {
        OR: [
          { onlinePayment: { gt: 0 }, onlineVerified: false },
          { khataPaymentOnline: { gt: 0 }, khataOnlineVerified: false },
        ],
      },
      include: {
        shopkeeper: { select: { shopName: true, ownerName: true } },
        collectedBy: { select: { name: true } },
        parchi: { select: { amount: true, date: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(collections);
  } catch (error) {
    console.error('Pending verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
