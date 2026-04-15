import { Router } from 'express';
import productRoutes from './products.js';
import categoryRoutes from './categories.js';
import cartRoutes from './cart.js';
import wishlistRoutes from './wishlist.js';
import orderRoutes from './orders.js';
import addressRoutes from './addresses.js';
import reviewRoutes from './reviews.js';
import razorpayRoutes from './razorpay.js';
import recommendationRoutes from './recommendations.js';
import webhookRoutes from './webhooks.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/addresses', addressRoutes);
router.use('/reviews', reviewRoutes);
router.use('/razorpay', razorpayRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/webhooks', webhookRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
