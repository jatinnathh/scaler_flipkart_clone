// ============================================
// FLIPKART CLONE — SHARED TYPES
// ============================================

// ---- User ----
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Category ----
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  children?: Category[];
}

// ---- Product ----
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  mrp: number;
  discount_percent: number;
  category_id: number | null;
  category_name?: string;
  category_slug?: string;
  brand: string | null;
  stock_quantity: number;
  is_active: boolean;
  avg_rating: number;
  total_ratings: number;
  total_reviews: number;
  specifications: Record<string, Record<string, string>>;
  highlights: string[];
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'discount';
  page?: number;
  limit?: number;
}

// ---- Cart ----
export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  added_at: string;
  // Joined product fields
  product_name: string;
  product_slug: string;
  product_image: string;
  price: number;
  mrp: number;
  discount_percent: number;
  stock_quantity: number;
  brand: string | null;
}

export interface CartSummary {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  savings: number;
}

// ---- Wishlist ----
export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  added_at: string;
  // Joined product fields
  product_name: string;
  product_slug: string;
  product_image: string;
  price: number;
  mrp: number;
  discount_percent: number;
  stock_quantity: number;
  brand: string | null;
  avg_rating: number;
}

// ---- Address ----
export interface Address {
  id: number;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  address_type: 'home' | 'work' | 'other';
  is_default: boolean;
  created_at: string;
}

// ---- Order ----
export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  address_id: number | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  payment_method: 'razorpay' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  placed_at: string;
  delivered_at: string | null;
  updated_at: string;
  items?: OrderItem[];
  timeline?: OrderTimelineEntry[];
}

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  price: number;
  mrp: number;
  quantity: number;
  total: number;
  product_slug?: string;
}

export interface OrderTimelineEntry {
  id: number;
  order_id: string;
  status: string;
  message: string | null;
  timestamp: string;
}

// ---- Review ----
export interface Review {
  id: number;
  user_id: string | null;
  product_id: number;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  // Joined user fields
  user_name?: string;
  user_avatar?: string;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

// ---- Recently Viewed ----
export interface RecentlyViewed {
  id: number;
  user_id: string;
  product_id: number;
  viewed_at: string;
  // Joined product fields
  product_name: string;
  product_slug: string;
  product_image: string;
  price: number;
  mrp: number;
  discount_percent: number;
}

// ---- Razorpay ----
export interface RazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}

// ---- API Response Wrapper ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
