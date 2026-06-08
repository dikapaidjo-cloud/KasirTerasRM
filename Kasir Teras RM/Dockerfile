FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install

FROM deps AS build
WORKDIR /app
COPY client ./client
COPY server ./server
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm install --omit=dev
COPY --from=build /app/client/dist ./client/dist
COPY server ./server
RUN mkdir -p reports backups uploads data server/database
EXPOSE 3000
CMD ["npm", "run", "start"]
