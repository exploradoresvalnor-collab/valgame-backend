import { Request, Response, NextFunction } from 'express';

export function asyncHandler(fn: Function) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  console.error('[ERROR]', err);
  res.status(status).json({ ok: false, error: message });
}

export default errorHandler;
