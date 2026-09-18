# Changelog

## Unreleased — Phase 0: cleanup

Baseline: Minimal UI free template v2.0.0 (Aug 2024).

### Fixed

- `VITE_API_URL` replaces `REACT_APP_API_URL`; Vite never exposed the latter, so
  `baseURL` was `undefined` and every request hit the app origin.
- Removed `Access-Control-Allow-Origin` from outgoing request headers — it is a
  response header and only triggered needless CORS preflights.
- `import App from './App'` — the previous `'./app'` resolved on case-insensitive
  filesystems only and broke Linux/CI builds.
- Axios request interceptor now has a rejection handler; response interceptor
  rejects instead of throwing synchronously.
- Dropped `@mui/icons-material` v6, which was mismatched against `@mui/material`
  v5. Its single usage now goes through `Iconify`.
- Removed stray `console.log` in the saga root.

### Changed

- Async/server state moved to TanStack Query. Redux Toolkit, redux-saga and
  react-redux removed; auth session moved to a Zustand store.
- Sign-in is wired to `authApi.login` with react-hook-form + yup validation and
  real error states, replacing the hardcoded demo credentials.
- Dashboard routes are behind `AuthGuard`; `/sign-in` is behind `GuestGuard`.
- Logout calls the API and clears the session and query cache.
- `engines.node` raised to `>=22` (Node 20 reached EOL in April 2026).
- App renamed from "Minimal UI"; README and CHANGELOG rewritten for this project.

### Removed

- Template demo surface: `_mock`, Counter page and Redux slice, blog / products /
  user pages and sections, workspace switcher, language switcher, notifications
  popover, "Upgrade to Pro" nav block, and the mock-only analytics cards.
- Unused dependencies: `history`, `@mui/icons-material`.
- Template demo assets under `public/assets` (product / avatar / cover images,
  flags, workspace logos, notification icons).

## Unreleased — Phase 2: React 19 + MUI 9

### Changed

- React 18 → 19, `@types/react` 19, TypeScript 5.9.
- MUI 5 → 9 (skipping 6/7/8), `@iconify/react` 5 → 6, `@hookform/resolvers`
  3 → 5, ApexCharts 3 → 7 with `react-apexcharts` 1 → 2.
- Theme: `experimental_extendTheme` + `Experimental_CssVarsProvider` are gone in
  v9 — replaced by `createTheme({ cssVariables })` and the regular
  `ThemeProvider`. `src/theme/types.ts` augments `CssThemeVariables` so
  `theme.vars.*` stays non-optional.
- Palette/typography module augmentations moved off the removed deep paths
  (`@mui/material/styles/createPalette`, `.../createTypography`) onto
  `@mui/material/styles`; `TypographyOptions` → `TypographyVariantsOptions`.
- v9 removed system props (`display`, `gap`, `flexDirection`, `width`, …) from
  layout components — all moved into `sx` (mostly via the official
  `v6.0.0/system-props` codemod). `Chart`, `SvgColor`, `Logo` and `Iconify`
  declare `width`/`height` as their own props.
- Button `containedInherit` style override → the `variants` API; CardHeader
  `titleTypographyProps` / `subheaderTypographyProps` → `slotProps`; TextField
  `InputProps` / `InputLabelProps` → `slotProps`.
- `Unstable_Grid2` → `@mui/material/Grid` with the `size` prop.
- `theme.shape.borderRadius` is `string | number` in v9 — arithmetic on it is
  now wrapped in `Number(...)`.

### Removed

- `react-helmet-async` — React 19 hoists `<title>` natively, so pages render a
  plain `<title>` and `main.tsx` no longer wraps the app in `HelmetProvider`.
- `@mui/lab` — its only use was `LoadingButton`, which is now `Button loading`.
- `disableCache` from `@iconify/react`, removed in v6.

### Known follow-ups

- The `home` chunk grew from ~565 kB to ~992 kB (gzip 151 → 290 kB). ApexCharts
  7's dist is ~5× the size of v3's. (Fixed in phase 3 by lazy-loading.)
- `forwardRef` is still used in `label`, `scrollbar`, `logo`, `color-utils` and
  `router-link`. (Done in phase 1.)

## Unreleased — Phase 1: toolchain

### Changed

- Vite 5 → 8 (Rolldown), `@vitejs/plugin-react-swc` 3 → 4, `vite-plugin-checker`
  0.7 → 0.14 (`eslint.useFlatConfig`). TypeScript 5.9 → 6.
