export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency: string;
  categoryId?: string;
  brandId?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  images: ProductImage[];
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  tags: string[];
  metadata: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: ProductDimensions;
  inventoryTracking: boolean;
  stockQuantity: number;
  lowStockThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ProductVisibility {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  SEARCH_ONLY = 'search_only',
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  name: string;
  value: string;
  visible: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  attributes: ProductAttribute[];
  imageId?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currency?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  images?: Omit<ProductImage, 'id'>[];
  attributes?: ProductAttribute[];
  tags?: string[];
  metadata?: Record<string, any>;
  seoTitle?: string;
  seoDescription?: string;
  weight?: number;
  weightUnit?: string;
  dimensions?: ProductDimensions;
  inventoryTracking?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductSearchParams {
  query?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

