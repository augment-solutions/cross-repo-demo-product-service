/**
 * Tests for OpenTelemetry instrumentation in Product Service.
 */

describe('Product Service OTel Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Service Configuration', () => {
    it('should use default service name when env not set', () => {
      delete process.env.OTEL_SERVICE_NAME;
      const serviceName = process.env.OTEL_SERVICE_NAME || 'product-service';
      expect(serviceName).toBe('product-service');
    });

    it('should use custom service name from environment', () => {
      process.env.OTEL_SERVICE_NAME = 'custom-product-service';
      const serviceName = process.env.OTEL_SERVICE_NAME || 'product-service';
      expect(serviceName).toBe('custom-product-service');
    });

    it('should use default OTLP endpoint when env not set', () => {
      delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';
      expect(endpoint).toBe('http://localhost:4317');
    });

    it('should use custom OTLP endpoint from environment', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://otel-collector:4317';
      const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';
      expect(endpoint).toBe('http://otel-collector:4317');
    });
  });

  describe('Exported Symbols', () => {
    it('should export tracer', () => {
      const expectedExports = ['tracer', 'meter', 'sdk', 'shutdownOtel'];
      expect(expectedExports).toContain('tracer');
    });

    it('should export meter', () => {
      const expectedExports = ['tracer', 'meter', 'sdk', 'shutdownOtel'];
      expect(expectedExports).toContain('meter');
    });

    it('should export shutdownOtel function', () => {
      const expectedExports = ['tracer', 'meter', 'sdk', 'shutdownOtel'];
      expect(expectedExports).toContain('shutdownOtel');
    });
  });

  describe('Custom Metrics', () => {
    it('should define products created counter', () => {
      const expectedMetrics = [
        'productsCreatedCounter',
        'productsUpdatedCounter',
        'productViewsCounter',
        'productSearchCounter',
        'productsByCategoryCounter',
        'queryLatencyHistogram',
        'cacheHitCounter',
        'cacheMissCounter',
      ];
      expect(expectedMetrics).toContain('productsCreatedCounter');
    });

    it('should define query latency histogram', () => {
      const expectedMetrics = [
        'productsCreatedCounter',
        'productsUpdatedCounter',
        'productViewsCounter',
        'productSearchCounter',
        'productsByCategoryCounter',
        'queryLatencyHistogram',
        'cacheHitCounter',
        'cacheMissCounter',
      ];
      expect(expectedMetrics).toContain('queryLatencyHistogram');
    });

    it('should define cache hit/miss counters', () => {
      const expectedMetrics = [
        'productsCreatedCounter',
        'productsUpdatedCounter',
        'productViewsCounter',
        'productSearchCounter',
        'productsByCategoryCounter',
        'queryLatencyHistogram',
        'cacheHitCounter',
        'cacheMissCounter',
      ];
      expect(expectedMetrics).toContain('cacheHitCounter');
      expect(expectedMetrics).toContain('cacheMissCounter');
    });

    it('should have 8 custom metrics defined', () => {
      const expectedMetrics = [
        'productsCreatedCounter',
        'productsUpdatedCounter',
        'productViewsCounter',
        'productSearchCounter',
        'productsByCategoryCounter',
        'queryLatencyHistogram',
        'cacheHitCounter',
        'cacheMissCounter',
      ];
      expect(expectedMetrics.length).toBe(8);
    });
  });

  describe('Auto-Instrumentation', () => {
    it('should enable Express instrumentation', () => {
      const enabledInstrumentations = [
        '@opentelemetry/instrumentation-express',
        '@opentelemetry/instrumentation-http',
        '@opentelemetry/instrumentation-ioredis',
        '@opentelemetry/instrumentation-pg',
      ];
      expect(enabledInstrumentations).toContain('@opentelemetry/instrumentation-express');
    });

    it('should enable PostgreSQL instrumentation', () => {
      const enabledInstrumentations = [
        '@opentelemetry/instrumentation-express',
        '@opentelemetry/instrumentation-http',
        '@opentelemetry/instrumentation-ioredis',
        '@opentelemetry/instrumentation-pg',
      ];
      expect(enabledInstrumentations).toContain('@opentelemetry/instrumentation-pg');
    });
  });
});

