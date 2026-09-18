# LeadGen Portal — Config UI

Internal admin UI for configuring lead-generation and SMS campaign pipelines.

Stack: React 19 · TypeScript · Vite 5 · MUI 9 · TanStack Query · Zustand · React Router 6.

## Getting started

```bash
cp .env.example .env   # set VITE_API_URL
yarn install
yarn dev               # http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `yarn dev` | Dev server with HMR + type/lint overlay |
| `yarn build` | Type-check (`tsc -b`) then production build |
| `yarn start` | Preview the production build |
| `yarn lint` / `lint:fix` | ESLint |
| `yarn fm:check` / `fm:fix` | Prettier |

## Environment

Only variables prefixed `VITE_` reach the client. Declare each one in `env.d.ts`
so it is typed. `.env` is gitignored — `.env.example` is the source of truth for
which variables exist.

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API |

## Architecture

```
src/
  api/         axios instance + endpoint modules
  lib/         query client
  store/       zustand stores (client state only)
  routes/      route table + auth guards
  layouts/     dashboard / auth / simple shells
  sections/    feature views composed into pages
  pages/       route entry points (lazy loaded)
  components/  shared presentational components
  theme/       MUI theme
```

**State split.** Server data goes through TanStack Query (`useQuery` /
`useMutation`) — never copied into a store. Client state (auth session, UI
toggles) goes in Zustand. There is no Redux.

**Auth.** The token lives in `src/store/auth-store.ts` (persisted to
localStorage). The axios request interceptor attaches it; a 401 response clears
the session and redirects to `/sign-in`. Routes are wrapped in `AuthGuard`.

## Theming

The theme uses MUI CSS theme variables. `createTheme({ cssVariables })` in
`src/theme/create-theme.ts` enables them; `src/theme/types.ts` augments
`CssThemeVariables` so `theme.vars.*` is non-optional for TypeScript. Custom
palette keys (`lighter`, `darker`, `background.neutral`, `*Channel`) are
declared in `src/theme/core/palette.ts`.

Page titles use React 19's native document metadata — a plain `<title>` in the
page component, no Helmet provider.

## Upgrade status

This codebase originated from the Minimal UI free template. Phases 0 and 2 are
done; Vite 8, TypeScript 7 and the ESLint flat config (phase 1) and React Router
7 (phase 3) remain — see `CHANGELOG.md`.
