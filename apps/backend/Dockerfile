FROM node:20-slim 

WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

RUN apt-get update -y && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

COPY . .

RUN npm run build --workspace=backend

EXPOSE 8080

CMD ["npm", "run", "start", "--workspace=backend"]