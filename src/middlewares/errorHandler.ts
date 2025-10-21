import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || 'Internal Server Error';

  // Log detallado para depuración
  console.error('\n==================== UNHANDLED ERROR ====================');
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('Error Message:', message);
  console.error('Error Status:', status);
  
  // Imprimir el stack trace si está disponible
  if (err.stack) {
    console.error('Stack Trace:');
    console.error(err.stack);
  } else {
    console.error('Full Error Object:', err);
  }
  
  console.error('=========================================================\n');

  // No enviar el stack trace en producción
  const errorResponse = {
    ok: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(status).json(errorResponse);
};

export default errorHandler;
