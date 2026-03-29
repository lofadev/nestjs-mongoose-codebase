# ============================================
# Stage 1: Install production dependencies only
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production --ignore-scripts \
    && npm cache clean --force

# ============================================
# Stage 2: Build application with SWC
# ============================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force

COPY tsconfig.json nest-cli.json ./
COPY src ./src

RUN npx nest build

# ============================================
# Stage 3: Production runtime (minimal image)
# ============================================
FROM node:22-alpine AS production

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
