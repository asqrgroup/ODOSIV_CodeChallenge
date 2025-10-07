# odos-dashboard


This repo contains a Vite + React frontend and a small read-only Express server used to serve local JSON fixtures for development and testing.

Lightweight React + TypeScript dashboard that reads local JSON fixtures and displays per-user heart metrics.

This repository contains:

- `src/` - React + TypeScript frontend (Vite)
- `server/` - small read-only Express data server used for development and tests
- `data/` - JSON fixtures (used by the data server)
- `docker-compose.yml` - convenience compose file to build and run both services

Quick facts

- Frontend dev server (Vite) default port: 5173
- Data server default port: 4000
- Main data endpoints exposed by the server: `/`, `/data-users`, `/data-all`, `/search-users`, `/pipeline-health`

Table of contents

- Getting started
- Available npm scripts
- Data server endpoints
- Docker
- Testing
- Accessibility & CI notes
- Project structure

Getting started (local)

1. Install dependencies

```bash
npm install
```

2. Start the frontend dev server (Vite + HMR)

```bash
npm run dev
```

3. In another terminal, start the local data server (serves files from `data/`)

```bash
npm run serve-data
```

4. Open the app in your browser

- Frontend (Vite dev): http://localhost:5173
- Data server status & endpoints: http://localhost:4000

Available npm scripts

These are defined in `package.json` and kept intentionally small:

- `npm run dev` — start Vite dev server
- `npm run serve-data` — start the simple Express data server (`server/index.js`)
- `npm run build` — run `tsc -b` then `vite build` (production frontend build)
- `npm run preview` — preview the production build locally via `vite preview`
- `npm run test` — run Vitest once
- `npm run test:watch` — run Vitest in watch mode
- `npm run lint` — run ESLint across the repo

Data server endpoints (server/index.js)

- `GET /` — returns a small JSON status and available endpoints
- `GET /data-users` — streams the `data/data-users.json` fixture
- `GET /data-all` — streams the `data/data-all.json` fixture
- `GET /search-users?name=<name>` — reads `data/data-users.json` and returns matching users; this server performs a case-insensitive exact match on the `name` field (if no `name` query is provided it returns all users)
- `GET /pipeline-health` — mock pipeline health endpoint (returns `passing` most of the time; returns 503 when failing)

Notes about `search-users`

- The endpoint accepts a `name` query parameter and performs a case-insensitive exact match against each user's `name` field. Example: `/search-users?name=alice`.

Docker (build & run)

There are Dockerfiles for the frontend and the data server. The included `docker-compose.yml` builds and runs both services for local/dev usage.

Build and run with Docker Compose:

```bash
docker compose build
docker compose up
```

After compose up:

- Frontend (Vite): http://localhost:5173
- Data server: http://localhost:4000

Testing

- Unit tests are written with Vitest. Run them with:

```bash
npm test
```

- Run tests in watch mode during development:

```bash
npm run test:watch
```

Accessibility & CI

- This project targets Section 508 accessibility goals and includes an accessibility requirements file at `docs/a11y-requirments.md`.
- We recommend integrating axe-core checks into CI to catch regressions early (examples: jest-axe or axe-core + playwright/playwright-axe for E2E).

Project structure (high level)

```
src/
	App.tsx
	main.tsx
	components/
		PipelineHealth.tsx
		UserFilter.tsx
		UserList.tsx
		__tests__/
			PipelineHealth.test.tsx
			UserFilter.test.tsx
			UserList.test.tsx
server/
	index.js
data/
	data-users.json
	data-all.json
docs/
	a11y-requirments.md
	frontend-requirments.md
	data-schema.json
docker-compose.yml
```

Troubleshooting

- If the frontend cannot reach the data server when running both inside containers, ensure the compose network and service names are correctly referenced or use `host.docker.internal` depending on your platform.
- If you see `Error: data file not found` from the data server, confirm your working directory contains the `data/` folder and the JSON fixtures.

Contributing

- Keep changes small and test UI behavior locally with `npm run dev` and `npm run serve-data`.
- Add/update unit tests in `src/components/__tests__/` when changing component behavior.

License

This repository does not include a license file; treat it as private by default (`private: true` in package.json).

If you'd like, I can also add a short development checklist, CI examples (GitHub Actions with Vitest + axe-core), or a one-file docker example for serving the production build.
