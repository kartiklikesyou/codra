FROM node:20-slim AS deps
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY packages/typescript-config/package*.json ./packages/typescript-config/
COPY packages/db/package*.json ./packages/db/
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci


FROM node:20-slim AS prod-deps
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --omit=dev


FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npm run build --workspace=db
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build --workspace=backend


FROM node:20-slim AS runner
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=node:node /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder --chown=node:node /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder --chown=node:node /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=node:node /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 8080
CMD ["node", "apps/backend/dist/index.js"]