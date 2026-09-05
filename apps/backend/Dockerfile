FROM node:20-slim

WORKDIR /app

COPY package*.json ./

COPY apps/backend/package*.json ./apps/backend/

COPY packages/typescript-config/package*.json ./packages/typescript-config/
COPY packages/db/package*.json ./packages/db/

RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build --workspace=backend

EXPOSE 8080

CMD ["npm", "run", "start", "--workspace=backend"]