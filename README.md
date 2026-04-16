# Flipkart Clone — Full-Stack E-Commerce Platform


A e-commerce web application that replicates Flipkart's design, UI patterns, and user experience. Built with Next.js 16, Express.js, and PostgreSQL.

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | [Vercel Deployment](https://jatinscaler.vercel.app) |


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 + Custom CSS Design System |
| Authentication | Clerk (OAuth, Email) |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (Neon Serverless) |
| Payments | Razorpay (Test Mode) |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (Frontend) + Render (Backend) |

---

## Features

### Core Features

| Feature | Details |
|---------|---------|
| Product Listing | Grid layout with Flipkart-style cards, search by name, filter by category/brand/price, multiple sort options |
| Product Detail | Image gallery with vertical thumbnails, specifications, highlights, price with MRP/discount, stock status, Add to Cart and Buy Now |
| Shopping Cart | View items, update quantity, remove items, price summary with subtotal, discount, shipping, and total |
| Order Placement | Multi-step checkout (Address, Summary, Payment), shipping address form, order review, order confirmation with Order ID |

### Bonus Features

| Feature | Details |
|---------|---------|
| Responsive Design | Mobile, tablet, desktop — adaptive navbar, mobile menu, responsive grids |
| User Authentication | Clerk — Login/Signup via Email, Google OAuth |
| Order History | Past orders with status timeline (placed, confirmed, shipped, delivered) |
| Wishlist | Add/remove products, dedicated wishlist page, heart icon on cards |
| Email Notification | HTML email via Gmail SMTP on order placement with order details and shipping info |

### Additional Features

| Feature | Details |
|---------|---------|
| Razorpay Payments | UPI, Credit/Debit Cards, Net Banking, Wallets (test mode) |
| Cash on Delivery | COD alongside online payment |
| Admin Dashboard | Dashboard stats, order management, product CRUD, email logs, analytics |
| Reviews and Ratings | Rating distribution, review list, rating badges |
| Dark Mode | Theme toggle persisted in localStorage |
| Skeleton Loading | Content placeholders during data fetch |
| Pagination | Paginated product listings |
| Stock Management | Stock validation, low-stock warnings, out-of-stock handling |
| Order Timeline | Placed, Confirmed, Shipped, Out for Delivery, Delivered |

---

## Database Schema

13 tables with proper relationships, constraints, indexes, and generated columns.

```
users ──────┬──── addresses
(Clerk)     ├──── cart_items ────── products ──── categories (hierarchical)
            ├──── wishlist_items       ├──── product_images
            ├──── orders               ├──── reviews
            │       ├── order_items    │
            │       └── order_timeline │
            └──── recently_viewed ─────┘

email_logs (standalone)
```

| Table | Purpose |
|-------|---------|
| `users` | Profiles synced from Clerk via webhooks |
| `categories` | Hierarchical categories with self-referencing `parent_id` |
| `products` | Catalog with computed `discount_percent` (generated column) |
| `product_images` | Multiple images per product with display ordering |
| `addresses` | Shipping addresses (home, work, other) |
| `cart_items` | Cart with unique user-product constraint |
| `wishlist_items` | Wishlist with unique user-product constraint |
| `orders` | Orders with Razorpay/COD payment tracking |
| `order_items` | Snapshot of purchased products |
| `order_timeline` | Status progression with timestamps |
| `reviews` | Ratings (1-5) and text reviews |
| `recently_viewed` | Recently viewed product tracking |
| `email_logs` | Email delivery log (success/failure) |

16 performance indexes on product search (GIN), slug, category, brand, price, rating, and user-scoped lookups.

---

## Project Structure

```
flipkart_clone/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Sign-in, Sign-up (Clerk)
│   ├── (main)/                   # Main pages
│   │   ├── page.tsx              # Homepage
│   │   ├── product/[slug]/       # Product detail
│   │   ├── cart/                 # Cart
│   │   ├── checkout/             # Multi-step checkout
│   │   ├── orders/               # Order history and detail
│   │   ├── wishlist/             # Wishlist
│   │   ├── search/               # Search with filters
│   │   └── category/             # Category listing
│   ├── admin/                    # Admin dashboard
│   └── globals.css               # Design system
├── components/                   # Reusable UI components
├── context/                      # Cart, Toast, Admin Auth contexts
├── hooks/                        # Custom hooks (useWishlist)
├── lib/                          # API client, utilities, constants
├── server/
│   ├── src/
│   │   ├── index.ts              # Express entry point
│   │   ├── config/               # DB, email, CORS, Razorpay
│   │   ├── controllers/          # 11 route handlers
│   │   ├── queries/              # 9 database query modules
│   │   ├── routes/               # 12 Express routers
│   │   └── middleware/           # Auth, admin auth, error handler
│   └── scripts/
│       ├── migrate.ts            # Schema migration
│       └── seed.ts               # Sample data seeder
└── types/                        # TypeScript definitions
```

---

## API Endpoints

### Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (search, filter, sort, paginate) |
| GET | `/api/products/:slug` | Product detail with images and specs |
| GET | `/api/categories` | Category tree |
| GET | `/api/reviews?productId=` | Product reviews |

### Authenticated (Clerk JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | `/api/cart` | Cart CRUD |
| GET/POST/DELETE | `/api/wishlist` | Wishlist operations |
| GET/POST | `/api/orders` | Order history and placement |
| GET/POST/PUT/DELETE | `/api/addresses` | Address management |
| POST | `/api/razorpay/create-order` | Create payment order |
| POST | `/api/razorpay/verify` | Verify payment |

### Admin (JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Stats overview |
| GET/PATCH | `/api/admin/orders` | Order management |
| GET/POST/PATCH | `/api/admin/products` | Product CRUD |
| GET | `/api/admin/emails` | Email logs |
| GET | `/api/admin/analytics` | Analytics |

---

## Design Decisions

- **Flipkart-faithful UI** — Blue primary (#2874F0), green price badges, product card layout, and checkout flow mirror the live Flipkart design.
- **Computed discount** — `discount_percent` is a PostgreSQL `GENERATED ALWAYS AS` column for data consistency.
- **Order timeline** — Simulated delivery progression (confirmed 1h, shipped 24h, delivered 96h after placement).
- **Context-based state** — Cart, Toast, and Admin Auth use React Context without external state libraries.
- **Skeleton loading** — All pages show skeleton placeholders during fetch, matching Flipkart's pattern.

## Assumptions

1. Clerk handles authentication; user profiles sync via webhooks or lazily on first API call.
2. Razorpay runs in test mode — no real money is charged.
3. Emails are sent via Gmail SMTP with App Password.
4. Admin uses hardcoded credentials (`admin@gmail.com` / `admin123`).
5. Product images are sourced from public URLs via the seed script.

---

