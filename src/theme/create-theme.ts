import type { Theme } from '@mui/material/styles';
import { createTheme as createMuiTheme } from '@mui/material/styles';

import { shadows, typography, components, colorSchemes, customShadows } from './core';

// ----------------------------------------------------------------------

/**
 * v9: `experimental_extendTheme` is gone. CSS theme variables are now opted
 * into on the regular `createTheme` via `cssVariables`, and consumed through
 * `theme.vars.*` exactly as before.
 */
export function createTheme(): Theme {
  return createMuiTheme({
    colorSchemes,
    shadows: shadows(),
    customShadows: customShadows(),
    shape: { borderRadius: 8 },
    components,
    typography,
    cssVariables: {
      cssVarPrefix: '',
      shouldSkipGeneratingVar,
    },
  });
}

// ----------------------------------------------------------------------

function shouldSkipGeneratingVar(keys: string[], _value: string | number): boolean {
  const skipGlobalKeys = [
    'mixins',
    'overlays',
    'direction',
    'typography',
    'breakpoints',
    'transitions',
    'cssVarPrefix',
    'unstable_sxConfig',
  ];

  const skipPaletteKeys: {
    [key: string]: string[];
  } = {
    global: ['tonalOffset', 'dividerChannel', 'contrastThreshold'],
    grey: ['A100', 'A200', 'A400', 'A700'],
    text: ['icon'],
  };

  const isPaletteKey = keys[0] === 'palette';

  if (isPaletteKey) {
    const paletteType = keys[1];
    const skipKeys = skipPaletteKeys[paletteType] || skipPaletteKeys.global;

    return keys.some((key) => skipKeys?.includes(key));
  }

  return keys.some((key) => skipGlobalKeys?.includes(key));
}
