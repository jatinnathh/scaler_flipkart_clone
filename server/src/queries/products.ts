import { query } from '../config/db.js';

// Get all products with filtering, search, sort, and pagination
export async function getProducts(filters: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  const { search, category, minPrice, maxPrice, brand, sortBy = 'newest', page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  let conditions: string[] = ['p.is_active = true'];
  let params: any[] = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`to_tsvector('english', p.name || ' ' || COALESCE(p.brand, '')) @@ plainto_tsquery('english', $${paramIndex})`);
    params.push(search);
    paramIndex++;
  }

  if (category) {
    conditions.push(`c.slug = $${paramIndex}`);
    params.push(category);
    paramIndex++;
  }

  if (minPrice !== undefined) {
    conditions.push(`p.price >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice !== undefined) {
    conditions.push(`p.price <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  if (brand) {
    conditions.push(`p.brand = $${paramIndex}`);
    params.push(brand);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderClause = 'ORDER BY p.created_at DESC';
  switch (sortBy) {
    case 'price_asc': orderClause = 'ORDER BY p.price ASC'; break;
    case 'price_desc': orderClause = 'ORDER BY p.price DESC'; break;
    case 'rating': orderClause = 'ORDER BY p.avg_rating DESC'; break;
    case 'newest': orderClause = 'ORDER BY p.created_at DESC'; break;
    case 'discount': orderClause = 'ORDER BY p.discount_percent DESC'; break;
  }

  // Count query
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
  `;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult[0].total);

  // Data query with primary image
  const dataQuery = `
    SELECT p.*, 
           c.name as category_name, 
           c.slug as category_slug,
           (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limit, offset);

  const products = await query(dataQuery, params);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Get single product by slug with all images
export async function getProductBySlug(slug: string) {
  const productResult = await query(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.slug = $1 AND p.is_active = true`,
    [slug]
  );

  if (productResult.length === 0) return null;

  const product = productResult[0];

  // Get all images
  const images = await query(
    `SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order ASC`,
    [product.id]
  );

  // Get related products from same category
  const related = await query(
    `SELECT p.*, 
            (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as primary_image
     FROM products p
     WHERE p.category_id = $1 AND p.id != $2 AND p.is_active = true
     ORDER BY p.avg_rating DESC
     LIMIT 8`,
    [product.category_id, product.id]
  );

  return { ...product, images, relatedProducts: related };
}

// Get all unique brands for filter sidebar
export async function getBrands(categorySlug?: string) {
  let q = `SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND is_active = true`;
  const params: any[] = [];

  if (categorySlug) {
    q += ` AND category_id = (SELECT id FROM categories WHERE slug = $1)`;
    params.push(categorySlug);
  }

  q += ` ORDER BY brand ASC`;
  return query(q, params);
}

// Get price range for filter
export async function getPriceRange(categorySlug?: string) {
  let q = `SELECT MIN(price) as min_price, MAX(price) as max_price FROM products WHERE is_active = true`;
  const params: any[] = [];

  if (categorySlug) {
    q += ` AND category_id = (SELECT id FROM categories WHERE slug = $1)`;
    params.push(categorySlug);
  }

  const result = await query(q, params);
  return result[0];
}
