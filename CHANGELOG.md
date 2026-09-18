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
  7's dist is ~5× the size of v3's. Worth lazy-loading the chart components or
  reassessing the charting library.
- `forwardRef` is still used in `label`, `scrollbar`, `logo`, `color-utils` and
  `router-link`. React 19 accepts `ref` as a plain prop and deprecates
  `forwardRef`, but it still works; converting these is cosmetic and was left
  out to keep this diff reviewable.

## Planned

- **Phase 1 — toolchain:** Vite 8, TypeScript 5.9+, `moduleResolution: bundler`,
  ESLint 9/10 flat config replacing the unmaintained airbnb config.
- **Phase 3:** React Router 7, ApexCharts 7, Vitest + Testing Library, CI.
