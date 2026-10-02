FROM oven/bun:1-alpine AS base

WORKDIR /app/backend

ENV PORT=3000
ENV STATIC_DIR=/app/frontend/dist

EXPOSE 3000

FROM base AS dev

ENV NODE_ENV=development

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/tsconfig.json ./
COPY backend/src ./src

USER bun

CMD ["bun", "--watch", "src/index.ts"]

FROM base AS prod

ENV NODE_ENV=production

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY backend/tsconfig.json ./
COPY backend/src ./src

USER bun

CMD ["bun", "src/index.ts"]
