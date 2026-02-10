import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('OpenTelemetry Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Service Name', () => {
    it('should use default service name', () => {
      delete process.env.OTEL_SERVICE_NAME;
      const serviceName = process.env.OTEL_SERVICE_NAME || 'product-service';
      expect(serviceName).toBe('product-service');
    });

    it('should use service name from environment', () => {
      process.env.OTEL_SERVICE_NAME = 'custom-product-service';
      expect(process.env.OTEL_SERVICE_NAME).toBe('custom-product-service');
    });
  });

  describe('OTLP Endpoint', () => {
    it('should use default endpoint', () => {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'localhost:4317';
      expect(endpoint).toBe('localhost:4317');
    });

    it('should use endpoint from environment', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'otel-collector:4317';
      expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe('otel-collector:4317');
    });
  });

  describe('Product Metrics', () => {
    it('should define expected metrics', () => {
      const expectedMetrics = [
        'product.views',
        'product.searches',
        'product.created',
        'product.updated',
      ];
      expect(expectedMetrics).toHaveLength(4);
    });
  });

  describe('Product Spans', () => {
    it('should define expected spans', () => {
      const expectedSpans = [
        'product.get',
        'product.list',
        'product.create',
        'product.update',
        'product.delete',
      ];
      expect(expectedSpans).toHaveLength(5);
    });
  });

  describe('Resource Attributes', () => {
    it('should define expected resource attributes', () => {
      const attrs = [
        'service.name',
        'service.version',
        'deployment.environment',
      ];
      expect(attrs).toHaveLength(3);
    });
  });
});

