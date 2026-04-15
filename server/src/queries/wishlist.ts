import { query } from '../config/db.js';

export async function getWishlistItems(userId: string) {
  return query(
    `SELECT wi.*, 
            p.name as product_name, 
            p.slug as product_slug,
            p.price, 
            p.mrp, 
            p.discount_percent,
            p.stock_quantity, 
            p.brand,
            p.avg_rating,
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as product_image
     FROM wishlist_items wi
     JOIN products p ON wi.product_id = p.id
     WHERE wi.user_id = $1
     ORDER BY wi.added_at DESC`,
    [userId]
  );
}

export async function addToWishlist(userId: string, productId: number) {
  const result = await query(
    `INSERT INTO wishlist_items (user_id, product_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING *`,
    [userId, productId]
  );
  return result[0] || null;
}

export async function removeFromWishlist(itemId: number, userId: string) {
  const result = await query(
    `DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2 RETURNING *`,
    [itemId, userId]
  );
  return result[0] || null;
}

export async function removeFromWishlistByProduct(userId: string, productId: number) {
  const result = await query(
    `DELETE FROM wishlist_items WHERE user_id = $1 AND product_id = $2 RETURNING *`,
    [userId, productId]
  );
  return result[0] || null;
}

export async function isInWishlist(userId: string, productId: number) {
  const result = await query(
    `SELECT id FROM wishlist_items WHERE user_id = $1 AND product_id = $2`,
    [userId, productId]
  );
  return result.length > 0;
}

export async function getWishlistProductIds(userId: string) {
  const result = await query(
    `SELECT product_id FROM wishlist_items WHERE user_id = $1`,
    [userId]
  );
  return result.map((r: any) => r.product_id);
}
