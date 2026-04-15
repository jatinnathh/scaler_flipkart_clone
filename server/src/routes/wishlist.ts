import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = Router();

// All wishlist routes require authentication
router.use(protect, resolveUser);

// GET /api/wishlist — get user's wishlist
router.get('/', wishlistController.getWishlist);

// GET /api/wishlist/ids — get just the product IDs (for heart icon state)
router.get('/ids', wishlistController.getWishlistIds);

// POST /api/wishlist — add item { productId }
router.post('/', wishlistController.addToWishlist);

// POST /api/wishlist/toggle — toggle wishlist { productId }
router.post('/toggle', wishlistController.toggleWishlist);

// DELETE /api/wishlist/:id — remove item
router.delete('/:id', wishlistController.removeFromWishlist);

export default router;
