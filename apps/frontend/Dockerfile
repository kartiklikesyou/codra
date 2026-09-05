FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages ./packages

RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build --workspace=frontend

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=frontend"]