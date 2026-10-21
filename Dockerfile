# ==============================================================================
# Multi-stage Dockerfile for SMYS Food Count SSR Application
# ==============================================================================

# Stage 1: Build the client and server bundles
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm ci

# Copy source code and config
COPY . .

# Build both client and server SSR bundles
RUN npm run build

# Stage 2: Production lightweight runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles and server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/index.html ./index.html

EXPOSE 3000

# Run the Express SSR server
CMD ["node", "server.js"]
