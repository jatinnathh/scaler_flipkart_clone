import { query } from '../config/db.js';

// Generate human-readable order number like "FK-20260414-A1B2"
function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FK-${date}-${random}`;
}

export async function createOrder(userId: string, data: {
  address_id: number;
  payment_method: 'razorpay' | 'cod';
  razorpay_order_id?: string;
}) {
  // Get cart items with current prices
  const cartItems = await query(
    `SELECT ci.*, p.name, p.price, p.mrp, p.stock_quantity, p.slug,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = $1`,
    [userId]
  );

  if (cartItems.length === 0) {
    throw Object.assign(new Error('Cart is empty'), { status: 400 });
  }

  // Validate stock
  for (const item of cartItems) {
    if (item.stock_quantity < item.quantity) {
      throw Object.assign(
        new Error(`Insufficient stock for "${item.name}". Available: ${item.stock_quantity}`),
        { status: 400 }
      );
    }
  }

  // Get address
  const address = await query(
    `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
    [data.address_id, userId]
  );
  if (address.length === 0) {
    throw Object.assign(new Error('Address not found'), { status: 404 });
  }
  const addr = address[0];

  // Calculate totals
  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.mrp * item.quantity), 0);
  const itemTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const discount = subtotal - itemTotal;
  const shippingFee = itemTotal >= 500 ? 0 : 40;
  const total = itemTotal + shippingFee;

  const orderNumber = generateOrderNumber();
  const paymentStatus = data.payment_method === 'cod' ? 'pending' : 'pending';

  // Create order
  const orderResult = await query(
    `INSERT INTO orders (order_number, user_id, address_id, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, subtotal, discount, shipping_fee, total, status, payment_method, payment_status, razorpay_order_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'placed', $14, $15, $16)
     RETURNING *`,
    [
      orderNumber, userId, data.address_id,
      addr.full_name, addr.phone,
      `${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}${addr.landmark ? ', Near ' + addr.landmark : ''}`,
      addr.city, addr.state, addr.pincode,
      subtotal, discount, shippingFee, total,
      data.payment_method, paymentStatus,
      data.razorpay_order_id || null
    ]
  );
  const order = orderResult[0];

  // Create order items
  for (const item of cartItems) {
    await query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, mrp, quantity, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [order.id, item.product_id, item.name, item.image, item.price, item.mrp, item.quantity, item.price * item.quantity]
    );

    // Reduce stock
    await query(
      `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
      [item.quantity, item.product_id]
    );
  }

  // Create initial timeline entry
  await query(
    `INSERT INTO order_timeline (order_id, status, message)
     VALUES ($1, 'placed', 'Your order has been placed successfully')`,
    [order.id]
  );

  // Simulate future timeline entries (confirmed after 1 hour, shipped after 1 day, etc.)
  const now = new Date();
  const timelineEntries = [
    { status: 'confirmed', message: 'Your order has been confirmed', hours: 1 },
    { status: 'shipped', message: 'Your order has been shipped', hours: 24 },
    { status: 'out_for_delivery', message: 'Your order is out for delivery', hours: 72 },
    { status: 'delivered', message: 'Your order has been delivered', hours: 96 },
  ];

  for (const entry of timelineEntries) {
    const timestamp = new Date(now.getTime() + entry.hours * 60 * 60 * 1000);
    await query(
      `INSERT INTO order_timeline (order_id, status, message, timestamp)
       VALUES ($1, $2, $3, $4)`,
      [order.id, entry.status, entry.message, timestamp.toISOString()]
    );
  }

  // Clear cart
  await query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);

  return order;
}

export async function getOrders(userId: string) {
  const orders = await query(
    `SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC`,
    [userId]
  );

  // Get items for each order
  for (const order of orders) {
    const items = await query(
      `SELECT oi.*, p.slug as product_slug 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = items;

    // Get current status from timeline (latest entry that's in the past)
    const currentStatus = await query(
      `SELECT * FROM order_timeline 
       WHERE order_id = $1 AND timestamp <= NOW()
       ORDER BY timestamp DESC LIMIT 1`,
      [order.id]
    );
    if (currentStatus.length > 0) {
      order.status = currentStatus[0].status;
    }
  }

  return orders;
}

export async function getOrderById(orderId: string, userId: string) {
  const orderResult = await query(
    `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
    [orderId, userId]
  );

  if (orderResult.length === 0) return null;
  const order = orderResult[0];

  // Get items
  order.items = await query(
    `SELECT oi.*, p.slug as product_slug 
     FROM order_items oi 
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = $1`,
    [order.id]
  );

  // Get timeline
  order.timeline = await query(
    `SELECT * FROM order_timeline WHERE order_id = $1 ORDER BY timestamp ASC`,
    [order.id]
  );

  // Update status based on timeline
  const currentStatus = await query(
    `SELECT * FROM order_timeline 
     WHERE order_id = $1 AND timestamp <= NOW()
     ORDER BY timestamp DESC LIMIT 1`,
    [order.id]
  );
  if (currentStatus.length > 0) {
    order.status = currentStatus[0].status;
    // Update the orders table too
    await query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`, [order.status, order.id]);
    if (order.status === 'delivered' && !order.delivered_at) {
      await query(`UPDATE orders SET delivered_at = NOW() WHERE id = $1`, [order.id]);
    }
  }

  return order;
}

export async function updateOrderPayment(orderId: string, data: {
  razorpay_payment_id: string;
  razorpay_signature: string;
  payment_status: string;
}) {
  const result = await query(
    `UPDATE orders SET razorpay_payment_id = $1, razorpay_signature = $2, payment_status = $3, updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [data.razorpay_payment_id, data.razorpay_signature, data.payment_status, orderId]
  );
  return result[0] || null;
}
