import { query } from '../config/db.js';

export async function getProductReviews(productId: number) {
  const reviews = await query(
    `SELECT r.*, u.first_name, u.last_name, u.avatar_url
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );

  // Get rating distribution
  const distribution = await query(
    `SELECT rating, COUNT(*) as count FROM reviews WHERE product_id = $1 GROUP BY rating ORDER BY rating DESC`,
    [productId]
  );

  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const found = distribution.find((d: any) => parseInt(d.rating) === rating);
    const count = found ? parseInt(found.count) : 0;
    return {
      rating,
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    };
  });

  return { reviews, ratingDistribution };
}

export async function createReview(userId: string, data: {
  product_id: number;
  order_id?: string;
  rating: number;
  title?: string;
  body?: string;
}) {
  // Verify user has ordered this product
  const orderCheck = await query(
    `SELECT oi.id FROM order_items oi 
     JOIN orders o ON oi.order_id = o.id
     WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status != 'cancelled'
     LIMIT 1`,
    [userId, data.product_id]
  );

  if (orderCheck.length === 0) {
    throw Object.assign(new Error('You can only review products you have purchased'), { status: 400 });
  }

  const result = await query(
    `INSERT INTO reviews (user_id, product_id, order_id, rating, title, body)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, data.product_id, data.order_id || null, data.rating, data.title || null, data.body || null]
  );

  // Update product avg rating
  const avgResult = await query(
    `SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings, 
            COUNT(CASE WHEN body IS NOT NULL AND body != '' THEN 1 END) as total_reviews
     FROM reviews WHERE product_id = $1`,
    [data.product_id]
  );

  await query(
    `UPDATE products SET avg_rating = $1, total_ratings = $2, total_reviews = $3, updated_at = NOW()
     WHERE id = $4`,
    [
      parseFloat(avgResult[0].avg_rating).toFixed(1),
      parseInt(avgResult[0].total_ratings),
      parseInt(avgResult[0].total_reviews),
      data.product_id
    ]
  );

  return result[0];
}
