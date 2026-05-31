# AGENTS.md — Mini Social Network

## Quick start

```bash
cp .envexemple .env   # then fill in secrets
docker-compose up --build
```

Application: http://localhost/  
Admin: http://localhost/admin/  
WebSocket: ws://localhost/ws/online/

## Dev environment

- **Everything runs in Docker Compose** — no local Python/Node setup needed.
- **Frontend** uses `bun` inside the container (dev command: `bun run dev --host 0.0.0.0`).
- Source code is volume-mounted; edits reflect instantly (Django auto-reload, Vite HMR).
- **Do not run `bun install` or `npm install` on the host** — installs happen in the container.

## Architecture

| Service  | Container       | Port  | Role                           |
|----------|-----------------|-------|--------------------------------|
| Nginx    | nginx           | 80    | Routes all requests            |
| Backend  | django_backend  | 8000  | Django dev server (HTTP only)  |
| Daphne   | django_daphne   | 8001  | Django Channels (WebSocket)    |
| Frontend | react_frontend  | 5173  | Vite dev server (HMR)          |
| DB       | mysql_db        | 3306  | MySQL 8.0                      |
| Redis    | redis           | 6379  | Channels / cache / Celery      |
| Celery   | django_celery   | —     | Background tasks (video HLS)   |

### Nginx routing
- `/` → Vite frontend (`react_frontend:5173`)
- `/api/`, `/admin/` → Django backend (`django_backend:8000`)
- `/ws/` → Daphne (`django_daphne:8001`)
- `/media/` → static media files

### Redis database assignment
- **db 0**: Channels layer
- **db 1**: django-redis cache
- **db 2**: Celery broker & result backend

## Key commands

```bash
# Build and start all services
docker-compose up --build

# View logs for a specific service
docker-compose logs -f backend

# Run Django management commands
docker-compose exec backend python manage.py <command>

# Run Celery task interactively
docker-compose exec backend celery -A backend worker --loglevel=info

# Rebuild a single service
docker-compose up -d --build <service>
```

## Auth

- **JWT tokens** stored in `localStorage`: keys `access` (25 min) and `refresh` (1 day).
- Access token refresh via `POST /api/token/refresh/`.
- WebSocket auth via `?token=<access_token>` query param (see `TokenAuthMiddleware` in `api/middleware.py`).
- Frontend: `api.js` axios instance auto-attaches `Bearer` header.

## Project layout

```
backend/
├── api/                    # Main Django app (models, views, serializers, consumers)
│   ├── model_views/        # Class-based DRF views split by model
│   ├── model_serializers/  # Serializers split by model
│   ├── consumer.py         # WebSocket consumers (AsyncChatConsumer, AsyncOnlineConsumer)
│   ├── routing.py          # WebSocket URL patterns
│   ├── tasks.py            # Celery tasks
│   ├── middleware.py       # WebSocket JWT auth middleware
│   └── tests.py            # Stub only
├── backend/                # Django project config (settings, urls, asgi, wsgi, celery)
└── manage.py

frontend/
├── src/
│   ├── main.tsx            # App entry — React Router setup
│   ├── api.js              # Axios instance + token refresh logic
│   ├── pages/              # Page-level components
│   ├── components/         # Reusable components (ui/, PostComponents/, MessageComponents/, ...)
│   ├── Contexts/           # WebSocketContext, Usercontext
│   ├── services/           # WebSocketService singleton, Utilities
│   ├── customhooks/        # useFileUpload
│   ├── lib/utils.ts        # shadcn/ui utility
│   ├── constants.js        # Token key names
│   └── browser.js          # window.global = window polyfill
└── vite.config.js          # Loads .env from ../.env (project root)
```

## Frontend specifics

- **Alias** `@/` → `src/` (Vite resolve + tsconfig paths).
- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (no `tailwind.config.js`).
- **shadcn/ui** — components in `src/components/ui/`.
- **i18next** — initialized in `src/i18next.js`.
- **Dark mode** — via `next-themes` (`.dark` class strategy).
- Router: React Router v7 (`createBrowserRouter`).
- Mixed `.tsx` / `.jsx` — some legacy components are JSX.

## Backend specifics

- Django loads `.env` from project root (`BASE_DIR.parent / ".env"`).
- MySQL adapter: `pymysql.install_as_MySQLdb()` at import time.
- **FFmpeg** is required for video processing (installed in Docker image). The `process_video` Celery task converts uploads to HLS.
- All API views default to `IsAuthenticated` permission (DRF global default).
- CORS wide open in dev (`CORS_ALLOW_ALL_ORIGINS = True`).

## Testing

- Backend has only a stub `tests.py`. No test runner configured yet.
- Frontend has no test framework configured.

## Important gotchas

- `.env` lives at the **project root**, shared by both backend and frontend.
- `VITE_API_URL` must be `http://localhost/` (goes through Nginx, not directly to port 8000).
- Frontend ESLint config is `.eslintrc.cjs` (CommonJS, not flat config).
- Some frontend imports use `.tsx` extension explicitly (e.g., `import Home from "./pages/Home.tsx"`).
- The `docker-compose.yml` uses `command: >` YAML folded block scalars — avoid breaking the inline shell commands.
