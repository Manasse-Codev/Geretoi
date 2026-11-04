import {
  collection, deleteDoc, doc, getDoc, getDocs, getDocsFromServer, limit, onSnapshot, orderBy, query,
  serverTimestamp, startAfter, Timestamp, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import type { CollectionReference, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { addDays, endOfDay } from 'date-fns';
import { firestore } from '@/lib/firestore';
import { clearSyncError, settleWrite } from '@/lib/syncStatus';
import { shareSubscription } from '@/lib/sharedSubscription';
import { getLocalDayBounds } from '@/lib/dates';
import type { Task, TaskInput, TaskUpdate } from '@/types/models';
import { DataError } from './dataErrors';
import { taskConverter } from './taskConverter';

export const TASK_QUERY_LIMIT = 100;
export const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
const RETENTION_MS = 30 * DAY_MS;
const PURGE_GRACE_MS = 60 * 1000;

export interface SyncMetadata { fromCache: boolean; hasPendingWrites: boolean; isOffline: boolean; errorCode?: import('./dataErrors').DataErrorCode }
export interface HistoryPage { tasks: Task[]; cursor: QueryDocumentSnapshot<Task> | null; hasMore: boolean; sync: SyncMetadata }
export interface TrashPage { tasks: Task[]; cursor: QueryDocumentSnapshot<Task> | null; hasMore: boolean; sync: SyncMetadata }
export interface StatsTasksResult { tasks: Task[]; completedCount: number; estimatedMinutes: number; dailyCounts: number[] }
const STATS_DETAIL_LIMIT = 5;

export function getTasksCollection(uid: string): CollectionReference<Task> {
  return collection(firestore, 'users', uid, 'tasks').withConverter(taskConverter);
}

export async function getTask(uid: string, taskId: string): Promise<Task> {
  const snapshot = await getDoc(doc(getTasksCollection(uid), taskId));
  if (!snapshot.exists()) throw new DataError('notFound');
  return snapshot.data();
}

function syncMetadata(snapshot: QuerySnapshot<Task>): SyncMetadata {
  return {
    fromCache: snapshot.metadata.fromCache,
    hasPendingWrites: snapshot.metadata.hasPendingWrites,
    isOffline: typeof navigator !== 'undefined' && !navigator.onLine,
  };
}

function activeTasksForDay(uid: string, date: Date, range: 'today' | 'overdue' | 'upcoming') {
  const { start, end } = getLocalDayBounds(date);
  const tasks = getTasksCollection(uid);
  const constraints = [where('status', '==', 'active'), where('deletedAt', '==', null)];
  if (range === 'today') return query(tasks, ...constraints, where('dueDate', '>=', start), where('dueDate', '<=', end), orderBy('dueDate', 'asc'), limit(TASK_QUERY_LIMIT));
  if (range === 'overdue') return query(tasks, ...constraints, where('dueDate', '<', start), orderBy('dueDate', 'asc'), limit(TASK_QUERY_LIMIT));
  return query(tasks, ...constraints, where('dueDate', '>', end), orderBy('dueDate', 'asc'), limit(TASK_QUERY_LIMIT));
}

function subscribeTasks(uid: string, date: Date, range: 'today' | 'overdue' | 'upcoming', onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void): () => void {
  const key = `${uid}:tasks:${range}:${date.toISOString().slice(0, 10)}`;
  return shareSubscription<{ tasks: Task[]; sync: SyncMetadata }>(key, (next, error) => onSnapshot(activeTasksForDay(uid, date, range), { includeMetadataChanges: true }, (snapshot) => {
    next({ tasks: snapshot.docs.map((item) => item.data()), sync: syncMetadata(snapshot) });
    if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) clearSyncError();
  }, error), (value) => onData(value.tasks, value.sync), onError);
}

export const subscribeTodayTasks = (uid: string, date: Date, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void) => subscribeTasks(uid, date, 'today', onData, onError);
export const subscribeOverdueTasks = (uid: string, date: Date, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void) => subscribeTasks(uid, date, 'overdue', onData, onError);
export const subscribeUpcomingTasks = (uid: string, date: Date, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void) => subscribeTasks(uid, date, 'upcoming', onData, onError);

export function subscribeTasksInRange(uid: string, start: Date, end: Date, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void): () => void {
  const queryRef = query(getTasksCollection(uid), where('status', '==', 'active'), where('deletedAt', '==', null), where('dueDate', '>=', getLocalDayBounds(start).start), where('dueDate', '<=', getLocalDayBounds(end).end), orderBy('dueDate', 'asc'), limit(TASK_QUERY_LIMIT));
  const key = `${uid}:tasks:range:${start.toISOString()}:${end.toISOString()}`;
  return shareSubscription<{ tasks: Task[]; sync: SyncMetadata }>(key, (next, error) => onSnapshot(queryRef, { includeMetadataChanges: true }, (snapshot) => {
    next({ tasks: snapshot.docs.map((item) => item.data()), sync: syncMetadata(snapshot) });
    if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) clearSyncError();
  }, error), (value) => onData(value.tasks, value.sync), onError);
}

