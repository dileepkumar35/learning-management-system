# Use latest stable LTS version with specific tag for reproducibility
FROM node:20.18.1-alpine3.20 AS builder

# Install security updates
# RUN apk upgrade --no-cache

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./

# Install dependencies with clean install and include dev dependencies for build
RUN npm ci --include=dev && \
    npm cache clean --force

# Copy source files
COPY . .

# Run linting/tests if available (optional but recommended)
# RUN npm run lint && npm run test

# Production stage
FROM node:20.18.1-alpine3.20

# Install security updates and dumb-init for proper signal handling
# RUN apk upgrade --no-cache && \
#     apk add --no-cache dumb-init

RUN apk add --no-cache dumb-init

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY --from=builder /app/src ./src

# Create non-root user with specific UID/GID for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (document only, doesn't publish)
EXPOSE 5000

# Health check with proper error handling
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]