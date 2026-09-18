import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

/**
 * A progress bar that only appears if the wait is long enough to notice.
 *
 * Route chunks are prefetched, so most navigations resolve in well under
 * this delay — showing a bar for 80 ms reads as a flicker, which feels worse
 * than showing nothing at all.
 */
const DELAY_MS = 250;

export function RouteFallback() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Box sx={{ display: 'flex', flex: '1 1 auto', alignItems: 'center', justifyContent: 'center' }}>
      <LinearProgress
        sx={{
          width: 1,
          maxWidth: 320,
          bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
          [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
        }}
      />
    </Box>
  );
}
