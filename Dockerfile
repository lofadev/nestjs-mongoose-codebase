# ============================================
# Stage 1: Install production dependencies only
# ============================================
FROM node:24-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Fetch packages first (optimal layer caching — lock file rarely changes)
COPY pnpm-lock.yaml ./
RUN pnpm fetch --prod

COPY package.json ./
RUN pnpm install --frozen-lockfile --prod --offline

# ============================================
# Stage 2: Build application with SWC
# ============================================
FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY pnpm-lock.yaml ./
RUN pnpm fetch

COPY package.json ./
RUN pnpm install --frozen-lockfile --offline

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN pnpm build

# ============================================
# Stage 3: Production runtime (minimal image)
# ============================================
FROM node:24-alpine AS production

# Security: non-root user
RUN addgroup -g 1001 -S appgroup \
    && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy only production node_modules from deps stage
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy only compiled output from build stage
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Copy package.json for runtime metadata
COPY --chown=appuser:appgroup package.json ./

# Switch to non-root user
USER appuser

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
