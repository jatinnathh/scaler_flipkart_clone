import { Request, Response, NextFunction } from 'express';
import * as orderQueries from '../queries/orders.js';
import { sendOrderConfirmationEmail } from '../config/email.js';

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const orders = await orderQueries.getOrders(user.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const order = await orderQueries.getOrderById(id, user.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function placeOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { address_id, payment_method = 'cod', razorpay_order_id } = req.body;

    if (!address_id) {
      return res.status(400).json({ success: false, error: 'address_id is required' });
    }

    const order = await orderQueries.createOrder(user.id, {
      address_id,
      payment_method,
      razorpay_order_id,
    });

    // Get order details for email
    const fullOrder = await orderQueries.getOrderById(order.id, user.id);
    if (fullOrder && user.email) {
      sendOrderConfirmationEmail(user.email, {
        order_number: fullOrder.order_number,
        total: parseFloat(fullOrder.total),
        items: (fullOrder.items || []).map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price),
        })),
        shipping_name: fullOrder.shipping_name,
        shipping_address: fullOrder.shipping_address,
        shipping_city: fullOrder.shipping_city,
        shipping_state: fullOrder.shipping_state,
        shipping_pincode: fullOrder.shipping_pincode,
        payment_method: fullOrder.payment_method,
      });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
