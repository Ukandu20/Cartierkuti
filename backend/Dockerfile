FROM node:20-alpine3.19 AS builder
WORKDIR /backend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm prune --production

FROM node:20-alpine3.19
WORKDIR /backend
ENV NODE_ENV=production
COPY --from=builder /backend/node_modules ./node_modules
COPY --from=builder /backend/src ./src
COPY --from=builder /backend/scripts ./scripts
COPY --from=builder /backend/package.json ./
RUN chown -R node:node /backend
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
