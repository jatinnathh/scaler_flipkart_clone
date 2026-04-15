import { Request, Response, NextFunction } from 'express';
import { requireAuth, getAuth, clerkClient } from '@clerk/express';
import { query } from '../config/db.js';

// Middleware that requires authentication (returns 401 if not authenticated)
export const protect = requireAuth();

// Helper to get the internal DB user from Clerk's userId
export async function getDbUser(clerkUserId: string) {
  const rows = await query(
    'SELECT * FROM users WHERE clerk_id = $1',
    [clerkUserId]
  );
  return rows[0] || null;
}

// Auto-sync: fetch user from Clerk API and insert into DB
async function autoSyncUser(clerkUserId: string) {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null;

    const rows = await query(
      `INSERT INTO users (clerk_id, email, first_name, last_name, phone, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (clerk_id)
       DO UPDATE SET email = $2, first_name = $3, last_name = $4, phone = $5, avatar_url = $6, updated_at = NOW()
       RETURNING *`,
      [
        clerkUserId,
        email,
        clerkUser.firstName || null,
        clerkUser.lastName || null,
        phone,
        clerkUser.imageUrl || null,
      ]
    );

    console.log(`✅ Auto-synced user: ${clerkUserId} (${email})`);
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Failed to auto-sync user:', error);
    return null;
  }
}

// Middleware that resolves the DB user and attaches to req
export async function resolveUser(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let user = await getDbUser(auth.userId);

    // Auto-sync: if user not in DB yet, fetch from Clerk and create
    if (!user) {
      user = await autoSyncUser(auth.userId);
    }

    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to sync user from Clerk. Please try again.',
      });
    }

    // Attach to request for downstream use
    (req as any).dbUser = user;
    next();
  } catch (error) {
    next(error);
  }
}
