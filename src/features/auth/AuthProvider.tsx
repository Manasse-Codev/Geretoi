import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { fr } from '@/i18n/fr';
import { AuthContext } from '@/features/auth/authContext';
import { auth } from '@/lib/firebase';
import { continueAnonymously, createEmailAccount, PendingWritesError, sendPasswordReset, signInWithEmail, signOutCurrentUser } from '@/features/auth/authService';
import type { AuthContextValue, AuthErrorCode } from '@/features/auth/authTypes';
import type { UserPreferences } from '@/types/models';

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'fr',
  firstDayOfWeek: 'monday',
  timeFormat: '24h',
  density: 'comfortable',
};

function toAuthErrorCode(error: unknown): AuthErrorCode {
  if (error instanceof PendingWritesError) return 'pendingWrites';
  const code = error instanceof FirebaseError ? error.code : '';
  if (typeof navigator !== 'undefined' && !navigator.onLine && ['auth/network-request-failed', 'unavailable', 'deadline-exceeded'].includes(code)) return 'offline';
  if (code === 'auth/invalid-email') return 'invalidEmail';
  if (code === 'auth/email-already-in-use') return 'emailInUse';
  if (code === 'auth/too-many-requests') return 'tooManyRequests';
  if (code === 'auth/operation-not-allowed') return 'providerUnavailable';
  if (code === 'auth/weak-password') return 'weakPassword';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(code)) {
    return 'invalidCredentials';
  }
  if (['auth/network-request-failed', 'unavailable', 'deadline-exceeded'].includes(code)) return 'networkUnavailable';
  return 'unknown';
}

async function ensureProfileExists(uid: string): Promise<void> {
  const [{ doc, getDocFromCache, runTransaction }, { firestore }] = await Promise.all([
    import('firebase/firestore'), import('@/lib/firestore'),
  ]);
  const profileRef = doc(firestore, 'users', uid, 'profile', 'preferences');
  try {
    const cachedProfile = await getDocFromCache(profileRef);
    if (cachedProfile.exists()) return;
  } catch {
    // A cache miss is expected on a first connection; the transaction below checks the server.
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  await runTransaction(firestore, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    if (!profileSnapshot.exists()) transaction.set(profileRef, defaultPreferences);
  });
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthErrorCode | null>(null);

  const reportError = useCallback((caught: unknown) => setError(toAuthErrorCode(caught)), []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setLoading(false);
      },
      (caught) => {
        if (!active) return;
        setError(toAuthErrorCode(caught));
        setLoading(false);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [reportError]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    const ensure = () => {
      void ensureProfileExists(user.uid).catch((caught: unknown) => {
        if (active) reportError(caught);
      });
    };
    ensure();
    window.addEventListener('online', ensure);
    return () => {
      active = false;
      window.removeEventListener('online', ensure);
    };
  }, [reportError, user]);

  const authenticatedUid = user?.uid;
  useEffect(() => {
    if (!authenticatedUid) return;
    void Promise.all([import('@/features/tasks/taskRepository'), import('@/features/tasks/dataErrors')])
      .then(([repository, errors]) => repository.purgeExpiredTasks(authenticatedUid)
        .catch((caught: unknown) => {
          if (import.meta.env.DEV) console.error(fr.data.errors[errors.toDataError(caught).code]);
        }));
  }, [authenticatedUid]);

  const runAuthAction = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    setError(null);
    try {
      return await action();
    } catch (caught: unknown) {
      reportError(caught);
      return undefined;
    }
  }, [reportError]);

  const signIn = useCallback(async (email: string, password: string) => {
    await runAuthAction(() => signInWithEmail(email, password));
  }, [runAuthAction]);
  const register = useCallback(async (email: string, password: string) => {
    await runAuthAction(() => createEmailAccount(email, password));
  }, [runAuthAction]);
  const resetPassword = useCallback(async (email: string) => {
    const result = await runAuthAction(() => sendPasswordReset(email));
    return result !== undefined;
  }, [runAuthAction]);
  const continueAnonymouslyAction = useCallback(async () => {
    await runAuthAction(continueAnonymously);
  }, [runAuthAction]);
  const signOutUser = useCallback(async () => {
    await runAuthAction(signOutCurrentUser);
  }, [runAuthAction]);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    errorMessage: error ? fr.auth.errors[error] : null,
    signIn,
    register,
    resetPassword,
    signOut: signOutUser,
    clearError,
    continueAnonymously: continueAnonymouslyAction,
  }), [clearError, continueAnonymouslyAction, error, loading, register, resetPassword, signIn, signOutUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
