import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { getDbUser } from './auth.js';

// Middleware that optionally resolves user — doesn't block if not authenticated
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      const user = await getDbUser(auth.userId);
      (req as any).dbUser = user;
    }
    next();
  } catch {
    // If auth fails, just continue without user
    next();
  }
}
