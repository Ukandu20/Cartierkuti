# ─── Stage 1: install & prune dev deps ─────────────────────────────────────
FROM node:20-alpine3.19 AS builder
WORKDIR /app

# 1) Install all deps (prod + dev)
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copy source (including your seeders)
COPY . .

# 3) Remove devDependencies so only prod deps remain
RUN npm prune --production


# ─── Stage 2: runtime image ────────────────────────────────────────────────
FROM node:20-alpine3.19
WORKDIR /backend

ENV NODE_ENV=production

# 1) Copy only production node_modules + your source (including scripts/)
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend ./

# 2) Fix permissions (alpine + non-root)
RUN chown -R node:node /backend

USER node

EXPOSE 5000

# ─── healthcheck ────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# ─── default: start the API ─────────────────────────────────────────────────
CMD ["node", "server.js"]
