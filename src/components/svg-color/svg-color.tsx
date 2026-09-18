import type { SvgColorProps } from './types';

import Box from '@mui/material/Box';

import { svgColorClasses } from './classes';

// ----------------------------------------------------------------------

export function SvgColor({ src, width = 24, height, className, sx, ref, ...other }: SvgColorProps) {
  return (
    <Box
      ref={ref}
      component="span"
      className={svgColorClasses.root.concat(className ? ` ${className}` : '')}
      sx={{
        width,
        flexShrink: 0,
        height: height ?? width,
        display: 'inline-flex',
        bgcolor: 'currentColor',
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`,
        ...sx,
      }}
      {...other}
    />
  );
}
