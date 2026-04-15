import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'flipkart-admin-secret-key-2024';

export interface AdminPayload {
  email: string;
  role: 'admin';
}

// Middleware to verify admin JWT token
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Admin authentication required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, ADMIN_JWT_SECRET) as AdminPayload;
    if (payload.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    (req as any).adminUser = payload;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired admin token' });
  }
}

// Generate admin JWT token
export function generateAdminToken(email: string): string {
  return jwt.sign(
    { email, role: 'admin' } as AdminPayload,
    ADMIN_JWT_SECRET,
    { expiresIn: '24h' }
  );
}
