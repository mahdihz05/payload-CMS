FROM node:22-alpine AS dependencies
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM dependencies AS builder
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV DATABASE_URI=postgresql://build:build@127.0.0.1:5432/build
ENV PAYLOAD_SECRET=build-only-payload-secret-at-least-32-characters
ENV IP_HASH_SECRET=build-only-ip-hash-secret-at-least-32-characters
COPY frontend/ ./
RUN mkdir -p public && npm run build

FROM node:22-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/frontend/public ./frontend/public
RUN mkdir -p /app/media /app/private-media && chown -R nextjs:nodejs /app/media /app/private-media
USER nextjs
EXPOSE 3000
CMD ["node", "frontend/server.js"]

FROM dependencies AS scheduler
WORKDIR /app/frontend
ENV NODE_ENV=production
COPY --chown=node:node frontend/ ./
USER node
CMD ["npm", "run", "jobs:scheduler"]
