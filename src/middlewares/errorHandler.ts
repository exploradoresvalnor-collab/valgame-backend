import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors/AppError';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle unknown errors
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
    timestamp: new Date().toISOString()
  });
};
