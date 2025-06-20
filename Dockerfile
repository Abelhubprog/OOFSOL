# 🚀 OOF Platform Production Dockerfile

# Use official Node.js runtime as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    git \
    sqlite

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Build the application
FROM base AS builder
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .

# Run build
RUN npm run build

# Production image
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S oof -u 1001

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy database migration files
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/drizzle.config.ts ./

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs
RUN chown -R oof:nodejs /app

# Switch to non-root user
USER oof

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]