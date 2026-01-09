FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built output and node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/server ./server

# Install drizzle-kit for migrations
RUN npm install -g drizzle-kit

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

# Run migrations and start
CMD ["sh", "-c", "drizzle-kit push && node .output/server/index.mjs"]
