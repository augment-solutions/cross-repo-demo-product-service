import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { CreateProductRequest, UpdateProductRequest, ProductSearchParams } from '../types/product';
import { logger } from '../utils/logger';
import { tracer } from '../instrumentation';
import { SpanStatusCode } from '@opentelemetry/api';

export class ProductController {
  constructor(private productService: ProductService) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.createProduct');
    try {
      const request: CreateProductRequest = req.body;
      const product = await this.productService.createProduct(request);
      
      span.setStatus({ code: SpanStatusCode.OK });
      res.status(201).json(product);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to create product', { error });
      res.status(500).json({ error: 'Failed to create product' });
    } finally {
      span.end();
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.getProduct');
    try {
      const { id } = req.params;
      span.setAttribute('product.id', id);

      const product = await this.productService.getProduct(id);
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      span.setStatus({ code: SpanStatusCode.OK });
      res.json(product);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to get product', { error });
      res.status(500).json({ error: 'Failed to get product' });
    } finally {
      span.end();
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.updateProduct');
    try {
      const { id } = req.params;
      const request: UpdateProductRequest = req.body;
      span.setAttribute('product.id', id);

      const product = await this.productService.updateProduct(id, request);
      
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      span.setStatus({ code: SpanStatusCode.OK });
      res.json(product);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to update product', { error });
      res.status(500).json({ error: 'Failed to update product' });
    } finally {
      span.end();
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.deleteProduct');
    try {
      const { id } = req.params;
      span.setAttribute('product.id', id);

      const deleted = await this.productService.deleteProduct(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      span.setStatus({ code: SpanStatusCode.OK });
      res.status(204).send();
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to delete product', { error });
      res.status(500).json({ error: 'Failed to delete product' });
    } finally {
      span.end();
    }
  }

  async searchProducts(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.searchProducts');
    try {
      const params: ProductSearchParams = {
        query: req.query.q as string,
        categoryId: req.query.category as string,
        brandId: req.query.brand as string,
        minPrice: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
        maxPrice: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        sortBy: req.query.sort_by as string,
        sortOrder: req.query.sort_order as 'asc' | 'desc',
      };

      const result = await this.productService.searchProducts(params);
      
      span.setStatus({ code: SpanStatusCode.OK });
      res.json(result);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to search products', { error });
      res.status(500).json({ error: 'Failed to search products' });
    } finally {
      span.end();
    }
  }

  async listProducts(req: Request, res: Response): Promise<void> {
    const span = tracer.startSpan('ProductController.listProducts');
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.productService.listProducts(page, limit);
      
      span.setStatus({ code: SpanStatusCode.OK });
      res.json(result);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      logger.error('Failed to list products', { error });
      res.status(500).json({ error: 'Failed to list products' });
    } finally {
      span.end();
    }
  }
}

export default ProductController;

