import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { FirebaseError } from 'firebase/app';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { fr } from '@/i18n/fr';
import { AuthContext } from '@/features/auth/authContext';
import { auth } from '@/lib/firebase';
import { createEmailAccount, signInWithEmail, signInWithGoogle, signOutCurrentUser } from '@/features/auth/authService';
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
  const code = error instanceof FirebaseError ? error.code : '';
  if (typeof navigator !== 'undefined' && !navigator.onLine && ['auth/network-request-failed', 'unavailable', 'deadline-exceeded'].includes(code)) return 'offline';
  if (code === 'auth/invalid-email') return 'invalidEmail';
  if (code === 'auth/weak-password') return 'weakPassword';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(code)) {
    return 'invalidCredentials';
  }
  if (['auth/network-request-failed', 'unavailable', 'deadline-exceeded'].includes(code)) return 'networkUnavailable';
  if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(code)) return 'popupBlocked';
  if (code === 'auth/email-already-in-use') return 'emailAlreadyInUse';
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
    void getRedirectResult(auth).catch((caught: unknown) => {
      if (active) reportError(caught);
    });
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
        .catch((caught: unknown) => console.error(fr.data.errors[errors.toDataError(caught).code])));
  }, [authenticatedUid]);

  const runAuthAction = useCallback(async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (caught: unknown) {
      reportError(caught);
    }
  }, [reportError]);

  const signIn = useCallback((email: string, password: string) =>
    runAuthAction(() => signInWithEmail(email, password)), [runAuthAction]);
  const register = useCallback((email: string, password: string) =>
    runAuthAction(() => createEmailAccount(email, password)), [runAuthAction]);
  const signInGoogle = useCallback(() => runAuthAction(signInWithGoogle), [runAuthAction]);
  const signOutUser = useCallback(() => runAuthAction(signOutCurrentUser), [runAuthAction]);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    errorMessage: error ? fr.auth.errors[error] : null,
    signIn,
    register,
    signInGoogle,
    signOut: signOutUser,
    clearError,
  }), [clearError, error, loading, register, signIn, signInGoogle, signOutUser, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

