import { useCallback, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from '@/features/auth/useAuth';
import { firestore } from '@/lib/firestore';
import type { UserPreferences } from '@/types/models';
import { preferencesConverter } from '@/features/settings/preferencesConverter';

export const defaultPreferences: UserPreferences = {
  theme: 'auto', language: 'fr', firstDayOfWeek: 'monday', timeFormat: '24h', density: 'comfortable',
};

export function usePreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) { setPreferences(defaultPreferences); setLoading(false); return undefined; }
    setLoading(true);
    return onSnapshot(doc(firestore, 'users', user.uid, 'profile', 'preferences').withConverter(preferencesConverter), (snapshot) => {
      if (snapshot.exists()) setPreferences({ ...defaultPreferences, ...snapshot.data() });
      setLoading(false); setError(null);
    }, (caught: Error) => { setError(caught); setLoading(false); });
  }, [user]);

  const update = useCallback(async (changes: Partial<UserPreferences>) => {
    if (!user) throw new Error('unauthenticated');
    const nextPreferences = { ...preferences, ...changes };
    await setDoc(doc(firestore, 'users', user.uid, 'profile', 'preferences').withConverter(preferencesConverter), nextPreferences);
  }, [preferences, user]);

  return { preferences, loading, error, update };
}
