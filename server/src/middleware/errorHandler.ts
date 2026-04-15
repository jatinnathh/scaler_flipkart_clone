import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Clerk auth errors
  if (err.message === 'Unauthenticated') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in.',
    });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS: Origin not allowed',
    });
  }

  // Validation errors
  if (err.status === 400 || err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message || 'Invalid request data',
    });
  }

  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Resource already exists',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Referenced resource not found',
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message || 'Internal server error',
  });
}
