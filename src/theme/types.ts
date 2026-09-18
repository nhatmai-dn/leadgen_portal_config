/**
 * Opt in to CSS theme variables at the type level.
 *
 * MUI v9 types `theme.vars` as optional unless this augmentation is present.
 * `createTheme({ cssVariables: ... })` in `create-theme.ts` enables it at
 * runtime; this makes `theme.vars.*` non-optional for TypeScript.
 */
declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }
}

export {};
