import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/khata - All khata balances
router.get('/', requireAuth, async (_req, res) => {
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
        return {
          id: sk.id,
          shopName: sk.shopName,
          ownerName: sk.ownerName,
          phone: sk.phone,
          balance: lastEntry?.balanceAfter ?? 0,
          lastUpdated: lastEntry?.createdAt ?? null,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error('List khata error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/khata/:shopkeeperId - Shopkeeper khata history
router.get('/:shopkeeperId', requireAuth, async (req, res) => {
  try {
    const shopkeeperId = req.params['shopkeeperId'] as string;

    const shopkeeper = await prisma.shopkeeper.findUnique({
      where: { id: shopkeeperId },
      select: { id: true, shopName: true, ownerName: true, phone: true, hasKhata: true },
    });

    if (!shopkeeper) {
      res.status(404).json({ error: 'Shopkeeper not found' });
      return;
    }

    const entries = await prisma.khataEntry.findMany({
      where: { shopkeeperId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const lastEntry = entries.length > 0 ? entries[0] : null;

    res.json({
      shopkeeper,
      currentBalance: lastEntry?.balanceAfter ?? 0,
      entries,
    });
  } catch (error) {
    console.error('Khata history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