export function subscribeUnscheduledTasks(uid: string, onData: (tasks: Task[], sync: SyncMetadata) => void, onError: (error: unknown) => void): () => void {
  const queryRef = query(getTasksCollection(uid), where('status', '==', 'active'), where('deletedAt', '==', null), where('dueDate', '==', null), orderBy('createdAt', 'desc'), limit(TASK_QUERY_LIMIT));
  return shareSubscription<{ tasks: Task[]; sync: SyncMetadata }>(`${uid}:tasks:unscheduled`, (next, error) => onSnapshot(queryRef, { includeMetadataChanges: true }, (snapshot) => {
    next({ tasks: snapshot.docs.map((item) => item.data()), sync: syncMetadata(snapshot) });
    if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) clearSyncError();
  }, error), (value) => onData(value.tasks, value.sync), onError);
}

export async function createTask(uid: string, input: TaskInput, now = new Date(), waitForServer = true): Promise<Task> {
  const reference = doc(getTasksCollection(uid));
  const task: Task = {
    id: reference.id,
    title: input.title.trim(),
    ...(input.description === undefined ? {} : { description: input.description }),
    status: 'active', completedAt: null, deletedAt: null, dueDate: input.dueDate ?? null,
    priority: input.priority ?? 3, startTime: input.startTime ?? null, estimatedMinutes: input.estimatedMinutes ?? null,
    listId: input.listId ?? null, tags: input.tags ?? [], links: input.links ?? [], subtasks: input.subtasks ?? [],
    recurrence: input.recurrence ?? null, reminders: input.reminders ?? [], createdAt: now, updatedAt: now,
  };
  const batch = writeBatch(firestore);
  batch.set(reference, task);
  await settleWrite(batch.commit(), waitForServer);
  return task;
}

async function updateTaskFields(uid: string, taskId: string, changes: Partial<Task>, waitForServer = true): Promise<void> {
  const safeChanges = Object.fromEntries(Object.entries(changes).filter(([, value]) => value !== undefined)) as Partial<Task>;
  delete safeChanges.id;
  delete safeChanges.createdAt;
  delete safeChanges.updatedAt;
  await settleWrite(updateDoc(doc(getTasksCollection(uid), taskId), { ...safeChanges, updatedAt: serverTimestamp() }), waitForServer);
}

export function updateTask(uid: string, taskId: string, changes: TaskUpdate, now = new Date(), waitForServer = true): Promise<void> {
  void now;
  return updateTaskFields(uid, taskId, changes, waitForServer);
}

export function completeTask(uid: string, taskId: string, now = new Date(), waitForServer = true): Promise<void> {
  return updateTaskFields(uid, taskId, { status: 'done', completedAt: now }, waitForServer);
}

export function reopenTask(uid: string, taskId: string, now = new Date(), waitForServer = true): Promise<void> {
  void now;
  return updateTaskFields(uid, taskId, { status: 'active', completedAt: null }, waitForServer);
}

export function softDeleteTask(uid: string, taskId: string, now = new Date(), waitForServer = true): Promise<void> {
  return updateTaskFields(uid, taskId, { deletedAt: now }, waitForServer);
}

export function restoreTask(uid: string, taskId: string, now = new Date(), waitForServer = true): Promise<void> {
  void now;
  return updateTaskFields(uid, taskId, { deletedAt: null }, waitForServer);
}

export async function permanentlyDeleteTask(uid: string, taskId: string, now = new Date()): Promise<void> {
  const reference = doc(getTasksCollection(uid), taskId);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) throw new DataError('notFound');
  const task = snapshot.data();
  if (task.deletedAt === null || task.deletedAt.getTime() > now.getTime() - RETENTION_MS) throw new DataError('retentionNotElapsed');
  await deleteDoc(reference);
}

export async function duplicateTask(uid: string, taskId: string, now = new Date(), waitForServer = true): Promise<Task> {
  const sourceSnapshot = await getDoc(doc(getTasksCollection(uid), taskId));
  if (!sourceSnapshot.exists()) throw new DataError('notFound');
  const source = sourceSnapshot.data();
  return createTask(uid, {
    title: source.title,
    ...(source.description === undefined ? {} : { description: source.description }),
    priority: source.priority, dueDate: source.dueDate, startTime: source.startTime, estimatedMinutes: source.estimatedMinutes,
    listId: source.listId, tags: source.tags, links: source.links, subtasks: source.subtasks.map((item) => ({ ...item })),
    recurrence: source.recurrence, reminders: source.reminders,
  }, now, waitForServer);
}

export async function toggleSubtask(uid: string, taskId: string, subtaskId: string, done: boolean, now = new Date(), waitForServer = true): Promise<void> {
  const snapshot = await getDoc(doc(getTasksCollection(uid), taskId));
  if (!snapshot.exists()) throw new DataError('notFound');
  const subtasks = snapshot.data().subtasks.map((item) => item.id === subtaskId ? { ...item, done } : item);
  await updateTask(uid, taskId, { subtasks }, now, waitForServer);
}

