import * as yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useLocation, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import authApi from 'src/api/authApi';
import type { SignInBody } from 'src/api/authApi';
import { isApiError } from 'src/api/baseApiRequest';

import { useAuthStore } from 'src/store/auth-store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const schema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

function errorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.isUnauthorized) return 'Incorrect username or password.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

// ----------------------------------------------------------------------

export function SignInView() {
  const navigate = useNavigate();
  const location = useLocation();

  const signIn = useAuthStore((state) => state.signIn);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInBody>({
    resolver: yupResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      signIn({ token, user });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    },
  });

  return (
    <>
      <Box
        sx={{
          mb: 5,
          gap: 1.5,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" color="text.secondary">
          LeadGen Portal Config
        </Typography>
      </Box>

      {!!error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage(error)}
        </Alert>
      )}

      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit((values) => mutate(values))}
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <TextField
          fullWidth
          label="Username"
          autoComplete="username"
          error={!!errors.username}
          helperText={errors.username?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 3 }}
          {...register('username')}
        />

        <TextField
          fullWidth
          label="Password"
          autoComplete="current-password"
          type={showPassword ? 'text' : 'password'}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
          {...register('password')}
        />

        <Button
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          loading={isPending}
        >
          Sign in
        </Button>
      </Box>
    </>
  );
}
