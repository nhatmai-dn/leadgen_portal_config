import type { SignInBody } from 'src/api/authApi';

import axios from 'axios';
import * as yup from 'yup';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import InputAdornment from '@mui/material/InputAdornment';
import { useLocation, useNavigate } from 'react-router-dom';

import authApi from 'src/api/authApi';
import { useAuthStore } from 'src/store/auth-store';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const schema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email'),
  password: yup.string().required('Password is required'),
});

function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'Incorrect email or password.';
    const detail = (error.response?.data as { message?: string } | undefined)?.message;
    if (detail) return detail;
    if (!error.response) return 'Cannot reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
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
    defaultValues: { email: '', password: '' },
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
          gap: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 5
        }}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
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
        sx={{
          display: "flex",
          flexDirection: "column"
        }}>
        <TextField
          fullWidth
          label="Email address"
          autoComplete="username"
          error={!!errors.email}
          helperText={errors.email?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ mb: 3 }}
          {...register('email')}
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
