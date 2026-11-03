import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';
import type { Tag } from '@/types/models';
import { DataError, toDataError } from '@/features/tasks/dataErrors';
import type { SyncMetadata } from '@/features/tasks/taskRepository';
import { subscribeTags } from './tagRepository';

export interface TagsState { tags: Tag[]; loading: boolean; error: DataError | null; errorMessage: string | null; isEmpty: boolean; sync: SyncMetadata }
const initialSync: SyncMetadata = { fromCache: true, hasPendingWrites: false, isOffline: typeof navigator !== 'undefined' && !navigator.onLine };

export function useTags(): TagsState {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [sync, setSync] = useState(initialSync);
  useEffect(() => {
    let active = true;
    if (!user) { setTags([]); setError(new DataError('unauthenticated')); setLoading(false); return undefined; }
    setTags([]); setLoading(true); setError(null); setSync(initialSync);
    const unsubscribe = subscribeTags(user.uid, (items, status) => { if (active) { setTags(items); setError(null); setSync(status); setLoading(false); } }, (caught) => { if (active) { const dataError = toDataError(caught); setError(dataError); setSync((current) => ({ ...current, errorCode: dataError.code })); setLoading(false); } });
    return () => { active = false; unsubscribe(); };
  }, [user]);
  return { tags, loading, error, errorMessage: error ? fr.data.errors[error.code] : null, isEmpty: !loading && tags.length === 0, sync };
}
