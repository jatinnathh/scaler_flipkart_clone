import { query } from '../config/db.js';

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats() {
  const [revenueResult, orderResult, userResult, productResult] = await Promise.all([
    query(`SELECT 
      COALESCE(SUM(total), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as paid_revenue,
      COALESCE(SUM(CASE WHEN payment_method = 'cod' THEN total ELSE 0 END), 0) as cod_revenue
    FROM orders WHERE status != 'cancelled'`),
    query(`SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'placed' THEN 1 END) as placed,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
      COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
      COUNT(CASE WHEN status = 'out_for_delivery' THEN 1 END) as out_for_delivery,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
    FROM orders`),
    query(`SELECT COUNT(*) as total_users FROM users`),
    query(`SELECT 
      COUNT(*) as total_products,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
      COUNT(CASE WHEN stock_quantity <= 0 THEN 1 END) as out_of_stock,
      COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 END) as low_stock
    FROM products`),
  ]);

  return {
    revenue: revenueResult[0],
    orders: orderResult[0],
    users: userResult[0],
    products: productResult[0],
  };
}

export async function getRevenueOverTime(days: number = 30) {
  return query(
    `SELECT 
      DATE(placed_at) as date,
      COUNT(*) as order_count,
      COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE placed_at >= NOW() - INTERVAL '${days} days'
      AND status != 'cancelled'
    GROUP BY DATE(placed_at)
    ORDER BY date ASC`
  );
}

export async function getTopSellingProducts(limit: number = 10) {
  return query(
    `SELECT 
      p.id, p.name, p.slug, p.price, p.brand,
      SUM(oi.quantity) as total_sold,
      SUM(oi.total) as total_revenue,
      (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id, p.name, p.slug, p.price, p.brand
    ORDER BY total_sold DESC
    LIMIT $1`,
    [limit]
  );
}

export async function getLowStockProducts() {
  return query(
    `SELECT id, name, slug, brand, stock_quantity, price
    FROM products 
    WHERE stock_quantity <= 5 AND is_active = true
    ORDER BY stock_quantity ASC
    LIMIT 20`
  );
}

export async function getRecentOrders(limit: number = 10) {
  return query(
    `SELECT o.*, u.email, u.first_name, u.last_name,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.placed_at DESC
    LIMIT $1`,
    [limit]
  );
}

// ============================================
// ORDER MANAGEMENT
// ============================================

