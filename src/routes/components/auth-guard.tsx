import { Navigate, useLocation } from 'react-router';

import { useAuthStore } from 'src/store/auth-store';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

/** Blocks a route until a token exists, preserving the attempted URL. */
export function AuthGuard({ children }: Props) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

// ----------------------------------------------------------------------

/** Keeps an already signed-in user out of /sign-in. */
export function GuestGuard({ children }: Props) {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
