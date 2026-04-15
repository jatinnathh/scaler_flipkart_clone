import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

// Public: admin login
router.post('/login', adminController.login);

// All routes below require admin JWT
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.patch('/products/:id', adminController.updateProduct);
router.patch('/products/:id/toggle', adminController.toggleProduct);

// Categories (for forms)
router.get('/categories', adminController.getCategories);

// Email logs
router.get('/emails', adminController.getEmailLogs);

// Analytics
router.get('/analytics', adminController.getAnalytics);

export default router;
