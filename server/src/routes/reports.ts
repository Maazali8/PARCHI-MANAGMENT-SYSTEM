import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

function dayRange(dateStr: string) {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

// GET /api/reports/daily?date=YYYY-MM-DD
router.get('/daily', requireAuth, requireAdmin, async (req, res) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const { start, end } = dayRange(date);

    const collections = await prisma.collection.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        shopkeeper: { select: { shopName: true, ownerName: true } },
        collectedBy: { select: { name: true } },
        parchi: { select: { amount: true, status: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Parchis without collection for the same date
    const uncollectedParchis = await prisma.parchi.findMany({
      where: {
        date: { gte: start, lt: end },
        collection: null,
      },
      include: {
        shopkeeper: { select: { shopName: true } },
        employee: { select: { name: true } },
      },
    });

    // Summary
    const totalParchi = collections.reduce((s: number, c: any) => s + c.parchiAmount, 0);
    const totalDiscount = collections.reduce((s: number, c: any) => s + c.discount, 0);
    const totalGoodsAdj = collections.reduce((s: number, c: any) => s + c.goodsAdjustment, 0);
    const totalCash = collections.reduce((s: number, c: any) => s + c.cashPayment, 0);
    const totalOnline = collections.reduce((s: number, c: any) => s + c.onlinePayment, 0);
    const totalKhataAdded = collections.reduce((s: number, c: any) => s + c.addedToKhata, 0);
    const totalKhataPayment = collections.reduce((s: number, c: any) => s + c.khataPayment, 0);

    res.json({
      date,
      collections,
      uncollectedParchis,
      summary: {
        totalParchi,
        totalDiscount,
        totalGoodsAdj,
        totalCash,
        totalOnline,
        totalKhataAdded,
        totalKhataPayment,
        totalCollection: totalCash + totalOnline,
      },
    });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/monthly?month=YYYY-MM
router.get('/monthly', requireAuth, requireAdmin, async (req, res) => {
  try {
    const monthStr = req.query.month as string;
    const now = new Date();
    const year = monthStr ? parseInt(monthStr.split('-')[0]) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr.split('-')[1]) - 1 : now.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);

    const collections = await prisma.collection.findMany({
      where: { date: { gte: start, lt: end } },
      include: {
        shopkeeper: { select: { shopName: true } },
        collectedBy: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Group by date
    const dailySummaries: Record<string, { date: string; totalCash: number; totalOnline: number; totalKhataAdded: number; totalKhataPayment: number; count: number }> = {};

    for (const c of collections) {
      const dateKey = c.date.toISOString().split('T')[0];
      if (!dailySummaries[dateKey]) {
        dailySummaries[dateKey] = { date: dateKey, totalCash: 0, totalOnline: 0, totalKhataAdded: 0, totalKhataPayment: 0, count: 0 };
      }
      dailySummaries[dateKey].totalCash += c.cashPayment;
      dailySummaries[dateKey].totalOnline += c.onlinePayment;
      dailySummaries[dateKey].totalKhataAdded += c.addedToKhata;
      dailySummaries[dateKey].totalKhataPayment += c.khataPayment;
      dailySummaries[dateKey].count += 1;
    }

    const totalCash = collections.reduce((s: number, c: any) => s + c.cashPayment, 0);
    const totalOnline = collections.reduce((s: number, c: any) => s + c.onlinePayment, 0);
    const totalKhataAdded = collections.reduce((s: number, c: any) => s + c.addedToKhata, 0);
    const totalKhataPayment = collections.reduce((s: number, c: any) => s + c.khataPayment, 0);

    res.json({
      month: `${year}-${String(month + 1).padStart(2, '0')}`,
      dailySummaries: Object.values(dailySummaries),
      summary: {
        totalCash,
        totalOnline,
        totalKhataAdded,
        totalKhataPayment,
        totalCollection: totalCash + totalOnline,
        totalEntries: collections.length,
      },
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/shopkeeper/:id
router.get('/shopkeeper/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const shopkeeper = await prisma.shopkeeper.findUnique({ where: { id } });
    if (!shopkeeper) {
      res.status(404).json({ error: 'Shopkeeper not found' });
      return;
    }

    const collections = await prisma.collection.findMany({
      where: { shopkeeperId: id },
      include: {
        collectedBy: { select: { name: true } },
        parchi: { select: { amount: true, date: true, status: true } },
      },
      orderBy: { date: 'desc' },
      take: 200,
    });

    let khataBalance = 0;
    if (shopkeeper.hasKhata) {
      const lastEntry = await prisma.khataEntry.findFirst({
        where: { shopkeeperId: shopkeeper.id },
        orderBy: { createdAt: 'desc' },
      });
      khataBalance = lastEntry?.balanceAfter ?? 0;
    }

    res.json({ shopkeeper: { ...shopkeeper, khataBalance }, collections });
  } catch (error) {
    console.error('Shopkeeper report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/reports/khata
router.get('/khata', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const shopkeepers = await prisma.shopkeeper.findMany({
      where: { hasKhata: true, isActive: true },
      orderBy: { shopName: 'asc' },
    });

    const result = await Promise.all(
      shopkeepers.map(async (sk: any) => {
        const lastEntry = await prisma.khataEntry.findFirst({
          where: { shopkeeperId: sk.id },
          orderBy: { createdAt: 'desc' },
        });

        const recentEntries = await prisma.khataEntry.findMany({
          where: { shopkeeperId: sk.id },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });

        return {
          shopkeeper: { id: sk.id, shopName: sk.shopName, ownerName: sk.ownerName },
          balance: lastEntry?.balanceAfter ?? 0,
          recentEntries,
        };
      })
    );

    const totalKhata = result.reduce((s, r) => s + r.balance, 0);

    res.json({ shopkeepers: result, totalKhata });
  } catch (error) {
    console.error('Khata report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
