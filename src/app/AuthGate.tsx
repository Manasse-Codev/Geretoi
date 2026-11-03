import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';

export interface AuthGateProps extends PropsWithChildren {
  mode?: 'protected' | 'guest';
}

export function AuthGate({ children, mode = 'protected' }: AuthGateProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="auth-loading" role="status"><span className="auth-loading__mark" aria-hidden="true" />{fr.auth.loading}</main>;
  }
  if (mode === 'protected' && !user) return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  if (mode === 'guest' && user) return <Navigate replace to="/" />;
  return children;
}
