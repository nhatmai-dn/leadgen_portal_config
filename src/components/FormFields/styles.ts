import { Box, Paper, Select, styled, InputBase } from '@mui/material';

interface IPaperProps {
  invalid: string;
  styles?: object;
}

export const StyledPaper = styled(Paper)<IPaperProps>(
  ({ theme, styles, invalid }) => ({
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: (theme.palette.background as any).input,
    boxShadow: 'none',
    minHeight: '48px',
    border: invalid === 'true' ? '1px solid #eb5757' : 'unset',
    flex: 1,
    ...styles,
  }),
);

export const StyledInput = styled(InputBase)(({ theme }) => ({
  marginLeft: 16,
  flex: 1,
  fontSize: 15,
  '& input::placeholder,& textarea::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
}));

export const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: (theme.palette.background as any).sidebar,
  fontSize: 15,
  minHeight: '48px',
  '& fieldset': { border: 'none' },
  '& svg': { color: theme.palette.text.primary },
}));

export const Error = styled(Box)({
  marginTop: 5,
  fontWeight: 500,
  fontSize: 12,
  lineHeight: 1.5,
  color: '#eb5757',
  display: 'flex',
  alignItems: 'center',
});
