import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import Redis from 'ioredis';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductSearchParams, 
  PaginatedProducts,
  ProductStatus,
  ProductVisibility 
} from '../types/product';
import { config } from '../config';
import { logger } from '../utils/logger';
import { 
  tracer, 
  productsCreatedCounter, 
  productsUpdatedCounter,
  productViewsCounter,
  productSearchCounter,
  queryLatencyHistogram,
  cacheHitCounter,
  cacheMissCounter,
} from '../instrumentation';
import { SpanStatusCode } from '@opentelemetry/api';

export class ProductService {
  private redis: Redis;
  private products: Map<string, Product> = new Map(); // In-memory store for demo

  constructor() {
    this.redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  async createProduct(request: CreateProductRequest): Promise<Product> {
    const span = tracer.startSpan('ProductService.createProduct');
    const startTime = Date.now();

    try {
      const product: Product = {
        id: uuidv4(),
        sku: request.sku,
        name: request.name,
        slug: slugify(request.name, { lower: true, strict: true }),
        description: request.description,
        shortDescription: request.shortDescription,
        price: request.price,
        compareAtPrice: request.compareAtPrice,
        costPrice: request.costPrice,
        currency: request.currency || 'USD',
        categoryId: request.categoryId,
        brandId: request.brandId,
        status: request.status || ProductStatus.DRAFT,
        visibility: request.visibility || ProductVisibility.VISIBLE,
        images: (request.images || []).map((img, idx) => ({
          ...img,
          id: uuidv4(),
          position: idx,
          isPrimary: idx === 0,
        })),
        attributes: request.attributes || [],
        variants: [],
        tags: request.tags || [],
        metadata: request.metadata || {},
        seoTitle: request.seoTitle,
        seoDescription: request.seoDescription,
        weight: request.weight,
        weightUnit: request.weightUnit,
        dimensions: request.dimensions,
        inventoryTracking: request.inventoryTracking ?? true,
        stockQuantity: request.stockQuantity ?? 0,
        lowStockThreshold: request.lowStockThreshold,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.products.set(product.id, product);
      await this.invalidateCache(`product:${product.id}`);

      span.setAttribute('product.id', product.id);
      span.setAttribute('product.sku', product.sku);
      span.setStatus({ code: SpanStatusCode.OK });

      productsCreatedCounter.add(1, { category: request.categoryId || 'uncategorized' });
      queryLatencyHistogram.record(Date.now() - startTime, { operation: 'create' });

      logger.info('Product created', { productId: product.id, sku: product.sku });
      return product;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    const span = tracer.startSpan('ProductService.getProduct');
    const startTime = Date.now();

    try {
      span.setAttribute('product.id', id);

      // Check cache first
      if (config.cacheEnabled) {
        const cached = await this.redis.get(`product:${id}`);
        if (cached) {
          cacheHitCounter.add(1);
          span.setAttribute('cache.hit', true);
          return JSON.parse(cached);
        }
        cacheMissCounter.add(1);
        span.setAttribute('cache.hit', false);
      }

      const product = this.products.get(id) || null;

      if (product && config.cacheEnabled) {
        await this.redis.setex(`product:${id}`, config.cacheTtl, JSON.stringify(product));
      }

      productViewsCounter.add(1);
      queryLatencyHistogram.record(Date.now() - startTime, { operation: 'get' });
      span.setStatus({ code: SpanStatusCode.OK });

      return product;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async updateProduct(id: string, request: UpdateProductRequest): Promise<Product | null> {
    const span = tracer.startSpan('ProductService.updateProduct');
    const startTime = Date.now();

    try {
      span.setAttribute('product.id', id);
      const existing = this.products.get(id);
      if (!existing) {
        span.setStatus({ code: SpanStatusCode.OK });
        return null;
      }

      // Handle images separately to add IDs
      const updatedImages = request.images
        ? request.images.map((img) => ({
            ...img,
            id: crypto.randomUUID(),
          }))
        : existing.images;

      const updated: Product = {
        ...existing,
        ...request,
        images: updatedImages,
        slug: request.name ? slugify(request.name, { lower: true, strict: true }) : existing.slug,
        updatedAt: new Date(),
      };

      this.products.set(id, updated);
      await this.invalidateCache(`product:${id}`);

      productsUpdatedCounter.add(1);
      queryLatencyHistogram.record(Date.now() - startTime, { operation: 'update' });
      span.setStatus({ code: SpanStatusCode.OK });

      logger.info('Product updated', { productId: id });
      return updated;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    const span = tracer.startSpan('ProductService.deleteProduct');

    try {
      span.setAttribute('product.id', id);
      const deleted = this.products.delete(id);
      await this.invalidateCache(`product:${id}`);

      span.setStatus({ code: SpanStatusCode.OK });
      logger.info('Product deleted', { productId: id, deleted });
      return deleted;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async searchProducts(params: ProductSearchParams): Promise<PaginatedProducts> {
    const span = tracer.startSpan('ProductService.searchProducts');
    const startTime = Date.now();

    try {
      span.setAttribute('search.query', params.query || '');
      span.setAttribute('search.category', params.categoryId || '');

      const page = params.page || 1;
      const limit = Math.min(params.limit || config.defaultPageSize, config.maxPageSize);

      let results = Array.from(this.products.values());

      // Filter by query
      if (params.query) {
        const query = params.query.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
        );
      }

      // Filter by category
      if (params.categoryId) {
        results = results.filter(p => p.categoryId === params.categoryId);
      }

      // Filter by status
      if (params.status) {
        results = results.filter(p => p.status === params.status);
      }

      // Filter by price range
      if (params.minPrice !== undefined) {
        results = results.filter(p => p.price >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        results = results.filter(p => p.price <= params.maxPrice!);
      }

      // Filter by tags
      if (params.tags && params.tags.length > 0) {
        results = results.filter(p =>
          params.tags!.some(tag => p.tags.includes(tag))
        );
      }

      const total = results.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedResults = results.slice(offset, offset + limit);

      productSearchCounter.add(1, { hasQuery: params.query ? 'true' : 'false' });
      queryLatencyHistogram.record(Date.now() - startTime, { operation: 'search' });
      span.setAttribute('search.results_count', total);
      span.setStatus({ code: SpanStatusCode.OK });

      return {
        products: paginatedResults,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  async listProducts(page: number = 1, limit: number = 20): Promise<PaginatedProducts> {
    return this.searchProducts({ page, limit });
  }

  private async invalidateCache(key: string): Promise<void> {
    if (config.cacheEnabled) {
      try {
        await this.redis.del(key);
      } catch (error) {
        logger.warn('Failed to invalidate cache', { key, error });
      }
    }
  }

  async connect(): Promise<void> {
    await this.redis.connect();
    logger.info('ProductService connected to Redis');
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
    logger.info('ProductService disconnected from Redis');
  }
}
