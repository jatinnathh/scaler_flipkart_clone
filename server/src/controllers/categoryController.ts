import { Request, Response, NextFunction } from 'express';
import * as categoryQueries from '../queries/categories.js';

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const flat = req.query.flat === 'true';
    const categories = flat 
      ? await categoryQueries.getFlatCategories()
      : await categoryQueries.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const category = await categoryQueries.getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}
