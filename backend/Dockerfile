FROM oven/bun:1-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
RUN bun run build

FROM oven/bun:1-alpine AS base

WORKDIR /app/backend

ENV PORT=3000
ENV STATIC_DIR=/app/frontend/dist
ENV DATABASE_PATH=/data/notes.sqlite

RUN mkdir -p /data && chown bun:bun /data

EXPOSE 3000

FROM base AS dev

ENV NODE_ENV=development

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

USER bun

CMD ["bun", "--watch", "src/index.ts"]

FROM base AS prod

ENV NODE_ENV=production

COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY backend/tsconfig.json ./
COPY backend/src ./src
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

USER bun

CMD ["bun", "src/index.ts"]
