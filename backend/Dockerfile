# ─── Stage 1: install & prune dev deps ─────────────────────────────────────
FROM node:20-alpine3.19 AS builder
WORKDIR /backend

# 1) Install all deps (prod + dev)
COPY package.json package-lock.json ./
RUN npm ci

# 2) Copy source (including src directory and other necessary files)
COPY . .

# 3) Remove devDependencies to retain only production deps
RUN npm prune --production

# ─── Stage 2: runtime image ────────────────────────────────────────────────
FROM node:20-alpine3.19
WORKDIR /backend

ENV NODE_ENV=production

# 1) Copy production node_modules and source files
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend/src ./src          
COPY --from=builder /backend/package.json ./

# 2) Set permissions (for non-root access on Alpine)
RUN chown -R node:node /backend

USER node

EXPOSE 5000

# ─── healthcheck ────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

# ─── default: start the API ─────────────────────────────────────────────────
CMD ["node", "src/server.js"]
