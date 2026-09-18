# LeadGen Portal — Config UI

Internal admin UI for configuring lead-generation and SMS campaign pipelines.

Stack: React 19 · TypeScript 6 · Vite 8 · MUI 9 · TanStack Query · Zustand · React Router 8.

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
| `yarn lint` / `lint:fix` | ESLint (flat config, `eslint.config.js`) |
| `yarn fm:check` / `fm:fix` | Prettier |
| `yarn test` / `test:watch` | Vitest |
| `yarn test:coverage` | Vitest with a v8 coverage report |

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

## Linting

`eslint.config.js` is flat config. `eslint-config-airbnb` is gone — it never
shipped a maintained flat build — and its rules were reproduced only where they
earned their place, on top of `typescript-eslint`, `eslint-plugin-react`,
`react-hooks` and `jsx-a11y`.

Two pins worth knowing about: `eslint-plugin-react` and `eslint-plugin-jsx-a11y`
still declare ESLint 9 as their peer maximum, so `package.json` has `overrides`
letting them resolve against ESLint 10, and `settings.react.version` is pinned
because the plugin's auto-detection crashes on ESLint 10. Drop both once those
plugins ship ESLint 10 support.

## Tests

Vitest + Testing Library, jsdom environment, config in `vitest.config.ts`
(separate from `vite.config.ts` so the suite does not pay for
`vite-plugin-checker` re-running tsc and eslint on every run).

`src/test/render.tsx` renders through the providers the app actually uses —
QueryClient (retries off), MemoryRouter, ThemeProvider — so component tests
exercise the real wiring. Coverage today is the logic with branches worth
protecting: the auth store, the route guards, the axios interceptors, the query
retry policy, and the sign-in form.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests and build on every
push to `main` and every pull request.

## Upgrade status

This codebase originated from the Minimal UI free template. All four planned
phases (0–3) are done — see `CHANGELOG.md` for what each one changed.
