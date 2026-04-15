import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as recController from '../controllers/recommendationController.js';

const router = Router();

// All recommendation routes require authentication
router.use(protect, resolveUser);

// GET /api/recommendations — personalized recommendations
router.get('/', recController.getRecommendations);

// POST /api/recently-viewed — track a product view
router.post('/recently-viewed', recController.trackRecentlyViewed);

// GET /api/recently-viewed — get recently viewed products
router.get('/recently-viewed', recController.getRecentlyViewed);

export default router;
