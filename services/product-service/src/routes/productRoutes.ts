import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { ProductService } from '../services/ProductService';

export function createProductRoutes(productService: ProductService): Router {
  const router = Router();
  const controller = new ProductController(productService);

  // Search products
  router.get('/search', (req, res) => controller.searchProducts(req, res));

  // List all products
  router.get('/', (req, res) => controller.listProducts(req, res));

  // Get single product
  router.get('/:id', (req, res) => controller.getProduct(req, res));

  // Create product
  router.post('/', (req, res) => controller.createProduct(req, res));

  // Update product
  router.put('/:id', (req, res) => controller.updateProduct(req, res));
  router.patch('/:id', (req, res) => controller.updateProduct(req, res));

  // Delete product
  router.delete('/:id', (req, res) => controller.deleteProduct(req, res));

  return router;
}

export default createProductRoutes;

