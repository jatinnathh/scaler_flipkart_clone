import { Request, Response, NextFunction } from 'express';
import * as recQueries from '../queries/recommendations.js';

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const limit = parseInt(req.query.limit as string) || 12;
    const recommendations = await recQueries.getRecommendations(user.id, limit);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
}

export async function trackRecentlyViewed(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    await recQueries.trackView(user.id, productId);
    res.json({ success: true, message: 'View tracked' });
  } catch (error) {
    next(error);
  }
}

export async function getRecentlyViewed(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const limit = parseInt(req.query.limit as string) || 10;
    const items = await recQueries.getRecentlyViewed(user.id, limit);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}
