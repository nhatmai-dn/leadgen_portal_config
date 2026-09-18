import Box from '@mui/material/Box';
import { Icon } from '@iconify/react';

import { iconifyClasses } from './classes';

import type { IconifyProps } from './types';

// ----------------------------------------------------------------------

export function Iconify({ className, width = 20, sx, ref, ...other }: IconifyProps) {
  return (
    <Box
      ref={ref}
      component={Icon}
      className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
      sx={{
        width,
        height: width,
        flexShrink: 0,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    />
  );
}
