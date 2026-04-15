import { query } from '../config/db.js';

export async function getAllCategories() {
  const categories = await query(
    `SELECT * FROM categories WHERE is_active = true ORDER BY name ASC`
  );
  
  // Build tree structure
  const categoryMap = new Map<number, any>();
  const roots: any[] = [];
  
  categories.forEach((cat: any) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });
  
  categories.forEach((cat: any) => {
    const node = categoryMap.get(cat.id);
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  return roots;
}

export async function getCategoryBySlug(slug: string) {
  const result = await query(
    `SELECT * FROM categories WHERE slug = $1 AND is_active = true`,
    [slug]
  );
  return result[0] || null;
}

// Get flat list of all categories (for filters)
export async function getFlatCategories() {
  return query(
    `SELECT id, name, slug, parent_id, image_url FROM categories WHERE is_active = true ORDER BY name ASC`
  );
}
