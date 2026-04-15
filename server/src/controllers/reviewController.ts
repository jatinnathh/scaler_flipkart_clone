import { Request, Response, NextFunction } from 'express';
import * as reviewQueries from '../queries/reviews.js';

export async function getReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = parseInt(req.query.productId as string);
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const result = await reviewQueries.getProductReviews(productId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { product_id, order_id, rating, title, body } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ success: false, error: 'product_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'rating must be between 1 and 5' });
    }

    const review = await reviewQueries.createReview(user.id, {
      product_id, order_id, rating, title, body,
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}
