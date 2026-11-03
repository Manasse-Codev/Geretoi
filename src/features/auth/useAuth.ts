import { useContext } from 'react';
import { AuthContext } from '@/features/auth/authContext';
import type { AuthContextValue } from '@/features/auth/authTypes';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}
