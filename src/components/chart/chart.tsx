import type { ChartProps } from './types';

import { lazy, Suspense } from 'react';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import type { BoxProps } from '@mui/material/Box';

import { chartClasses } from './classes';

// ----------------------------------------------------------------------

/**
 * ApexCharts is ~5x larger since v7 and is not needed for first paint, so it
 * loads on demand and ships in its own chunk rather than in the page bundle.
 */
const ApexChart = lazy(() => import('react-apexcharts'));

export function Chart({
  sx,
  type,
  series,
  height,
  options,
  className,
  width = '100%',
  ...other
}: Omit<BoxProps, 'width' | 'height'> & ChartProps) {
  return (
    <Box
      dir="ltr"
      className={chartClasses.root.concat(className ? ` ${className}` : '')}
      sx={{
        width,
        height,
        flexShrink: 0,
        borderRadius: 1.5,
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      <Suspense
        fallback={<Skeleton variant="rounded" sx={{ width: 1, height: 1 }} animation="wave" />}
      >
        <ApexChart type={type} series={series} options={options} width="100%" height="100%" />
      </Suspense>
    </Box>
  );
}
