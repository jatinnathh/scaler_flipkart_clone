import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as reviewController from '../controllers/reviewController.js';

const router = Router();

// GET /api/reviews?productId=X — public
router.get('/', reviewController.getReviews);

// POST /api/reviews — protected (must have purchased)
router.post('/', protect, resolveUser, reviewController.createReview);

export default router;
