import 'dotenv/config';
import { query } from '../src/config/db.js';

const TABLES = [
  // 1. Users — synced from Clerk
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // 2. Categories — hierarchical
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // 3. Products
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    discount_percent INTEGER GENERATED ALWAYS AS (
      CASE WHEN mrp > 0 THEN ROUND(((mrp - price) / mrp) * 100) ELSE 0 END
    ) STORED,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    avg_rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    specifications JSONB DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // 4. Product Images
  `CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false
  )`,

  // 5. Addresses
  `CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(500) NOT NULL,
    address_line2 VARCHAR(500),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    landmark VARCHAR(200),
    address_type VARCHAR(20) DEFAULT 'home' CHECK (address_type IN ('home', 'work', 'other')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // 6. Cart Items
  `CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 1),
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  )`,

  // 7. Wishlist Items
  `CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
  )`,

  // 8. Orders
  `CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
    shipping_name VARCHAR(200) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_pincode VARCHAR(10) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled')),
    payment_method VARCHAR(20) DEFAULT 'cod' CHECK (payment_method IN ('razorpay', 'cod')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    placed_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // 9. Order Items
  `CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(500) NOT NULL,
    product_image TEXT,
    price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL
  )`,

  // 10. Reviews
  `CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    body TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // 11. Recently Viewed
  `CREATE TABLE IF NOT EXISTS recently_viewed (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW()
  )`,

  // 12. Order Timeline
  `CREATE TABLE IF NOT EXISTS order_timeline (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    message TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
  )`,

  // 13. Email Logs
  `CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
  )`,
];

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`,
  `CREATE INDEX IF NOT EXISTS idx_products_rating ON products(avg_rating DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(brand, '')))`,
  `CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id, viewed_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_order_timeline_order ON order_timeline(order_id, timestamp ASC)`,
  `CREATE INDEX IF NOT EXISTS idx_users_clerk ON users(clerk_id)`,
];

async function migrate() {
  console.log('🔄 Starting database migration...\n');

  for (let i = 0; i < TABLES.length; i++) {
    const tableName = TABLES[i].match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `table_${i + 1}`;
    try {
      await query(TABLES[i]);
      console.log(`  ✅ Created table: ${tableName}`);
    } catch (error: any) {
      console.error(`  ❌ Error creating ${tableName}:`, error.message);
    }
  }

  console.log('\n📇 Creating indexes...\n');

  for (const idx of INDEXES) {
    const indexName = idx.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1] || 'unknown';
    try {
      await query(idx);
      console.log(`  ✅ Created index: ${indexName}`);
    } catch (error: any) {
      console.error(`  ❌ Error creating index ${indexName}:`, error.message);
    }
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
