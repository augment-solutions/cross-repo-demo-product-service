# syntax=docker/dockerfile:1.4
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared library first
COPY shared/typescript-common /shared/typescript-common
WORKDIR /shared/typescript-common

# Build shared library with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install && npm run build

# Copy service files
WORKDIR /app
COPY services/product-service/package*.json ./

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install

COPY services/product-service/tsconfig.json ./
COPY services/product-service/src ./src

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install stress-ng for chaos engineering
RUN apk add --no-cache stress-ng iproute2

# Install production dependencies with BuildKit cache mount
COPY --from=builder /shared/typescript-common /shared/typescript-common
COPY services/product-service/package*.json ./
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install --omit=dev

# Copy built files
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8060

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:8060/health || exit 1

EXPOSE 8060

CMD ["node", "dist/index.js"]

