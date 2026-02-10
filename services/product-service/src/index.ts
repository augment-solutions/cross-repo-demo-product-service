// Import instrumentation first to ensure proper setup
import { shutdownOtel } from './instrumentation';

import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { ProductService } from './services/ProductService';

async function main() {
  try {
    logger.info(`Starting ${config.serviceName} v${config.serviceVersion}`);

    // Create product service
    const productService = new ProductService();
    await productService.connect();
    logger.info('ProductService initialized');

    // Create Express app
    const app = createApp(productService);

    // Start HTTP server
    const server = app.listen(config.port, config.host, () => {
      logger.info(`Product Service listening on ${config.host}:${config.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Disconnect product service
      try {
        await productService.disconnect();
        logger.info('ProductService disconnected');
      } catch (err) {
        logger.error('Error disconnecting ProductService', { error: err });
      }

      // Shutdown OpenTelemetry
      try {
        await shutdownOtel();
        logger.info('OpenTelemetry SDK shut down');
      } catch (err) {
        logger.error('Error shutting down OpenTelemetry', { error: err });
      }

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start Product Service', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main();

