import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/shopkeepers - List all shopkeepers
router.get('/', requireAuth, async (req, res) => {
  try {
    const { search, hasKhata } = req.query;

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
      where.OR = [
        { shopName: { contains: search as string, mode: 'insensitive' } },
        { ownerName: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (hasKhata === 'true') where.hasKhata = true;

    const shopkeepers = await prisma.shopkeeper.findMany({
      where,
      orderBy: { shopName: 'asc' },
    });

    // Get current khata balance for each khata shopkeeper
    const result = await Promise.all(
      shopkeepers.map(async (sk: any) => {
        let khataBalance = 0;
        if (sk.hasKhata) {
          const lastEntry = await prisma.khataEntry.findFirst({
            where: { shopkeeperId: sk.id },
            orderBy: { createdAt: 'desc' },
          });
          khataBalance = lastEntry?.balanceAfter ?? 0;
        }
        return { ...sk, khataBalance };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('List shopkeepers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shopkeepers/:id - Get shopkeeper details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id },
    });

    if (!shopkeeper) {
      res.status(404).json({ error: 'Shopkeeper not found' });
      return;
    }

    let khataBalance = 0;
    if (shopkeeper.hasKhata) {
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: shopkeeper.id },
        orderBy: { createdAt: 'desc' },
      });
      khataBalance = lastEntry?.balanceAfter ?? 0;
    }

    res.json({ ...shopkeeper, khataBalance });
  } catch (error) {
    console.error('Get shopkeeper error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/shopkeepers - Create shopkeeper
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { shopName, ownerName, phone, address, notes, hasKhata } = req.body;

    if (!shopName || !ownerName) {
      res.status(400).json({ error: 'Shop name and owner name are required' });
      return;
    }

    const shopkeeper = await prisma.shopkeeper.create({
      data: {
        shopName,
        ownerName,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        hasKhata: hasKhata || false,
      },
    });

    res.status(201).json(shopkeeper);
  } catch (error) {
    console.error('Create shopkeeper error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/shopkeepers/:id - Update shopkeeper
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const { shopName, ownerName, phone, address, notes, hasKhata } = req.body;

    const shopkeeper = await prisma.shopkeeper.update({
      where: { id },
      data: {
        ...(shopName && { shopName }),
        ...(ownerName && { ownerName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(hasKhata !== undefined && { hasKhata }),
      },
    });

    res.json(shopkeeper);
  } catch (error) {
    console.error('Update shopkeeper error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/shopkeepers/:id/history - Transaction history
router.get('/:id/history', requireAuth, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const collections = await prisma.collection.findMany({
      where: { shopkeeperId: id },
      include: {
        parchi: true,
        collectedBy: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
    });

    res.json(collections);
  } catch (error) {
    console.error('Shopkeeper history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
