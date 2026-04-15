import { Request, Response, NextFunction } from 'express';
import * as productQueries from '../queries/products.js';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      search: req.query.search as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      brand: req.query.brand as string,
      sortBy: req.query.sortBy as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await productQueries.getProducts(filters);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const product = await productQueries.getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function listBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string;
    const brands = await productQueries.getBrands(category);
    res.json({ success: true, data: brands.map((b: any) => b.brand) });
  } catch (error) {
    next(error);
  }
}

export async function getPriceRange(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string;
    const range = await productQueries.getPriceRange(category);
    res.json({ success: true, data: range });
  } catch (error) {
    next(error);
  }
}
