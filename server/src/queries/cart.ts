import { query } from '../config/db.js';

export async function getCartItems(userId: string) {
  return query(
    `SELECT ci.*, 
            p.name as product_name, 
            p.slug as product_slug,
            p.price, 
            p.mrp, 
            p.discount_percent,
            p.stock_quantity, 
            p.brand,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = $1
     ORDER BY ci.added_at DESC`,
    [userId]
  );
}

export async function getCartCount(userId: string) {
  const result = await query(
    `SELECT COALESCE(SUM(quantity), 0) as count FROM cart_items WHERE user_id = $1`,
    [userId]
  );
  return parseInt(result[0].count);
}

export async function addToCart(userId: string, productId: number, quantity: number = 1) {
  // Upsert — if item exists, increment quantity
  const result = await query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id) 
     DO UPDATE SET quantity = cart_items.quantity + $3, added_at = NOW()
     RETURNING *`,
    [userId, productId, quantity]
  );
  return result[0];
}

export async function updateCartQuantity(itemId: number, userId: string, quantity: number) {
  const result = await query(
    `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [quantity, itemId, userId]
  );
  return result[0] || null;
}

export async function removeCartItem(itemId: number, userId: string) {
  const result = await query(
    `DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *`,
    [itemId, userId]
  );
  return result[0] || null;
}

export async function clearCart(userId: string) {
  return query(`DELETE FROM cart_items WHERE user_id = $1`, [userId]);
}
