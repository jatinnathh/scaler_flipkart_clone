import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as orderController from '../controllers/orderController.js';

const router = Router();

// All order routes require authentication
router.use(protect, resolveUser);

// GET /api/orders — get user's order history
router.get('/', orderController.getOrders);

// POST /api/orders — place order { address_id, payment_method, razorpay_order_id? }
router.post('/', orderController.placeOrder);

// GET /api/orders/:id — single order with items + timeline
router.get('/:id', orderController.getOrder);

export default router;
