import type { User } from 'firebase/auth';

export type AuthErrorCode =
  | 'invalidEmail'
  | 'emailInUse'
  | 'weakPassword'
  | 'invalidCredentials'
  | 'offline'
  | 'networkUnavailable'
  | 'pendingWrites'
  | 'providerUnavailable'
  | 'unknown';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: AuthErrorCode | null;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  continueAnonymously: () => Promise<void>;
}
