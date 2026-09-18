import type { IconifyProps } from './types';

import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';

import { iconifyClasses } from './classes';

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
