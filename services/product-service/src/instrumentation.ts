/**
 * OpenTelemetry instrumentation for Product Service.
 * This module must be loaded before any other imports to ensure proper instrumentation.
 * All components use 100% open source tools (Apache 2.0 licensed).
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { metrics, trace } from '@opentelemetry/api';

// Service configuration
const serviceName = process.env.OTEL_SERVICE_NAME || 'product-service';
const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
const environment = process.env.ENVIRONMENT || 'development';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317';

// Create resource with service information
const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: serviceName,
  [SEMRESATTRS_SERVICE_VERSION]: serviceVersion,
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
  'service.namespace': 'ecomm-stack',
});

// Create OTLP trace exporter
const traceExporter = new OTLPTraceExporter({
  url: otlpEndpoint,
});

// Create OTLP metric exporter
const metricExporter = new OTLPMetricExporter({
  url: otlpEndpoint,
});

// Create metric reader
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 60000,
});

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  resource,
  traceExporter,
  metricReader: metricReader as any,
  textMapPropagator: new W3CTraceContextPropagator(),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-ioredis': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
  ],
});

// Start the SDK
sdk.start();

console.log(`OpenTelemetry initialized for ${serviceName} v${serviceVersion}`);

// Get tracer and meter for custom instrumentation
export const tracer = trace.getTracer(serviceName, serviceVersion);
export const meter = metrics.getMeter(serviceName, serviceVersion);

// Custom metrics for Product Service
export const productsCreatedCounter = meter.createCounter('products.created_total', {
  description: 'Total number of products created',
  unit: '1',
});

export const productsUpdatedCounter = meter.createCounter('products.updated_total', {
  description: 'Total number of products updated',
  unit: '1',
});

export const productViewsCounter = meter.createCounter('products.views_total', {
  description: 'Total number of product views',
  unit: '1',
});

export const productSearchCounter = meter.createCounter('products.search_total', {
  description: 'Total number of product searches',
  unit: '1',
});

export const productsByCategoryCounter = meter.createCounter('products.by_category', {
  description: 'Products by category',
  unit: '1',
});

export const queryLatencyHistogram = meter.createHistogram('products.query_latency', {
  description: 'Product query latency in milliseconds',
  unit: 'ms',
});

export const cacheHitCounter = meter.createCounter('products.cache_hits', {
  description: 'Product cache hits',
  unit: '1',
});

export const cacheMissCounter = meter.createCounter('products.cache_misses', {
  description: 'Product cache misses',
  unit: '1',
});

// Shutdown function
export async function shutdownOtel(): Promise<void> {
  await sdk.shutdown();
  console.log('OpenTelemetry SDK shut down successfully');
}

export { sdk };

