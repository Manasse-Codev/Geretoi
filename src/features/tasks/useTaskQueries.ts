import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fr } from '@/i18n/fr';
import { useAuth } from '@/features/auth/useAuth';
import type { Task } from '@/types/models';
import { DataError, toDataError } from './dataErrors';
import { setSyncError } from '@/lib/syncStatus';
import {
  getHistoryPage, getTrashPage, subscribeOverdueTasks, subscribeTasksInRange, subscribeTodayTasks, subscribeUpcomingTasks, subscribeUnscheduledTasks,
} from './taskRepository';
import type { HistoryPage, SyncMetadata, TaskCursor } from './taskRepository';

const emptySync: SyncMetadata = { fromCache: true, hasPendingWrites: false, isOffline: typeof navigator !== 'undefined' && !navigator.onLine };
export interface TaskCollectionState {
  tasks: Task[];
  loading: boolean;
  error: DataError | null;
  errorMessage: string | null;
  isEmpty: boolean;
  sync: SyncMetadata;
  retry: () => void;
}

function useLiveTasks(kind: 'today' | 'overdue' | 'upcoming', date?: Date): TaskCollectionState {
  const { user } = useAuth();
  const referenceDate = useMemo(() => date ?? new Date(), [date]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [sync, setSync] = useState(emptySync);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!user) {
      setTasks([]); setLoading(false); setError(new DataError('unauthenticated')); setSync(emptySync);
      return undefined;
    }
    setTasks([]); setLoading(true); setError(null); setSync(emptySync);
    const onData = (nextTasks: Task[], nextSync: SyncMetadata) => {
      if (!active) return;
      setTasks(nextTasks); setSync(nextSync); setLoading(false);
    };
    const onError = (caught: unknown) => { if (active) { const dataError = toDataError(caught); setSyncError(dataError.code); setError(dataError); setSync((current) => ({ ...current, errorCode: dataError.code })); setLoading(false); } };
    const unsubscribe = kind === 'today'
      ? subscribeTodayTasks(user.uid, referenceDate, onData, onError)
      : kind === 'overdue'
        ? subscribeOverdueTasks(user.uid, referenceDate, onData, onError)
        : subscribeUpcomingTasks(user.uid, referenceDate, onData, onError);
    return () => { active = false; unsubscribe(); };
  }, [kind, referenceDate, reloadKey, user]);

  const retry = useCallback(() => { setLoading(true); setReloadKey((current) => current + 1); }, []);
  return { tasks, loading, error, errorMessage: error ? fr.data.errors[error.code] : null, isEmpty: !loading && tasks.length === 0, sync, retry };
}

export const useTodayTasks = (date?: Date): TaskCollectionState => useLiveTasks('today', date);
export const useOverdueTasks = (date?: Date): TaskCollectionState => useLiveTasks('overdue', date);
export const useUpcomingTasks = (date?: Date): TaskCollectionState => useLiveTasks('upcoming', date);

function useCustomLiveTasks(subscribe: (uid: string, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void) => () => void): TaskCollectionState {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [sync, setSync] = useState(emptySync);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (!user) { setTasks([]); setLoading(false); setError(new DataError('unauthenticated')); setSync(emptySync); return undefined; }
    setTasks([]); setLoading(true); setError(null); setSync(emptySync);
    return subscribe(user.uid, (items, status) => { setTasks(items); setSync(status); setError(null); setLoading(false); }, (caught) => { const dataError = toDataError(caught); setSyncError(dataError.code); setError(dataError); setSync((current) => ({ ...current, errorCode: dataError.code })); setLoading(false); });
  }, [reloadKey, subscribe, user]);
  const retry = useCallback(() => { setLoading(true); setReloadKey((current) => current + 1); }, []);
  return { tasks, loading, error, errorMessage: error ? fr.data.errors[error.code] : null, isEmpty: !loading && tasks.length === 0, sync, retry };
}

export function useTasksInRange(start: Date, end: Date): TaskCollectionState {
  const subscribe = useCallback((uid: string, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void) => subscribeTasksInRange(uid, start, end, onData, onError), [end, start]);
  return useCustomLiveTasks(subscribe);
}

export function useUnscheduledTasks(): TaskCollectionState {
  return useCustomLiveTasks(subscribeUnscheduledTasks);
}

export interface PaginatedTaskState extends TaskCollectionState {
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

function usePaginatedTasks(kind: 'history' | 'trash'): PaginatedTaskState {
  const { user } = useAuth();
  const uid = user?.uid;
  const [tasks, setTasks] = useState<Task[]>([]);
  const cursor = useRef<TaskCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DataError | null>(null);
  const [sync, setSync] = useState(emptySync);
  const requestId = useRef(0);
  const inFlight = useRef(false);

  const loadPage = useCallback(async (reset: boolean) => {
    if (!reset && inFlight.current) return;
    const request = ++requestId.current;
    inFlight.current = true;
    if (!uid) {
      setTasks([]); cursor.current = null; setHasMore(false); setLoading(false); setError(new DataError('unauthenticated'));
      inFlight.current = false;
      return;
    }
    if (reset) { setTasks([]); cursor.current = null; setHasMore(false); setSync(emptySync); }
    setLoading(true); setError(null);
    try {
      const page: HistoryPage = kind === 'history'
        ? await getHistoryPage(uid, reset ? null : cursor.current)
        : await getTrashPage(uid, reset ? null : cursor.current);
      if (request !== requestId.current) return;
      setTasks((current) => reset ? page.tasks : [...current, ...page.tasks]);
      cursor.current = page.cursor; setHasMore(page.hasMore); setSync(page.sync);
    } catch (caught: unknown) {
      if (request === requestId.current) { const dataError = toDataError(caught); setSyncError(dataError.code); setError(dataError); setSync((current) => ({ ...current, errorCode: dataError.code })); }
    } finally {
      if (request === requestId.current) { setLoading(false); inFlight.current = false; }
    }
  }, [kind, uid]);

  useEffect(() => {
    requestId.current += 1;
    inFlight.current = false;
    void loadPage(true);
    return () => { requestId.current += 1; inFlight.current = false; };
  }, [loadPage]);

  const loadMore = useCallback(() => loadPage(false), [loadPage]);
  const retry = useCallback(() => { void loadPage(true); }, [loadPage]);
  return { tasks, loading, error, errorMessage: error ? fr.data.errors[error.code] : null, isEmpty: !loading && tasks.length === 0, sync, hasMore, loadMore, retry };
}

export const useHistory = (): PaginatedTaskState => usePaginatedTasks('history');
export const useTrash = (): PaginatedTaskState => usePaginatedTasks('trash');
