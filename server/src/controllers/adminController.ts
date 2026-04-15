import { Request, Response, NextFunction } from 'express';
import { generateAdminToken } from '../middleware/adminAuth.js';
import * as adminQueries from '../queries/admin.js';
import { query } from '../config/db.js';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

// ---- LOGIN ----
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateAdminToken(email);
    res.json({ success: true, data: { token, email } });
  } catch (error) {
    next(error);
  }
}

// ---- DASHBOARD ----
export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const [stats, revenueOverTime, topSelling, lowStock, recentOrders] = await Promise.all([
      adminQueries.getDashboardStats(),
      adminQueries.getRevenueOverTime(30),
      adminQueries.getTopSellingProducts(10),
      adminQueries.getLowStockProducts(),
      adminQueries.getRecentOrders(10),
    ]);

    res.json({
      success: true,
      data: { stats, revenueOverTime, topSelling, lowStock, recentOrders },
    });
  } catch (error) {
    next(error);
  }
}

// ---- ORDERS ----
export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const result = await adminQueries.getAllOrders({
      status: status as string,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await adminQueries.getAdminOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    await adminQueries.updateOrderStatus(req.params.id, status);
    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
}

// ---- PRODUCTS ----
export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, category, page = '1', limit = '20' } = req.query;
    const result = await adminQueries.getAllProducts({
      search: search as string,
      category: category as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, short_description, price, mrp, category_id, brand, stock_quantity, specifications, highlights, images } = req.body;

    if (!name || !price || !mrp || !category_id) {
      return res.status(400).json({ success: false, error: 'Name, price, MRP, and category are required' });
    }

    // Auto-generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Math.random().toString(36).substring(2, 6);

    const product = await adminQueries.createProduct({
      name, slug, description, short_description,
      price: parseFloat(price), mrp: parseFloat(mrp),
      category_id: parseInt(category_id),
      brand, stock_quantity: parseInt(stock_quantity || '0'),
      specifications, highlights, images,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = parseInt(req.params.id);
    const product = await adminQueries.updateProduct(productId, req.body);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function toggleProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = parseInt(req.params.id);
    const result = await adminQueries.toggleProductActive(productId);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: result, message: `Product ${result.is_active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
}

// ---- CATEGORIES (for product forms) ----
export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await query(`SELECT id, name, slug FROM categories ORDER BY name ASC`);
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

// ---- EMAIL LOGS ----
export async function getEmailLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '20' } = req.query;
    const result = await adminQueries.getEmailLogs(parseInt(page as string), parseInt(limit as string));
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

// ---- ANALYTICS ----
export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await adminQueries.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
}
