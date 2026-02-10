import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Service info
  serviceName: process.env.OTEL_SERVICE_NAME || 'product-service',
  serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
  
  // Server
  host: process.env.HOST || '0.0.0.0',
  port: parseInt(process.env.PORT || '8010', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/products',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTtl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
  
  // Redis Streams
  redisStreamsUrl: process.env.REDIS_STREAMS_URL || 'redis://localhost:6380',
  
  // OpenTelemetry
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
    serviceName: process.env.OTEL_SERVICE_NAME || 'product-service',
  },
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
};

export default config;

