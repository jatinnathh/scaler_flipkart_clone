import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as cartController from '../controllers/cartController.js';

const router = Router();

// All cart routes require authentication
router.use(protect, resolveUser);

// GET /api/cart — get user's cart with summary
router.get('/', cartController.getCart);

// GET /api/cart/count — get cart item count (for navbar badge)
router.get('/count', cartController.getCartCount);

// POST /api/cart — add item { productId, quantity }
router.post('/', cartController.addToCart);

// PATCH /api/cart/:id — update quantity { quantity }
router.patch('/:id', cartController.updateQuantity);

// DELETE /api/cart/:id — remove item
router.delete('/:id', cartController.removeItem);

export default router;
