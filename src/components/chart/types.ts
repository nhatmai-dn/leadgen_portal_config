import type { Props } from 'react-apexcharts';
import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

// ----------------------------------------------------------------------

/** A fixed size, or one value per breakpoint. */
type ChartSize = number | string | Partial<Record<Breakpoint, number | string>>;

export type ChartProps = {
  type: Props['type'];
  series: Props['series'];
  options: Props['options'];
  /**
   * MUI v9 removed `width` / `height` as Box system props, so the chart
   * declares them itself and forwards them through `sx`.
   */
  width?: ChartSize;
  height?: ChartSize;
};

export type ChartBaseProps = Props;

export type ChartOptions = Props['options'];

export type ChartLoadingProps = {
  disabled?: boolean;
  sx?: SxProps<Theme>;
};
