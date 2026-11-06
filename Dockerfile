# step 1: build the website
FROM node:22-alpine AS website
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend ./
RUN npm run build

# step 2: the server, with the built website inside
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY Backend/package*.json ./Backend/
RUN cd Backend && npm ci --omit=dev
COPY Backend ./Backend
COPY --from=website /app/Frontend/dist ./Frontend/dist

# the database file is kept in /data (a volume, so it is not lost when the app restarts)
ENV PORT=8080
ENV DB_PATH=/data/youth-hub.db
EXPOSE 8080
CMD ["node", "Backend/server.js"]
