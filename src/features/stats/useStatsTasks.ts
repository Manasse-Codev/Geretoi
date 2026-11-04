import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';
import type { Task } from '@/types/models';
import { toDataError } from '@/features/tasks/dataErrors';
import { getCompletedTasksInPeriod } from '@/features/tasks/taskRepository';

export function useStatsTasks(start: Date, end: Date, dayCount: 7 | 30) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [dailyCounts, setDailyCounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setTasks([]);
    setCompletedCount(0);
    setEstimatedMinutes(0);
    setDailyCounts([]);
    setLoading(true);
    setErrorMessage(null);
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }
    void getCompletedTasksInPeriod(user.uid, start, end, dayCount).then((result) => {
      if (!active) return;
      setTasks(result.tasks);
      setCompletedCount(result.completedCount);
      setEstimatedMinutes(result.estimatedMinutes);
      setDailyCounts(result.dailyCounts);
    }).catch((error: unknown) => {
      if (active) setErrorMessage(fr.data.errors[toDataError(error).code]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [dayCount, end, reloadKey, start, user]);

  const retry = useCallback(() => { setLoading(true); setReloadKey((value) => value + 1); }, []);
  return { tasks, completedCount, estimatedMinutes, dailyCounts, loading, errorMessage, retry };
}
