import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { fr } from '@/i18n/fr';
import type { TaskInput, TaskUpdate } from '@/types/models';
import { DataError, toDataError } from './dataErrors';
import {
  completeTask, createTask, duplicateTask, permanentlyDeleteTask, reopenTask, restoreTask, softDeleteTask,
  updateTask, getTask, toggleSubtask,
} from './taskRepository';

export type UndoAction = () => Promise<void>;
export interface TaskActions {
  error: DataError | null;
  errorMessage: string | null;
  clearError: () => void;
  create: (input: TaskInput) => Promise<string>;
  update: (id: string, changes: TaskUpdate) => Promise<void>;
  complete: (id: string) => Promise<UndoAction>;
  reopen: (id: string) => Promise<void>;
  softDelete: (id: string) => Promise<UndoAction>;
  restore: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<string>;
  toggleSubtask: (id: string, subtaskId: string, done: boolean) => Promise<void>;
  reschedule: (id: string, dueDate: Date | null) => Promise<UndoAction>;
}

export function useTaskActions(): TaskActions {
  const { user } = useAuth();
  const [error, setError] = useState<DataError | null>(null);
  const run = useCallback(async <T,>(action: (uid: string) => Promise<T>): Promise<T> => {
    setError(null);
    try {
      if (!user) throw new DataError('unauthenticated');
      return await action(user.uid);
    } catch (caught: unknown) {
      const dataError = toDataError(caught);
      setError(dataError);
      throw dataError;
    }
  }, [user]);
  const wrapUndo = useCallback((action: () => Promise<void>): UndoAction => async () => {
    setError(null);
    try {
      if (!user) throw new DataError('unauthenticated');
      await action();
    } catch (caught: unknown) {
      const dataError = toDataError(caught);
      setError(dataError);
      throw dataError;
    }
  }, [user]);

  const create = useCallback(async (input: TaskInput) => (await run((uid) => createTask(uid, input, new Date(), false))).id, [run]);
  const update = useCallback((id: string, changes: TaskUpdate) => run((uid) => updateTask(uid, id, changes, new Date(), false)), [run]);
  const complete = useCallback((id: string) => run(async (uid) => {
    await completeTask(uid, id, new Date(), false);
    return wrapUndo(() => reopenTask(uid, id, new Date(), false));
  }), [run, wrapUndo]);
  const reopen = useCallback((id: string) => run((uid) => reopenTask(uid, id, new Date(), false)), [run]);
  const softDelete = useCallback((id: string) => run(async (uid) => {
    await softDeleteTask(uid, id, new Date(), false);
    return wrapUndo(() => restoreTask(uid, id, new Date(), false));
  }), [run, wrapUndo]);
  const restore = useCallback((id: string) => run((uid) => restoreTask(uid, id, new Date(), false)), [run]);
  const permanentlyDelete = useCallback((id: string) => run((uid) => permanentlyDeleteTask(uid, id)), [run]);
  const duplicate = useCallback(async (id: string) => (await run((uid) => duplicateTask(uid, id, new Date(), false))).id, [run]);
  const checkSubtask = useCallback((id: string, subtaskId: string, done: boolean) => run((uid) => toggleSubtask(uid, id, subtaskId, done, new Date(), false)), [run]);
  const reschedule = useCallback((id: string, dueDate: Date | null) => run(async (uid) => {
    const previousDate = (await getTask(uid, id)).dueDate;
    await updateTask(uid, id, { dueDate }, new Date(), false);
    return wrapUndo(() => updateTask(uid, id, { dueDate: previousDate }, new Date(), false));
  }), [run, wrapUndo]);

  const clearError = useCallback(() => setError(null), []);
  return { error, errorMessage: error ? fr.data.errors[error.code] : null, clearError, create, update, complete, reopen, softDelete, restore, permanentlyDelete, duplicate, toggleSubtask: checkSubtask, reschedule };
}
