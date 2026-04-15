import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as razorpayController from '../controllers/razorpayController.js';

const router = Router();

// All payment routes require authentication
router.use(protect, resolveUser);

// POST /api/razorpay/create-order — create Razorpay order
router.post('/create-order', razorpayController.createRazorpayOrder);

// POST /api/razorpay/verify — verify payment signature
router.post('/verify', razorpayController.verifyPayment);

export default router;
