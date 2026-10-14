FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_SITE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 UPLOAD_DIR=/app/uploads
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev --no-audit --no-fund && mkdir -p /app/uploads && chown node:node /app/uploads
COPY --from=build /app/.output ./.output
COPY database ./database
COPY scripts ./scripts
COPY src/server/database.server.ts src/server/security.server.ts ./src/server/
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
