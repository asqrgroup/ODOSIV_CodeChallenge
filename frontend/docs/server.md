# Local data server

This project includes a small read-only Express server used during development to serve local JSON fixtures
and a couple of convenience endpoints the frontend uses for demos and tests.

Files
- `server/index.js` — Express app that serves JSON fixtures from the `data/` directory and exposes small
	helper endpoints.

Endpoints
- `GET /` — returns a small status JSON listing available endpoints.
- `GET /data-users` — streams `data/data-users.json` (user-level metrics).
- `GET /data-all` — streams `data/data-all.json` (overall metrics and aggregates).
- `GET /search-users?name=<name>` — returns matching users from `data-users.json`; case-insensitive exact
	match. If no `name` query is provided, returns all users.
- `GET /pipeline-health` — mock pipeline health endpoint. Returns JSON with the randomized `status` field
	(`{"status":"passing"}` or `{"status":"failing"}`) and uses HTTP 503 when failing.

Notes and behavior
- Read-only streaming: endpoints stream files from disk using a read stream. If you change the
	JSON files while the server is running, subsequent requests will read the updated contents (best-effort).
- `search-users` performs a case-insensitive exact name match; if the `name` query is absent or empty,
	it returns the full users list.
- `pipeline-health` intentionally randomizes status (~30% failing) and returns HTTP 503 when failing so
	frontend UI can demonstrate degraded health states.
- The `/data-users` handler logs request information (including the `Host` header) to the server console for
	debugging.

Running with Docker Compose

The project Docker Compose configuration runs the data server on port 4000 by default. You can start the
full stack (frontend + server) with:

```bash
docker compose up --build
```

Notes for containerized development
- When the frontend runs inside a container, the frontend may need to call the host's data server. On
	macOS and Windows Docker Desktop, containers can reach the host via `host.docker.internal:4000` (this
	repository's Vite config/proxy is set up to use that when appropriate).

Troubleshooting
- If an endpoint returns 404, verify the corresponding file exists in the `data/` directory and is valid JSON.
- If you need the server to auto-reload on code changes, run it with a file watcher (e.g., `nodemon`) locally;
	the Dockerized server is intentionally minimal and not set up for hot restart.
