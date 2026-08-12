import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface AuthPayload {
  userId: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== AUTHENTICATION DISABLED / BYPASSED FOR NOW =====
export async function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  // If authorization header is present and valid, use it
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      req.user = decoded;
      return next();
    } catch {
      // ignore token verification error when auth is commented out
    }
  }

  // Otherwise, automatically assign an active Admin user (or fallback user)
  try {
    const defaultUser = await prisma.user.findFirst({ where: { isActive: true } });
    if (defaultUser) {
      req.user = { userId: defaultUser.id, role: defaultUser.role };
    } else {
      req.user = { userId: 'admin', role: 'ADMIN' };
    }
  } catch {
    req.user = { userId: 'admin', role: 'ADMIN' };
  }
  next();
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction): void {
  // Auth commented out — allow access
  if (!req.user) {
    req.user = { userId: 'admin', role: 'ADMIN' };
  }
  next();
}
