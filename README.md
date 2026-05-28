# StrongMail Agent Studio UI

React single-page application for editing email templates with conversational AI. The UI talks to a FastAPI backend that exposes two Google ADK agents—a **Template Agent** for in-session editing and a **General Agent** for template discovery.

## How it works

### Architecture

```
Browser  →  Nginx (Docker) or Vite dev server  →  FastAPI backend (:8000)
                                                    ├── Template Agent (session-based)
                                                    └── General Agent (stateless chat)
```

The frontend is a pure UI layer. It never talks to agents, Redis, or databases directly. All reads and writes go through REST endpoints under paths such as `/session`, `/templates`, `/working-copy`, `/preview`, `/tone`, `/health`, and `/chat`.

In production-style Docker runs, Nginx serves the built static assets and reverse-proxies those API paths to the backend. In local development, Vite's dev server performs the same proxy to `http://localhost:8000`.

### UI layout

The app has four main regions on the **Template** tab:

| Region | Purpose |
|--------|---------|
| **Sidebar** | Tab switcher (Template / General), language and brand selectors, searchable template list |
| **Chat** | Conversational editing with streamed responses, tool chips, and diff cards |
| **Preview** | Live HTML preview of the template, debounced and highlighting modified values |
| **Right panel** | Working copy table (inline edits) and tone evaluation bars |

The **General** tab provides a stateless chat for finding templates across the catalog, with result cards that open a template session.

### Session lifecycle

Opening a template runs a strict three-step initialization before the session is considered active:

1. `POST /session` — create an ADK session for the template
2. `GET /working-copy/{session_id}` — load template variables
3. `GET /preview/{session_id}` — load rendered HTML

Only after all three succeed does the UI write `sessionId` to the store and show the welcome message. Chat uses `fetch` + `ReadableStream` (not `EventSource`) to stream assistant responses over `POST /chat/stream`.

### State management

- **`sessionStore`** — active tab, session, messages, working copy, preview HTML, tone data
- **`appStore`** — templates, locales, brands, backend health status

State lives in memory only (Zustand); nothing is persisted to `localStorage`.

## Prerequisites

- **Docker** — for the containerized setup described below
- **Node.js 20+** — only if you want to run or develop outside Docker
- **FastAPI backend** — must be running and reachable on port **8000** (this repo contains the UI only)

## Start with Docker

From the repository root:

```bash
docker build -t strongmail-agent-studio-ui .

docker run -d \
  --name strongmail-agent-studio-ui \
  -p 5173:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  strongmail-agent-studio-ui
```

Then open [http://localhost:5173](http://localhost:5173).

The container maps host port **5173** to Nginx port **80**. API requests from the browser are proxied to the backend at `http://host.docker.internal:8000`, which resolves to your host machine from inside the container.

### Backend requirement

Start the FastAPI backend on the host **before** using the UI. If the backend is not running, the status bar will show unhealthy and API calls will fail.

To point at a different backend URL:

```bash
docker run -d \
  --name strongmail-agent-studio-ui \
  -p 5173:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=http://host.docker.internal:9000 \
  strongmail-agent-studio-ui
```

### Useful Docker commands

```bash
# Rebuild after code changes
docker build -t strongmail-agent-studio-ui .

# View logs
docker logs -f strongmail-agent-studio-ui

# Stop and remove
docker rm -f strongmail-agent-studio-ui
```

### Troubleshooting

**Blank page or connection errors on http://localhost:5173**

Check which process the container is running:

```bash
docker inspect strongmail-agent-studio-ui --format '{{.Config.Cmd}}'
```

You should see `[nginx -g daemon off;]`. If you see `uvicorn` instead, you are running the wrong image. Rebuild explicitly:

```bash
docker rm -f strongmail-agent-studio-ui
docker build --no-cache -t strongmail-agent-studio-ui .
docker run -d --name strongmail-agent-studio-ui -p 5173:80 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  strongmail-agent-studio-ui
```

**API calls fail but the UI loads**

The frontend container only serves static files and proxies API traffic. Ensure the FastAPI backend is running on port **8000** on your host (`strongmail-api` or equivalent).

### What the Docker build does

1. **Build stage** — `npm ci` and `npm run build` inside `frontend/`, producing static files in `dist/`
2. **Runtime stage** — Nginx 1.27 serves those files and applies `frontend/nginx/default.conf.template`, substituting `API_UPSTREAM` for backend proxying

## Local development (without Docker)

If you prefer Vite's dev server with hot reload:

```bash
cd frontend
npm ci
npm run dev
```

Vite listens on [http://localhost:5173](http://localhost:5173) and proxies API routes to `http://localhost:8000` (see `frontend/vite.config.ts`).

Other scripts:

```bash
npm run build    # production build to frontend/dist
npm run preview  # serve the production build locally
npm run test     # Vitest unit tests
npm run lint     # ESLint
```

## Project structure

```
strongmail-atlas-ui/
├── Dockerfile                  # Multi-stage build (Node → Nginx)
├── frontend/
│   ├── nginx/
│   │   └── default.conf.template
│   └── src/
│       ├── api/                # Backend API clients
│       ├── chat/               # Chat column and streaming UI
│       ├── preview/            # HTML preview iframe
│       ├── rightpanel/         # Working copy and tone panels
│       ├── sidebar/            # Navigation and template list
│       ├── general/            # General Agent tab
│       ├── shell/              # App shell, top bar, status bar
│       ├── store/              # Zustand stores
│       └── hooks/              # Shared React hooks
└── specs/                      # Feature specs and API contracts
```

## API surface

The UI expects these backend endpoints (proxied in both Docker and dev modes):

| Path | Purpose |
|------|---------|
| `POST /session` | Start a template editing session |
| `GET /templates` | List available templates |
| `GET/PATCH/DELETE /working-copy/{session_id}` | Read and update template variables |
| `GET /preview/{session_id}` | Rendered HTML preview |
| `POST /tone/evaluate/{session_id}` | Tone analysis |
| `POST /tone/apply/{session_id}` | Apply suggested rewrites |
| `POST /chat/stream` | Streaming chat (Template and General agents) |
| `GET /health` | Backend health check (polled every 30s) |

Full request/response shapes are documented in [`specs/001-agent-studio-ui/contracts/api.md`](specs/001-agent-studio-ui/contracts/api.md).

## Testing

Tests use Vitest, React Testing Library, and MSW for API mocking:

```bash
cd frontend
npm test
```

## Tech stack

- React 18, TypeScript, Vite
- Zustand for state
- Tailwind CSS for styling
- Nginx (Docker) or Vite proxy for API routing
