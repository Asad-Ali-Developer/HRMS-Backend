# ─────────────── Stage 1: Build ───────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS (compiles TS → dist/)
RUN npm run build


# ─────────────── Stage 2: Production ───────────────
FROM node:18-alpine AS production

WORKDIR /app

# Only copy what's needed to run
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output, generated prisma client, and schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

CMD ["node", "dist/main"]