export async function getHistoryPage(uid: string, cursor: QueryDocumentSnapshot<Task> | null = null): Promise<HistoryPage> {
  const base = [where('status', '==', 'done'), where('deletedAt', '==', null), orderBy('completedAt', 'desc')];
  const historyQuery = cursor
    ? query(getTasksCollection(uid), ...base, startAfter(cursor), limit(PAGE_SIZE + 1))
    : query(getTasksCollection(uid), ...base, limit(PAGE_SIZE + 1));
  const snapshot = await getDocs(historyQuery);
  const pageDocs = snapshot.docs.slice(0, PAGE_SIZE);
  return { tasks: pageDocs.map((item) => item.data()), cursor: pageDocs.at(-1) ?? null, hasMore: snapshot.docs.length > PAGE_SIZE, sync: syncMetadata(snapshot) };
}

export async function getCompletedTasksInPeriod(uid: string, start: Date, end: Date, dayCount: 7 | 30): Promise<StatsTasksResult> {
  const tasks = getTasksCollection(uid);
  const days = Array.from({ length: dayCount }, (_, index) => {
    const dayStart = addDays(start, index);
    return { start: dayStart, end: new Date(Math.min(endOfDay(dayStart).getTime(), end.getTime())) };
  });
  const dailyCounts = days.map(() => 0);
  let completedCount = 0;
  let estimatedMinutes = 0;
  const recentTasks: Task[] = [];
  let cursor: QueryDocumentSnapshot<Task> | null = null;
  while (true) {
    const constraints = [
      where('status', '==', 'done'),
      where('deletedAt', '==', null),
      where('completedAt', '>=', start),
      where('completedAt', '<=', end),
      orderBy('completedAt', 'desc'),
    ];
    const page: Query<Task> = cursor
      ? query(tasks, ...constraints, startAfter(cursor), limit(TASK_QUERY_LIMIT))
      : query(tasks, ...constraints, limit(TASK_QUERY_LIMIT));
    const snapshot = await getDocsFromServer(page);
    for (const document of snapshot.docs) {
      const task = document.data();
      completedCount += 1;
      estimatedMinutes += task.estimatedMinutes ?? 0;
      if (recentTasks.length < STATS_DETAIL_LIMIT) recentTasks.push(task);
      const completedAt = task.completedAt?.getTime();
      const dayIndex = completedAt === undefined ? -1 : days.findIndex((day) => completedAt >= day.start.getTime() && completedAt <= day.end.getTime());
      if (dayIndex >= 0) dailyCounts[dayIndex] = (dailyCounts[dayIndex] ?? 0) + 1;
    }
    if (snapshot.size < TASK_QUERY_LIMIT) break;
    cursor = snapshot.docs.at(-1) ?? null;
    if (!cursor) break;
  }
  return {
    tasks: recentTasks,
    completedCount,
    estimatedMinutes,
    dailyCounts,
  };
}

export async function getTrashPage(uid: string, cursor: QueryDocumentSnapshot<Task> | null = null): Promise<TrashPage> {
  const base = [where('deletedAt', '!=', null), orderBy('deletedAt', 'desc')];
  const trashQuery = cursor
    ? query(getTasksCollection(uid), ...base, startAfter(cursor), limit(PAGE_SIZE + 1))
    : query(getTasksCollection(uid), ...base, limit(PAGE_SIZE + 1));
  const snapshot = await getDocs(trashQuery);
  const pageDocs = snapshot.docs.slice(0, PAGE_SIZE);
  return { tasks: pageDocs.map((item) => item.data()), cursor: pageDocs.at(-1) ?? null, hasMore: snapshot.docs.length > PAGE_SIZE, sync: syncMetadata(snapshot) };
}

const activePurges = new Map<string, Promise<number>>();

async function purgeExpiredTasksBatchLoop(uid: string, now: Date): Promise<number> {
  const cutoff = Timestamp.fromDate(new Date(now.getTime() - RETENTION_MS - PURGE_GRACE_MS));
  let purged = 0;
  while (true) {
    const expiredQuery = query(getTasksCollection(uid), where('deletedAt', '<=', cutoff), orderBy('deletedAt', 'asc'), limit(PAGE_SIZE));
    const snapshot = await getDocs(expiredQuery);
    if (snapshot.empty) return purged;
    const batch = writeBatch(firestore);
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
    purged += snapshot.size;
  }
}

export function purgeExpiredTasks(uid: string, now = new Date()): Promise<number> {
  const activePurge = activePurges.get(uid);
  if (activePurge) return activePurge;
  const purge = purgeExpiredTasksBatchLoop(uid, now).finally(() => activePurges.delete(uid));
  activePurges.set(uid, purge);
  return purge;
}

export type TaskCursor = QueryDocumentSnapshot<Task>;
