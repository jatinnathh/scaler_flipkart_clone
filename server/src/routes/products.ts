import { Router } from 'express';
import * as productController from '../controllers/productController.js';

const router = Router();

// GET /api/products — list with search, filter, sort, pagination
router.get('/', productController.listProducts);

// GET /api/products/brands — unique brands for filters
router.get('/brands', productController.listBrands);

// GET /api/products/price-range — min/max price for filters
router.get('/price-range', productController.getPriceRange);

// GET /api/products/:slug — single product detail
router.get('/:slug', productController.getProduct);

export default router;
