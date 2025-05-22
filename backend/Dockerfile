# ─── Stage 1: install & prune dev dependencies ──────────────────────────────
FROM node:20-alpine3.19 AS builder
WORKDIR /backend

# 1. Install dependencies (prod + dev)
COPY package.json package-lock.json ./
RUN npm ci

# 2. Copy source files
COPY . .

# 3. Remove devDependencies to retain only production deps
RUN npm prune --production

# ─── Stage 2: runtime environment ───────────────────────────────────────────
FROM node:20-alpine3.19
WORKDIR /backend

ENV NODE_ENV=production

# 1. Copy essential files and folders to the runtime environment
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend/src ./src
COPY --from=builder /backend/package.json ./

# 2. Fix file permissions
RUN chown -R node:node /backend

USER node

EXPOSE 5000

# ─── Healthcheck to confirm the app is running ──────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# ─── Start the server (point to correct src path) ───────────────────────────
CMD ["node", "src/server.js"]
