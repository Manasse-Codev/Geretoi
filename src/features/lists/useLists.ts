import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';
import type { List } from '@/types/models';
import { DataError, toDataError } from '@/features/tasks/dataErrors';
import type { SyncMetadata } from '@/features/tasks/taskRepository';
import { subscribeLists } from './listRepository';

export interface ListsState { lists: List[]; loading: boolean; error: DataError | null; errorMessage: string | null; isEmpty: boolean; sync: SyncMetadata }
const initialSync: SyncMetadata = { fromCache: true, hasPendingWrites: false, isOffline: typeof navigator !== 'undefined' && !navigator.onLine };

export function useLists(): ListsState {
  const { user } = useAuth();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [sync, setSync] = useState(initialSync);
  useEffect(() => {
    let active = true;
    if (!user) { setLists([]); setError(new DataError('unauthenticated')); setLoading(false); return undefined; }
    setLists([]); setLoading(true); setError(null); setSync(initialSync);
    const unsubscribe = subscribeLists(user.uid, (items, status) => { if (active) { setLists(items); setError(null); setSync(status); setLoading(false); } }, (caught) => { if (active) { const dataError = toDataError(caught); setError(dataError); setSync((current) => ({ ...current, errorCode: dataError.code })); setLoading(false); } });
    return () => { active = false; unsubscribe(); };
  }, [user]);
  return { lists, loading, error, errorMessage: error ? fr.data.errors[error.code] : null, isEmpty: !loading && lists.length === 0, sync };
}
