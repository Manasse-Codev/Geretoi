import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';
import type { Task } from '@/types/models';
import { toDataError } from '@/features/tasks/dataErrors';
import { getCompletedTasksInPeriod } from '@/features/tasks/taskRepository';

export function useStatsTasks(start: Date, end: Date) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setTasks([]);
    setHasMore(false);
    setLoading(true);
    setErrorMessage(null);
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }
    void getCompletedTasksInPeriod(user.uid, start, end).then((result) => {
      if (!active) return;
      setTasks(result.tasks);
      setHasMore(result.hasMore);
    }).catch((error: unknown) => {
      if (active) setErrorMessage(fr.data.errors[toDataError(error).code]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [end, reloadKey, start, user]);

  const retry = useCallback(() => { setLoading(true); setReloadKey((value) => value + 1); }, []);
  return { tasks, hasMore, loading, errorMessage, retry };
}
