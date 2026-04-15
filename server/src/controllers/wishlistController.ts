import { Request, Response, NextFunction } from 'express';
import * as wishlistQueries from '../queries/wishlist.js';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const items = await wishlistQueries.getWishlistItems(user.id);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function addToWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const item = await wishlistQueries.addToWishlist(user.id, productId);
    res.status(201).json({ success: true, data: item, message: 'Added to wishlist' });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const item = await wishlistQueries.removeFromWishlist(parseInt(id), user.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Wishlist item not found' });
    }

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
}

export async function toggleWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const exists = await wishlistQueries.isInWishlist(user.id, productId);
    if (exists) {
      await wishlistQueries.removeFromWishlistByProduct(user.id, productId);
      res.json({ success: true, wishlisted: false, message: 'Removed from wishlist' });
    } else {
      await wishlistQueries.addToWishlist(user.id, productId);
      res.json({ success: true, wishlisted: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    next(error);
  }
}

export async function getWishlistIds(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const ids = await wishlistQueries.getWishlistProductIds(user.id);
    res.json({ success: true, data: ids });
  } catch (error) {
    next(error);
  }
}
