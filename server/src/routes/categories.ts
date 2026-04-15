import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// GET /api/categories — all categories (hierarchical by default, flat with ?flat=true)
router.get('/', categoryController.listCategories);

// GET /api/categories/:slug — single category
router.get('/:slug', categoryController.getCategory);

export default router;
