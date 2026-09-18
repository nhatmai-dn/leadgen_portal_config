import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { createTheme } from './create-theme';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/**
 * v9: `Experimental_CssVarsProvider` was folded into `ThemeProvider`, and the
 * `themeCssVarsAugmentation` / `@mui/lab/themeAugmentation` type imports are
 * no longer needed.
 */
export function ThemeProvider({ children }: Props) {
  const theme = createTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
