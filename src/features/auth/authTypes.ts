import type { User } from 'firebase/auth';

export type AuthErrorCode =
  | 'invalidEmail'
  | 'weakPassword'
  | 'invalidCredentials'
  | 'offline'
  | 'networkUnavailable'
  | 'popupBlocked'
  | 'emailAlreadyInUse'
  | 'unknown';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: AuthErrorCode | null;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}
