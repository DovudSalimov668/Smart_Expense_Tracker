# Smart Expense Tracker

A portfolio-quality full-stack expense tracking MVP built with React, Vite, Tailwind CSS, Django REST Framework, SimpleJWT, SQLite, Recharts, Axios, and React Hot Toast.

## Features

- JWT register, login, refresh, logout, protected routes
- User profile and settings with dark/light mode
- Dashboard totals, monthly summary, recent transactions, category cards
- Transaction CRUD with income/expense types, categories, notes, dates, search, filters, pagination
- Default and custom categories
- Monthly category budgets with remaining balance and warning states
- Analytics with pie, line, and bar charts
- CSV export and PDF export for transactions
- Responsive app layout with loading, error, and empty states

## Project Structure

```text
backend/
  config/
  users/
  expenses/
frontend/
  src/
    api/
    components/
    context/
    hooks/
    layouts/
    pages/
    utils/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

The demo account is:

```text
username: demo
password: DemoPass123!
```

API base URL: `http://127.0.0.1:8000/api`

Important endpoints:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `GET/PATCH /api/profile/`
- `GET/POST /api/categories/`
- `GET/POST /api/transactions/`
- `GET/POST /api/budgets/`
- `GET /api/dashboard/`
- `GET /api/transactions/export-csv/`
- `GET /api/transactions/export-pdf/`

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Environment Files

Local `.env` files are intentionally ignored by Git. Use the examples as templates:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

For local development, the default values in those files are enough.

## Quick Launch Scripts

From the project root on Windows:

```bash
start-dev.cmd
```

This opens two terminal windows:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:5173`

You can also start each side separately:

```bash
start-backend.cmd
start-frontend.cmd
```

Or use npm shortcuts from the root:

```bash
npm run dev
npm run dev:backend
npm run dev:frontend
```

The backend launcher runs migrations before starting Django and prefers `backend/.venv` when it exists.

## Free Deployment

Recommended free-friendly setup:

- Frontend: Vercel
- Backend API: Render
- Database: Neon Postgres

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api
```

Backend on Render:

- Use `render.yaml` as a blueprint, or create a Python web service manually.
- Root directory: `backend`
- Build command:

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

- Start command:

```bash
gunicorn config.wsgi:application
```

Backend environment variables:

```text
SECRET_KEY=generate-a-long-random-secret
DEBUG=False
ALLOWED_HOSTS=your-render-backend-url.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-frontend-url.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-vercel-frontend-url.vercel.app
DATABASE_URL=your-neon-postgres-url
```

After deploy, run the demo seed command from the Render shell if you want the demo account online:

```bash
python manage.py seed_demo
```

## UI Design Direction

The frontend is styled as a modern Figma-inspired finance dashboard: crisp cards, restrained radius, clean chart framing, dense table layouts, and consistent form/control states.

Theme presets are available in Settings and persist locally:

- Studio Light
- Midnight Slate
- Emerald Ledger
- Indigo Focus
- Rose Premium
- Graphite Pro

Each theme uses shared CSS tokens so surfaces, accents, auth screens, charts, buttons, and backgrounds stay visually consistent. If you provide an actual Figma file or design link later, the UI can be matched to that source more precisely.

## Development Notes

- Backend data is owner-scoped in every viewset.
- Default categories are created automatically per user when categories are requested.
- SQLite is used for local development and portfolio demos.
- PDF export uses `reportlab`; if it is not installed, the API returns a clear `501` response.
- Frontend token refresh is handled by an Axios interceptor.

## Production Next Steps

- Add email verification and password reset
- Add unit and integration tests
- Add Docker Compose
- Add recurring transactions
- Add import from bank CSV files
