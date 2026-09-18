import type { BoxProps } from '@mui/material/Box';

// ----------------------------------------------------------------------

export type SvgColorProps = BoxProps & {
  src: string;
  /** v9: width/height are no longer Box system props. */
  width?: number | string;
  height?: number | string;
  ref?: React.Ref<HTMLSpanElement>;
};
