# ─── Stage 1: install & prune dev deps ─────────────────────────────────────
FROM node:20-alpine3.19 AS builder
WORKDIR /app

# Only copy package manifests and lockfile, install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source, so rebuilds only re-run when sources change
COPY . .

# If you have a build step (e.g. TS compile or bundler), run it here:
# RUN npm run build

# Remove devDependencies, leaving only production deps
RUN npm prune --production


# ─── Stage 2: runtime image ────────────────────────────────────────────────
FROM node:20-alpine3.19
WORKDIR /app

# Set NODE_ENV for production optimizations
ENV NODE_ENV=production

# Copy production node_modules + source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Use non-root user for security
USER node

# Expose the port your app listens on
EXPOSE 5000

# ─── healthcheck ────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/projects || exit 1

# Default command
CMD ["node", "server.js"]
