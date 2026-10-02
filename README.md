# Martins Notes App

Express app running on [Bun](https://bun.sh), written in TypeScript, with a Vue + [Quasar](https://quasar.dev) frontend built by Vite.

## Requirements

- Docker with Docker Compose (v2.22+ for watch mode)
- Bun (for building the frontend and installing dependencies / type checking on the host)

## Frontend

The Docker image builds the Vue + Quasar frontend and includes `frontend/dist`; no host frontend build is needed to run the production container. For frontend-only work, run Vite locally:

```sh
cd frontend
bun install
bun run build
```

`bun run dev` starts the Vite dev server with hot reload for frontend-only work.

## Development

Runs the backend in a container with `bun --watch`. Changes in `backend/src` are synced into the container. Frontend changes trigger an image rebuild, which rebuilds the frontend assets.

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

The frontend assets are built into the image, so `frontend/dist` does not need to exist on the host.

SQLite data is stored in the `notes-data` Docker volume and persists when the container is recreated. To remove the database too, run `docker compose down --volumes`.

## API

All endpoints are under `/api`. Request and response bodies use JSON. Notes use `categoryId` (nullable); categories use `parentCategoryId` (nullable).

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/notes`            | List notes           |
| GET    | `/api/notes/:id`        | Get a note           |
| POST   | `/api/notes`            | Create a note        |
| PUT    | `/api/notes/:id`        | Replace a note       |
| DELETE | `/api/notes/:id`        | Delete a note        |
| GET    | `/api/categories`       | List categories      |
| GET    | `/api/categories/:id`   | Get a category       |
| POST   | `/api/categories`       | Create a category    |
| PUT    | `/api/categories/:id`   | Replace a category   |
| DELETE | `/api/categories/:id`   | Delete a category    |

Create/update notes with `{"content":"...","categoryId":null}` and categories with `{"name":"...","parentCategoryId":null}`. Deleting a category leaves its notes uncategorized and its child categories at the root.

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

## Scripts (`frontend/`)

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `bun run dev`       | Start the Vite dev server              |
| `bun run build`     | Type check and build to `dist/`        |
| `bun run preview`   | Preview the production build           |
| `bun run typecheck` | Type check with `vue-tsc --noEmit`     |
