import { Request, Response, NextFunction } from 'express';
import * as cartQueries from '../queries/cart.js';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const items = await cartQueries.getCartItems(user.id);
    
    // Calculate summary
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.mrp * item.quantity), 0);
    const itemTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discount = subtotal - itemTotal;
    const shippingFee = itemTotal >= 500 ? 0 : 40;
    const total = itemTotal + shippingFee;
    const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items,
        itemCount,
        subtotal,
        discount,
        shippingFee,
        total,
        savings: discount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCartCount(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const count = await cartQueries.getCartCount(user.id);
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const item = await cartQueries.addToCart(user.id, productId, quantity);
    const count = await cartQueries.getCartCount(user.id);
    
    res.status(201).json({ success: true, data: item, cartCount: count });
  } catch (error) {
    next(error);
  }
}

export async function updateQuantity(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, error: 'quantity must be >= 1' });
    }

    const item = await cartQueries.updateCartQuantity(parseInt(id), user.id, quantity);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const item = await cartQueries.removeCartItem(parseInt(id), user.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Cart item not found' });
    }

    const count = await cartQueries.getCartCount(user.id);
    res.json({ success: true, message: 'Item removed', cartCount: count });
  } catch (error) {
    next(error);
  }
}
