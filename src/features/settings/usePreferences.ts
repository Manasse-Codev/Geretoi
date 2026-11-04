import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { DocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/features/auth/useAuth';
import { firestore } from '@/lib/firestore';
import type { UserPreferences } from '@/types/models';
import { preferencesConverter } from '@/features/settings/preferencesConverter';
import { shareSubscription } from '@/lib/sharedSubscription';
import { clearSyncError, setSyncError } from '@/lib/syncStatus';
import { toDataError } from '@/features/tasks/dataErrors';

export const defaultPreferences: UserPreferences = {
  theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'comfortable',
};

function cachedTheme(): UserPreferences['theme'] {
  try {
    const theme = localStorage.getItem('dayflow-theme');
    return theme === 'light' || theme === 'dark' || theme === 'auto' ? theme : 'auto';
  } catch { return 'auto'; }
}

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(() => ({ ...defaultPreferences, theme: cachedTheme() }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) { setPreferences(defaultPreferences); setLoading(false); return undefined; }
    setLoading(true);
    return shareSubscription<DocumentSnapshot<UserPreferences>>(`${user.uid}:preferences`, (next, onError) => onSnapshot(doc(firestore, 'users', user.uid, 'profile', 'preferences').withConverter(preferencesConverter), next, onError), (snapshot) => {
      const next = snapshot.exists() ? { ...defaultPreferences, ...snapshot.data() } : defaultPreferences;
      clearSyncError();
      setPreferences(next);
      try { localStorage.setItem('dayflow-theme', next.theme); } catch { /* Le profil reste la source de préférence. */ }
      setLoading(false); setError(null);
    }, (caught: unknown) => { const dataError = toDataError(caught); setSyncError(dataError.code); setError(dataError); setLoading(false); });
  }, [reloadKey, user]);

  const update = useCallback(async (changes: Partial<UserPreferences>) => {
    if (!user) throw new Error('unauthenticated');
    const nextPreferences = { ...preferences, ...changes };
    try { localStorage.setItem('dayflow-theme', nextPreferences.theme); } catch { /* Le thème reste enregistré dans le profil. */ }
    await setDoc(doc(firestore, 'users', user.uid, 'profile', 'preferences').withConverter(preferencesConverter), nextPreferences);
  }, [preferences, user]);

  const retry = useCallback(() => { setLoading(true); setReloadKey((current) => current + 1); }, []);
  return { preferences, loading, error, update, retry };
}
