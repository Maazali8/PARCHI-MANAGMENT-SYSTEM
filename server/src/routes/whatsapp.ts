import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function dayRange(dateStr?: string) {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return { start, end };
}

// GET /api/whatsapp/morning/:empId - Morning assignment message
router.get('/morning/:empId', requireAuth, async (req, res) => {
  try {
    const empId = req.params['empId'] as string;
    const { start, end } = dayRange();

    const employee = await prisma.user.findUnique({
      where: { id: empId },
      select: { name: true, phone: true },
    });

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const parchis = await prisma.parchi.findMany({
      where: { employeeId: empId, date: { gte: start, lt: end } },
      include: { shopkeeper: { select: { shopName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const dateStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    const totalAmount = parchis.reduce((s: number, p: any) => s + p.amount, 0);

    let message = `📋 *Today's Collection — ${dateStr}*\n\n`;
    message += `Employee: ${employee.name}\n`;
    message += `Total Parchis: ${parchis.length}\n`;
    message += `Total Amount: Rs. ${totalAmount.toLocaleString()}\n\n`;

    parchis.forEach((p: any, i: number) => {
      message += `${i + 1}. ${p.shopkeeper.shopName} — Rs. ${p.amount.toLocaleString()}\n`;
    });

    message += `\n💪 Good luck!`;

    const whatsappUrl = employee.phone
      ? `https://wa.me/${employee.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      : null;

    res.json({ message, whatsappUrl, phone: employee.phone });
  } catch (error) {
    console.error('WhatsApp morning error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/whatsapp/evening/:empId - Evening summary message
router.get('/evening/:empId', requireAuth, async (req, res) => {
  try {
    const empId = req.params['empId'] as string;
    const { start, end } = dayRange();

    const employee = await prisma.user.findUnique({
      where: { id: empId },
      select: { name: true, phone: true },
    });

    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    const collections = await prisma.collection.findMany({
      where: { collectedById: empId, date: { gte: start, lt: end } },
      include: { shopkeeper: { select: { shopName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const totalCash = collections.reduce((s: number, c: any) => s + c.cashPayment, 0);
    const totalOnline = collections.reduce((s: number, c: any) => s + c.onlinePayment, 0);
    const totalKhata = collections.reduce((s: number, c: any) => s + c.addedToKhata, 0);

    const dateStr = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });

    let message = `📊 *Collection Summary — ${dateStr}*\n\n`;
    message += `Employee: ${employee.name}\n`;
    message += `Total Collections: ${collections.length}\n\n`;

    collections.forEach((c: any, i: number) => {
      const paid = c.cashPayment + c.onlinePayment;
      message += `${i + 1}. ${c.shopkeeper.shopName}\n`;
      message += `   Parchi: Rs. ${c.parchiAmount.toLocaleString()}\n`;
      message += `   Paid: Rs. ${paid.toLocaleString()}`;
      if (c.addedToKhata > 0) message += ` | Khata: Rs. ${c.addedToKhata.toLocaleString()}`;
      message += `\n`;
    });

    message += `\n*Totals:*\n`;
    message += `💵 Cash: Rs. ${totalCash.toLocaleString()}\n`;
    message += `📱 Online: Rs. ${totalOnline.toLocaleString()}\n`;
    if (totalKhata > 0) message += `📒 Added to Khata: Rs. ${totalKhata.toLocaleString()}\n`;

    const whatsappUrl = employee.phone
      ? `https://wa.me/${employee.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      : null;

    res.json({ message, whatsappUrl, phone: employee.phone });
  } catch (error) {
    console.error('WhatsApp evening error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
