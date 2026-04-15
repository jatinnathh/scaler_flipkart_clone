import { Router } from 'express';
import { protect, resolveUser } from '../middleware/auth.js';
import * as addressController from '../controllers/addressController.js';

const router = Router();

// All address routes require authentication
router.use(protect, resolveUser);

// GET /api/addresses
router.get('/', addressController.getAddresses);

// POST /api/addresses
router.post('/', addressController.createAddress);

// PATCH /api/addresses/:id
router.patch('/:id', addressController.updateAddress);

// DELETE /api/addresses/:id
router.delete('/:id', addressController.deleteAddress);

export default router;
