import { query } from '../config/db.js';

// Track a product view
export async function trackView(userId: string, productId: number) {
  // Delete existing entry for this product (to move it to top)
  await query(
    `DELETE FROM recently_viewed WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );

  // Insert new entry
  await query(
    `INSERT INTO recently_viewed (user_id, product_id) VALUES ($1, $2)`,
    [userId, productId]
  );

  // Keep only last 20 views
  await query(
    `DELETE FROM recently_viewed WHERE user_id = $1 AND id NOT IN (
       SELECT id FROM recently_viewed WHERE user_id = $1 ORDER BY viewed_at DESC LIMIT 20
     )`,
    [userId]
  );
}

// Get recently viewed products
export async function getRecentlyViewed(userId: string, limit: number = 10) {
  return query(
    `SELECT rv.*, p.name as product_name, p.slug as product_slug, p.price, p.mrp, p.discount_percent, p.avg_rating,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image
     FROM recently_viewed rv
     JOIN products p ON rv.product_id = p.id
     WHERE rv.user_id = $1 AND p.is_active = true
     ORDER BY rv.viewed_at DESC
     LIMIT $2`,
    [userId, limit]
  );
}

// Get personalized recommendations based on purchase history and browsing
export async function getRecommendations(userId: string, limit: number = 12) {
  // Strategy: find products in categories the user has purchased from or viewed,
  // excluding products they already own
  const recommendations = await query(
    `WITH user_categories AS (
       -- Categories from past orders
       SELECT DISTINCT p.category_id, 3 as weight
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1

       UNION ALL

       -- Categories from recently viewed
       SELECT DISTINCT p.category_id, 1 as weight
       FROM recently_viewed rv
       JOIN products p ON rv.product_id = p.id
       WHERE rv.user_id = $1
     ),
     weighted_categories AS (
       SELECT category_id, SUM(weight) as total_weight
       FROM user_categories
       WHERE category_id IS NOT NULL
       GROUP BY category_id
       ORDER BY total_weight DESC
     ),
     purchased_products AS (
       SELECT DISTINCT oi.product_id
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = $1
     )
     SELECT p.*, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image,
            wc.total_weight
     FROM products p
     JOIN weighted_categories wc ON p.category_id = wc.category_id
     WHERE p.is_active = true 
       AND p.id NOT IN (SELECT product_id FROM purchased_products)
       AND p.stock_quantity > 0
     ORDER BY wc.total_weight DESC, p.avg_rating DESC, p.total_ratings DESC
     LIMIT $2`,
    [userId, limit]
  );

  // If no personalized recommendations, return top-rated products
  if (recommendations.length === 0) {
    return query(
      `SELECT p.*, 
              (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
       FROM products p
       WHERE p.is_active = true AND p.stock_quantity > 0
       ORDER BY p.avg_rating DESC, p.total_ratings DESC
       LIMIT $1`,
      [limit]
    );
  }

  return recommendations;
}
