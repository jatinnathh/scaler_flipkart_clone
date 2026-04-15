import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { razorpay } from '../config/razorpay.js';
import * as orderQueries from '../queries/orders.js';

export async function createRazorpayOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ success: false, error: 'Missing payment verification fields' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      // Update order as failed
      await orderQueries.updateOrderPayment(order_id, {
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'failed',
      });
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Update order as paid
    const order = await orderQueries.updateOrderPayment(order_id, {
      razorpay_payment_id,
      razorpay_signature,
      payment_status: 'paid',
    });

    res.json({ success: true, data: order, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
}
