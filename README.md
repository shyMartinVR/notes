# Martins Notes App

Express app running on [Bun](https://bun.sh), written in TypeScript.

## Requirements

- Docker with Docker Compose (v2.22+ for watch mode)
- Bun (only needed for installing dependencies / type checking on the host)

## Development

Runs the backend in a container with `bun --watch`. Changes in `backend/src` are synced into the container; changes to `package.json` or `bun.lock` trigger a rebuild.

```sh
cd backend
bun run dev
```

or from the repo root:

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch
```

## Production

```sh
docker compose up --build -d
```

## Configuration

| Variable     | Default                                | Description                    |
| ------------ | -------------------------------------- | ------------------------------ |
| `PORT`       | `3000`                                 | Port the server listens on     |
| `STATIC_DIR` | `/app/frontend/dist` (in container)    | Directory served as static files |

## Scripts (`backend/`)

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Start the dev container in watch mode |
| `bun run start`     | Run the server directly with Bun     |
| `bun run typecheck` | Type check with `tsc --noEmit`       |