export async function getAllOrders(params: {
  status?: string;
  search?: string;
  page: number;
  limit: number;
}) {
  const { status, search, page, limit } = params;
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (status && status !== 'all') {
    conditions.push(`o.status = $${paramIndex++}`);
    values.push(status);
  }

  if (search) {
    conditions.push(`(o.order_number ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR o.shipping_name ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [orders, countResult] = await Promise.all([
    query(
      `SELECT o.*, u.email, u.first_name, u.last_name,
        (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.placed_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    ),
    query(
      `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      values
    ),
  ]);

  return {
    orders,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function getAdminOrderById(orderId: string) {
  const orderResult = await query(
    `SELECT o.*, u.email, u.first_name, u.last_name, u.phone as user_phone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = $1`,
    [orderId]
  );
  if (orderResult.length === 0) return null;

  const order = orderResult[0];

  order.items = await query(
    `SELECT oi.*, p.slug as product_slug
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1`,
    [order.id]
  );

  order.timeline = await query(
    `SELECT * FROM order_timeline WHERE order_id = $1 ORDER BY timestamp ASC`,
    [order.id]
  );

  return order;
}

export async function updateOrderStatus(orderId: string, status: string) {
  // Update order status
  await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, orderId]
  );

  // Add timeline entry
  const messages: Record<string, string> = {
    placed: 'Order has been placed',
    confirmed: 'Order has been confirmed by seller',
    shipped: 'Order has been shipped',
    out_for_delivery: 'Order is out for delivery',
    delivered: 'Order has been delivered successfully',
    cancelled: 'Order has been cancelled',
  };

  await query(
    `INSERT INTO order_timeline (order_id, status, message, timestamp)
     VALUES ($1, $2, $3, NOW())`,
    [orderId, status, messages[status] || `Status changed to ${status}`]
  );

  if (status === 'delivered') {
    await query(`UPDATE orders SET delivered_at = NOW() WHERE id = $1`, [orderId]);
  }

  return { success: true };
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

export async function getAllProducts(params: {
  search?: string;
  category?: string;
  page: number;
  limit: number;
}) {
  const { search, category, page, limit } = params;
  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(p.name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }

  if (category) {
    conditions.push(`c.slug = $${paramIndex++}`);
    values.push(category);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [products, countResult] = await Promise.all([
    query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    ),
    query(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      values
    ),
  ]);

  return {
    products,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  mrp: number;
  category_id: number;
  brand?: string;
  stock_quantity: number;
  specifications?: any;
  highlights?: string[];
  images?: string[];
}) {
  const result = await query(
    `INSERT INTO products (name, slug, description, short_description, price, mrp, category_id, brand, stock_quantity, specifications, highlights, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
     RETURNING *`,
    [
      data.name, data.slug, data.description || null, data.short_description || null,
      data.price, data.mrp, data.category_id, data.brand || null,
      data.stock_quantity, JSON.stringify(data.specifications || {}),
      data.highlights || [],
    ]
  );

  const product = result[0];

  // Add images
  if (data.images && data.images.length > 0) {
    for (let i = 0; i < data.images.length; i++) {
      await query(
        `INSERT INTO product_images (product_id, image_url, display_order, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [product.id, data.images[i], i, i === 0]
      );
    }
  }

  return product;
}

export async function updateProduct(productId: number, data: {
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  price?: number;
  mrp?: number;
  category_id?: number;
  brand?: string;
  stock_quantity?: number;
  specifications?: any;
  highlights?: string[];
  images?: string[];
}) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
  if (data.slug !== undefined) { fields.push(`slug = $${paramIndex++}`); values.push(data.slug); }
  if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
  if (data.short_description !== undefined) { fields.push(`short_description = $${paramIndex++}`); values.push(data.short_description); }
  if (data.price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(data.price); }
  if (data.mrp !== undefined) { fields.push(`mrp = $${paramIndex++}`); values.push(data.mrp); }
  if (data.category_id !== undefined) { fields.push(`category_id = $${paramIndex++}`); values.push(data.category_id); }
  if (data.brand !== undefined) { fields.push(`brand = $${paramIndex++}`); values.push(data.brand); }
  if (data.stock_quantity !== undefined) { fields.push(`stock_quantity = $${paramIndex++}`); values.push(data.stock_quantity); }
  if (data.specifications !== undefined) { fields.push(`specifications = $${paramIndex++}`); values.push(JSON.stringify(data.specifications)); }
  if (data.highlights !== undefined) { fields.push(`highlights = $${paramIndex++}`); values.push(data.highlights); }

  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) return null; // only updated_at, nothing to update

  values.push(productId);
  const result = await query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  // Update images if provided
  if (data.images !== undefined) {
    await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
    for (let i = 0; i < data.images.length; i++) {
      await query(
        `INSERT INTO product_images (product_id, image_url, display_order, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [productId, data.images[i], i, i === 0]
      );
    }
  }

  return result[0] || null;
}

export async function toggleProductActive(productId: number) {
  const result = await query(
    `UPDATE products SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, is_active`,
    [productId]
  );
  return result[0] || null;
}

// ============================================
// EMAIL LOGS
// ============================================

export async function logEmail(recipient: string, subject: string, status: 'sent' | 'failed', errorMessage?: string) {
  return query(
    `INSERT INTO email_logs (recipient, subject, status, error_message) VALUES ($1, $2, $3, $4) RETURNING *`,
    [recipient, subject, status, errorMessage || null]
  );
}

export async function getEmailLogs(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  const [logs, countResult] = await Promise.all([
    query(`SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
    query(`SELECT COUNT(*) as total FROM email_logs`),
  ]);

  return {
    logs,
    total: parseInt(countResult[0].total),
    page,
    limit,
    totalPages: Math.ceil(parseInt(countResult[0].total) / limit),
  };
}

// ============================================
// ANALYTICS
// ============================================

export async function getAnalytics() {
  const [revenueByCategory, topCustomers, paymentMethods, avgOrderValue, ordersOverTime] = await Promise.all([
    query(
      `SELECT c.name as category, COALESCE(SUM(oi.total), 0) as revenue, COUNT(DISTINCT oi.order_id) as orders
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY c.name
      ORDER BY revenue DESC`
    ),
    query(
      `SELECT u.id, u.email, u.first_name, u.last_name,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.status != 'cancelled'
      GROUP BY u.id, u.email, u.first_name, u.last_name
      ORDER BY total_spent DESC
      LIMIT 10`
    ),
    query(
      `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
      FROM orders WHERE status != 'cancelled'
      GROUP BY payment_method`
    ),
    query(
      `SELECT COALESCE(AVG(total), 0) as avg_value FROM orders WHERE status != 'cancelled'`
    ),
    query(
      `SELECT 
        DATE(placed_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE placed_at >= NOW() - INTERVAL '30 days' AND status != 'cancelled'
      GROUP BY DATE(placed_at)
      ORDER BY date ASC`
    ),
  ]);

  return {
    revenueByCategory,
    topCustomers,
    paymentMethods,
    avgOrderValue: parseFloat(avgOrderValue[0]?.avg_value || '0'),
    ordersOverTime,
  };
}
