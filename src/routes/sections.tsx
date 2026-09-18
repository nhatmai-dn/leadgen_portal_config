import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { AuthGuard, GuestGuard, RouteFallback } from './components';

// ----------------------------------------------------------------------

/**
 * Route modules are code-split, and the import functions are kept around so
 * they can also be warmed ahead of the click — see `usePrefetchRoutes`.
 */
const importHome = () => import('src/pages/home');
const importCampaignConfig = () => import('src/pages/campaign-config');
const importSignIn = () => import('src/pages/sign-in');
const importNotFound = () => import('src/pages/page-not-found');

export const HomePage = lazy(importHome);
export const CampaignConfigPage = lazy(importCampaignConfig);
export const SignInPage = lazy(importSignIn);
export const Page404 = lazy(importNotFound);

// ----------------------------------------------------------------------

const SIGNED_IN_ROUTES = [importHome, importCampaignConfig];

/**
 * Pull the other pages' chunks once the browser is idle. Without this the
 * first visit to a tab pays a network round trip; with it, switching tabs is
 * a render and nothing else.
 */
function usePrefetchRoutes() {
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300));
    const handle = idle(() => {
      SIGNED_IN_ROUTES.forEach((load) => {
        // A failed prefetch is not an error: the real navigation will retry.
        load().catch(() => {});
      });
    });

    return () => window.cancelIdleCallback?.(handle as number);
  }, []);
}

// ----------------------------------------------------------------------

export function Router() {
  usePrefetchRoutes();

  return useRoutes([
    {
      element: (
        <AuthGuard>
          <DashboardLayout>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </AuthGuard>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'campaign-config', element: <CampaignConfigPage /> },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <GuestGuard>
          <AuthLayout>
            <SignInPage />
          </AuthLayout>
        </GuestGuard>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
