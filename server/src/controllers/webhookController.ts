import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { query } from '../config/db.js';

export async function handleClerkWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('CLERK_WEBHOOK_SECRET not set');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Get the headers
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Verify the webhook
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: any;

    try {
      evt = wh.verify(req.body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    const eventType = evt.type;
    const data = evt.data;

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = data;
      
      const email = email_addresses?.[0]?.email_address || '';
      const phone = phone_numbers?.[0]?.phone_number || null;

      await query(
        `INSERT INTO users (clerk_id, email, first_name, last_name, phone, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (clerk_id)
         DO UPDATE SET email = $2, first_name = $3, last_name = $4, phone = $5, avatar_url = $6, updated_at = NOW()`,
        [id, email, first_name || null, last_name || null, phone, image_url || null]
      );

      console.log(`User ${eventType}: ${id} (${email})`);
    }

    if (eventType === 'user.deleted') {
      const { id } = data;
      await query(`DELETE FROM users WHERE clerk_id = $1`, [id]);
      console.log(`User deleted: ${id}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
}
