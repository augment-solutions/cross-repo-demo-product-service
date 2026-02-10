import express, { Express, Request, Response, NextFunction } from 'express';
import 'express-async-errors';

import { config } from './config';
import { logger } from './utils/logger';
import { createProductRoutes } from './routes/productRoutes';
import { ProductService } from './services/ProductService';

export function createApp(productService: ProductService): Express {
  const app = express();

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-ID', (req as any).id);
    next();
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: config.serviceName,
      version: config.serviceVersion,
      timestamp: new Date().toISOString(),
    });
  });

  // Readiness check
  app.get('/ready', (req: Request, res: Response) => {
    res.json({
      status: 'ready',
      service: config.serviceName,
    });
  });

  // Product routes
  app.use('/api/products', createProductRoutes(productService));

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} not found`,
      path: req.path,
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
    });
  });

  return app;
}

export default createApp;

