import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest, requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function dayRange(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

// GET /api/dashboard/admin
router.get('/admin', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const now = new Date();
    const todayRange = dayRange();
    const yesterdayRange = dayRange(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's collection totals
    const todayCollections = await prisma.collection.findMany({
      where: { date: { gte: todayRange.start, lt: todayRange.end } },
    });
    const todayTotal = todayCollections.reduce((sum: number, c: any) => sum + c.cashPayment + (c.onlineVerified ? c.onlinePayment : 0) + c.khataPaymentCash + (c.khataOnlineVerified ? c.khataPaymentOnline : 0), 0);

    // Yesterday's collection totals
    const yesterdayCollections = await prisma.collection.findMany({
      where: { date: { gte: yesterdayRange.start, lt: yesterdayRange.end } },
    });
    const yesterdayTotal = yesterdayCollections.reduce((sum: number, c: any) => sum + c.cashPayment + (c.onlineVerified ? c.onlinePayment : 0) + c.khataPaymentCash + (c.khataOnlineVerified ? c.khataPaymentOnline : 0), 0);

    // Monthly total
    const monthCollections = await prisma.collection.findMany({
      where: { date: { gte: monthStart, lt: todayRange.end } },
    });
    const monthTotal = monthCollections.reduce((sum: number, c: any) => sum + c.cashPayment + (c.onlineVerified ? c.onlinePayment : 0) + c.khataPaymentCash + (c.khataOnlineVerified ? c.khataPaymentOnline : 0), 0);

    // Total current khata
    const khataShopkeepers = await prisma.shopkeeper.findMany({ where: { hasKhata: true, isActive: true } });
    let totalKhata = 0;
    for (const sk of khataShopkeepers) {
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: sk.id },
        orderBy: { createdAt: 'desc' },
      });
      totalKhata += lastEntry?.balanceAfter ?? 0;
    }

    // Pending online verifications
    const pendingVerifications = await prisma.collection.count({
      where: {
        OR: [
          { onlinePayment: { gt: 0 }, onlineVerified: false },
          { khataPaymentOnline: { gt: 0 }, khataOnlineVerified: false },
        ],
      },
    });

    // Today's parchis count
    const todayParchis = await prisma.parchi.count({
      where: { date: { gte: todayRange.start, lt: todayRange.end } },
    });

    // Recent collections (last 10) — include all fields for detail modal
    const recentCollections = await prisma.collection.findMany({
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true } },
        collectedBy: { select: { id: true, name: true } },
        parchi: { select: { id: true, amount: true, date: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      todayTotal,
      yesterdayTotal,
      monthTotal,
      totalKhata,
      pendingVerifications,
      todayParchis,
      recentCollections,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/employee
router.get('/employee', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { start, end } = dayRange();
    const userId = req.user!.userId;

    // Today's assigned parchis
    const myParchis = await prisma.parchi.findMany({
      where: { employeeId: userId, date: { gte: start, lt: end } },
      include: {
        shopkeeper: { select: { id: true, shopName: true, ownerName: true, hasKhata: true } },
        collection: { select: { id: true, cashPayment: true, onlinePayment: true, onlineVerified: true, addedToKhata: true, netParchiAmount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalAssigned = myParchis.reduce((sum: number, p: any) => sum + p.amount, 0);

    // Calculate collected amount
    const collectedParchis = myParchis.filter((p: any) => p.collection);
    const totalCollected = collectedParchis.reduce((sum: number, p: any) => {
      const c = p.collection!;
      return sum + c.cashPayment + (c.onlineVerified ? c.onlinePayment : 0);
    }, 0);

    const remaining = totalAssigned - totalCollected;

    // Today's collections by this employee
    const todayCollections = await prisma.collection.findMany({
      where: {
        collectedById: userId,
        date: { gte: start, lt: end },
      },
      include: {
        shopkeeper: { select: { shopName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      totalAssigned,
      totalCollected,
      remaining,
      parchis: myParchis,
      todayCollections,
      totalParchis: myParchis.length,
      collectedCount: collectedParchis.length,
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
