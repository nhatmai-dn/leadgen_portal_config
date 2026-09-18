import type { IconProps } from '@iconify/react';
import type { BoxProps } from '@mui/material/Box';

// ----------------------------------------------------------------------

export type IconifyProps = Omit<BoxProps, 'width' | 'height' | 'ref'> &
  IconProps & {
    /** v9: width/height are no longer Box system props. */
    width?: number | string;
    ref?: React.Ref<SVGElement>;
  };