- ESLint 8 (EOL) → 10, `.eslintrc.cjs` → `eslint.config.js` flat config.
  `eslint-config-airbnb` / `-airbnb-typescript` / `eslint-plugin-import` /
  `eslint-plugin-prettier` removed; `@typescript-eslint/*` 7 → the unified
  `typescript-eslint` 8; `react-hooks` 4 → 7, `perfectionist` 2 → 5,
  `unused-imports` 3 → 4, `eslint-config-prettier` 9 → 10.
- `tsconfig.json`: `baseUrl` (deprecated in TS 6, removed in 7) replaced by
  `paths: { "src/*": ["./src/*"] }`, which resolves relative to the config file.
- `vite.config.ts`: the `process.cwd()` regex aliases replaced with a single
  `fileURLToPath(new URL('./src', import.meta.url))` alias matching `paths`.
- `tsconfig.node.json` now emits to `node_modules/.tmp` — the composite project
  had been writing `vite.config.d.ts` and `vite.config.js` into the repo root.
- Converted the remaining `forwardRef` components (`Label`, `Scrollbar`, `Logo`,
  `ColorPreview`, `ColorPicker`, `RouterLink`) to React 19 ref-as-prop. The new
  config's `react/display-name` rule flagged all six, which closes the follow-up
  left open in phase 2.

### Fixed

- `jsx-a11y/no-autofocus` on the header search input — new rule coverage the old
  config did not have. The autofocus is intentional (the field only mounts on
  click) and is now disabled inline with that reasoning.

### Notes

- **ESLint 10 is not officially supported by two plugins.** `eslint-plugin-react`
  (peer `^9.7`) and `eslint-plugin-jsx-a11y` (peer `^9`) resolve via npm
  `overrides`. `eslint-plugin-react` genuinely crashes on ESLint 10 while
  auto-detecting the React version, so `settings.react.version` is pinned to
  `'19.3'`; with that pin both plugins run clean. ESLint 9 was rejected because
  npm now reports it end-of-life.
- `perfectionist` v5 renamed several options: `newlinesBetween: 'always'` → `1`,
  `customGroups` is an array of `{ groupName, elementNamePattern }`, and the
  `*-type` / `object` import groups no longer exist.
- Rolldown shrank the shared `index` chunk from 635 kB to 320 kB (gzip 206 → 99).
  The `home` chunk is still ~959 kB because of ApexCharts 7; lazy-loading the
  charts remains the open item from phase 2.

## Unreleased — Phase 3: router, tests, CI

### Changed

- `react-router-dom` 6 → `react-router` 8. The DOM package stopped at 7.x;
  `react-router` is the current line and exports everything this app used, so
  the migration was an import rename. The declarative `<BrowserRouter>` +
  `useRoutes` setup was kept — `createBrowserRouter` only pays off once routes
  need loaders/actions, which none do yet.
- Charts now load on demand: `Chart` wraps `react-apexcharts` in
  `lazy()` + `Suspense` with a skeleton fallback. The `home` chunk drops from
  959 kB to **22.8 kB** (gzip 275 → 7.5 kB) and ApexCharts ships as its own
  chunk fetched when a chart first mounts. This closes the bundle regression
  opened in phase 2.

### Added

- Vitest 5 + Testing Library + jsdom. `vitest.config.ts` is separate from the
  Vite config so tests skip `vite-plugin-checker`. `src/test/render.tsx` renders
  through QueryClient / MemoryRouter / ThemeProvider.
- 28 tests over the parts with real branching: auth store (persistence,
  sign-out), route guards (`AuthGuard` / `GuestGuard` in both directions), axios
  interceptors (bearer header, 401 clears the session, 500 does not), query
  retry policy (no retry on 4xx, retry on 5xx and network errors), and the
  sign-in form (validation blocks the request, success stores the session, 401 /
  server-message / offline all render distinct messages, password toggle).
- `.github/workflows/ci.yml`: typecheck → lint → test → build on push to `main`
  and on pull requests, Node pinned from `.nvmrc`.
- `src/test/setup.ts` silences jsdom's "Could not parse CSS stylesheet" noise —
  jsdom cannot parse the CSS MUI 9 emits — while leaving other console errors
  visible.

## Planned

Nothing scheduled. Worth considering next:

- Migrate to `createBrowserRouter` when a route needs a loader or action.
- Drop the ESLint `overrides` once `eslint-plugin-react` and
  `eslint-plugin-jsx-a11y` support ESLint 10.
- TypeScript 7 once `typescript-eslint` supports it (its peer range currently
  stops below 6.1).
