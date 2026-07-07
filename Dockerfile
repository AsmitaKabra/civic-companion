# Build Step 1: Frontend construction
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build Step 2: Main Production Server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

COPY server/ ./server/
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 5001
ENV NODE_ENV=production
ENV PORT=5001
ENV DB_PATH=/app/data/db.json

# Create data directory for persistent SQLite/JSON store
RUN mkdir -p /app/data

CMD ["node", "server/index.js"]
