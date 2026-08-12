import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Helper: get start/end of a date
function dayRange(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

// GET /api/parchis - List parchis by date
router.get('/', requireAuth, async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = dayRange(date as string);

    const parchis = await prisma.parchi.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
        collection: { select: { id: true, cashPayment: true, onlinePayment: true, onlineVerified: true, addedToKhata: true, netParchiAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(parchis);
  } catch (error) {
    console.error('List parchis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/parchis/today - Today's parchis
router.get('/today', requireAuth, async (_req, res) => {
  try {
    const { start, end } = dayRange();

    const parchis = await prisma.parchi.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
        collection: { select: { id: true, cashPayment: true, onlinePayment: true, onlineVerified: true, addedToKhata: true, netParchiAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(parchis);
  } catch (error) {
    console.error('Today parchis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/parchis/my - Employee's assigned parchis
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { date } = req.query;
    const { start, end } = dayRange(date as string);

    const parchis = await prisma.parchi.findMany({
      where: {
        employeeId: req.user!.userId,
        date: { gte: start, lt: end },
      },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true, hasKhata: true } },
        collection: { select: { id: true, cashPayment: true, onlinePayment: true, onlineVerified: true, addedToKhata: true, netParchiAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(parchis);
  } catch (error) {
    console.error('My parchis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/parchis - Create parchi
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { date, amount, shopkeeperId, employeeId } = req.body;

    if (!amount || !shopkeeperId || !employeeId) {
      res.status(400).json({ error: 'Amount, shopkeeper, and employee are required' });
      return;
    }

    const parchi = await prisma.parchi.create({
      data: {
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        shopkeeperId,
        employeeId,
      },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(parchi);
  } catch (error) {
    console.error('Create parchi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/parchis/:id - Update parchi
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const { amount, shopkeeperId, employeeId, date } = req.body;

    // Check if parchi has a collection
    const existing = await prisma.parchi.findUnique({
      where: { id },
      include: { collection: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Parchi not found' });
      return;
    }

    if (existing.collection) {
      res.status(400).json({ error: 'Cannot update parchi that has been collected' });
      return;
    }

    const parchi = await prisma.parchi.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(shopkeeperId && { shopkeeperId }),
        ...(employeeId && { employeeId }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    res.json(parchi);
  } catch (error) {
    console.error('Update parchi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/parchis/:id - Delete parchi (only if no collection)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;

    const existing = await prisma.parchi.findUnique({
      where: { id },
      include: { collection: true },
    });

    if (!existing) {
      res.status(404).json({ error: 'Parchi not found' });
      return;
    }

    if (existing.collection) {
      res.status(400).json({ error: 'Cannot delete parchi that has been collected' });
      return;
    }

    await prisma.parchi.delete({ where: { id } });
    res.json({ message: 'Parchi deleted' });
  } catch (error) {
    console.error('Delete parchi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/parchis/:id/return - Mark a parchi as returned without collection
// Available to: the assigned employee OR any admin
router.patch('/:id/return', requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = req.params['id'] as string;
    const { returnReason } = req.body;

    if (!returnReason || !returnReason.trim()) {
      res.status(400).json({ error: 'A return reason is required' });
      return;
    }

    const parchi = await prisma.parchi.findUnique({
      where: { id },
      include: { collection: true },
    });

    if (!parchi) {
      res.status(404).json({ error: 'Parchi not found' });
      return;
    }

    // Employees can only return their own parchis
    if (req.user!.role === 'EMPLOYEE' && parchi.employeeId !== req.user!.userId) {
      res.status(403).json({ error: 'You can only return parchis assigned to you' });
      return;
    }

    if (parchi.status !== 'PENDING') {
      res.status(400).json({
        error: `Cannot return a parchi with status "${parchi.status}". Only PENDING parchis can be returned.`,
      });
      return;
    }

    if (parchi.collection) {
      res.status(400).json({ error: 'This parchi already has a collection. Use the Return Collection action instead.' });
      return;
    }

    const updated = await prisma.parchi.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnReason: returnReason.trim(),
        returnedAt: new Date(),
      },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Return parchi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/parchis/:id/unreturn - Revert a RETURNED parchi back to PENDING (admin only)
router.patch('/:id/unreturn', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;

    const parchi = await prisma.parchi.findUnique({
      where: { id },
    });

    if (!parchi) {
      res.status(404).json({ error: 'Parchi not found' });
      return;
    }

    if (parchi.status !== 'RETURNED') {
      res.status(400).json({ error: 'Only RETURNED parchis can be un-returned' });
      return;
    }

    const updated = await prisma.parchi.update({
      where: { id },
      data: {
        status: 'PENDING',
        returnReason: null,
        returnedAt: null,
      },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        employee: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Unreturn parchi error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
