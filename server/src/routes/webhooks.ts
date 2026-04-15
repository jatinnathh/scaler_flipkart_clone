import { Router } from 'express';
import * as webhookController from '../controllers/webhookController.js';

const router = Router();

// POST /api/webhooks/clerk — Clerk user sync webhook
// Note: raw body parsing is configured in index.ts for this route
router.post('/clerk', webhookController.handleClerkWebhook);

export default router;
