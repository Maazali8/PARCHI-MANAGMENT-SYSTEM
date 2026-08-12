import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { AuthRequest, requireAuth, requireAdmin, hashPassword } from '../middleware/auth.js';

const router = Router();

// GET /api/users - List employees
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, username: true, role: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/employees - List active employees only (for dropdowns)
router.get('/employees', requireAuth, async (_req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: 'EMPLOYEE', isActive: true },
      select: { id: true, name: true, username: true, phone: true },
      orderBy: { name: 'asc' },
    });
    res.json(employees);
  } catch (error) {
    console.error('List employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create employee
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, username, password, role, phone } = req.body;

    if (!name || !username || !password) {
      res.status(400).json({ error: 'Name, username, and password are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashed,
        role: role || 'EMPLOYEE',
        phone: phone || null,
      },
      select: { id: true, name: true, username: true, role: true, phone: true, isActive: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id - Update employee
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const { name, username, phone, password, role } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone || null;
    if (role) updateData.role = role;
    if (password) updateData.password = await hashPassword(password);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, role: true, phone: true, isActive: true, createdAt: true },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id/status - Toggle active status
router.patch('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params['id'] as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, username: true, role: true, phone: true, isActive: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
