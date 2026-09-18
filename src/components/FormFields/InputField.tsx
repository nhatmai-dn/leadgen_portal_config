import type { Control } from 'react-hook-form';
import type { InputBaseProps, SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';

import { useController } from 'react-hook-form';
import { Box, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { Error, StyledInput, StyledPaper } from './styles';

interface InputFieldProps extends InputBaseProps {
  name: string;
  control: Control<any>;
  style?: object;
  Icon?: OverridableComponent<SvgIconTypeMap<object, 'svg'>> & {
    muiName: string;
  };
  colorIcon?: string;
  onClickIcon?: () => void;
}

export const InputField = ({
  name,
  control,
  style,
  Icon,
  colorIcon,
  onClickIcon,
  ...inputProps
}: InputFieldProps) => {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { invalid, error },
  } = useController({ name, control });

  return (
    <Box>
      <StyledPaper invalid={invalid.toString()} styles={style}>
        <StyledInput
          id={name}
          value={value}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          inputRef={ref}
          {...inputProps}
          onKeyDown={(e) => {
            if (inputProps.type === 'number') {
              if (['e', '-', '+'].includes(e.key)) {
                e.preventDefault();
              }
            }
          }}
        />

        {Icon && (
          <IconButton
            sx={{ p: '10px' }}
            disableRipple
            component="label"
            htmlFor={name}
            onClick={onClickIcon}
          >
            <Icon fontSize="small" sx={{ color: colorIcon || 'text.secondary' }} />
          </IconButton>
        )}
      </StyledPaper>
      {error && (
        <Error>
          <Iconify icon="eva:close-fill" width={14} sx={{ mr: '5px' }} />
          {error?.message}
        </Error>
      )}
    </Box>
  );
};
