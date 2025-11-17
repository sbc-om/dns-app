# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install system dependencies for LMDB
RUN apk add --no-cache python3 make g++

# Copy package.json first for dependencies
COPY package*.json ./

# Install LMDB and other production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Override the standalone node_modules with our complete installation
RUN cp -r node_modules/* ./node_modules/ 2>/dev/null || true

# Copy scripts and src for runtime database operations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

# Create directories for uploads and logs
RUN mkdir -p /app/data/uploads/images /app/data/uploads/documents /app/data/uploads/videos /app/data/uploads/others /app/logs /app/data/lmdb

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3013
# Memory settings will be set by docker-compose
# ENV NODE_OPTIONS and LMDB_MAP_SIZE will be overridden by compose

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Expose port
EXPOSE 3013

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3013/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]
