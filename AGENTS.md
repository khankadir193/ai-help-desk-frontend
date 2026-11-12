# AGENTS.md

Frontend SPA of the AI Help Desk project: React 19 + Vite 8, plain JS/JSX (no TypeScript), Tailwind-free (plain CSS). This folder is the git repo root; the Express backend lives in a sibling folder (`../../backend`) outside this repo.

## Commands

- `npm run dev` — Vite dev server on http://localhost:5173
- `npm run lint` — **the only automated check** (no tests, no typecheck, no CI); run it before finishing any change
- `npm run build` — production build

## Backend prerequisite

The API is required for auth and all data. Start it first from the sibling folder: `cd ../../backend && npm run dev` (Express on port 3000, needs PostgreSQL + `.env`). Test accounts: `D:\github-tests\Help Desk\testing users for ai help desk.txt`.

## API client rules (`src/lib/axios.js`)

- Never create a bare axios/fetch instance. The shared client sets `withCredentials: true` — required for the HttpOnly session cookie (`helpdesk.sid`); requests without it silently log out.
- `VITE_API_BASE_URL` (`.env`) is an absolute URL, so API calls hit port 3000 directly and **bypass the Vite `/api` proxy** in `vite.config.js` (dead config — don't rely on it or "fix" CORS by routing through it).
- The response interceptor unwraps `response.data` once; the backend envelope is `{ status, data: { ... } }`, so services unwrap a second time (`response?.data?.ticket ?? response?.ticket ?? ...`). Follow that pattern in new services.
- A 401 on non-auth endpoints dispatches `window` event `auth:session-expired` (AuthContext clears the cache and redirects). Never handle 401s manually in components.
- AI suggestion endpoints (`/tickets/:id/ai/*`) need a dedicated 30s timeout because the backend AI provider is slow and the shared timeout is 15s — see `classifyTicket` in `src/features/tickets/services/ticketService.js`.

## Auth & roles

- Auth state lives in the **React Query cache** under `AUTH_QUERY_KEY = ['auth', 'me']` (from `src/features/auth/authContextInstance.js`); `AuthContext.jsx` is an adapter (`signIn`/`signUp`/`signOut`) that mutates that cache. Don't add a separate auth store.
- Roles: `CUSTOMER`, `AGENT`, `ADMIN` (uppercase strings from `useAuth().role`). The backend enforces all scoping; UI checks are just for hiding controls.
- `/users/agents` is admin-only — gate the `useAgents` query behind `role === 'ADMIN'` or the query will 403.

## React Query defaults (`src/lib/queryClient.js`)

Queries: 5min staleTime, no retry on 401/403/404, no refetch on window focus. Mutations: never retried — don't override to prevent duplicate side effects.

## Conventions

- Feature-sliced structure: `src/features/<domain>/{pages,components,hooks,services,utils}`; pages/components are wired in `src/App.jsx`; endpoint paths live only in `src/constants/apiEndpoints.js`.
- ESLint includes `react-refresh/only-export-components` — keep non-component exports out of `.jsx` files; put contexts/constants in `.js` (pattern: `authContextInstance.js`).
- Styles are colocated with components (plain `.css` or `.module.css`); design tokens in `src/styles/variables.css`.
- React Router v7 future flags are already enabled in `src/main.jsx` — keep them when touching the router.
- Commits follow conventional style, lowercase: `feat: add routing configuration...`.
