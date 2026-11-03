import { endOfDay, format, isBefore, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Task } from '@/types/models';

export function getLocalDayBounds(date: Date = new Date()): { start: Date; end: Date } {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function isTaskOverdue(task: Pick<Task, 'status' | 'deletedAt' | 'dueDate'>, now: Date = new Date()): boolean {
  return task.status === 'active' && task.deletedAt === null && task.dueDate !== null &&
    isBefore(task.dueDate, startOfDay(now));
}

export interface TasksByDay { date: Date; key: string; label: string; tasks: Task[] }

export function groupTasksByCompletionDay(tasks: Task[]): TasksByDay[] {
  const groups = new Map<string, TasksByDay>();
  for (const task of tasks) {
    const date = task.completedAt ?? task.updatedAt;
    const key = format(date, 'yyyy-MM-dd');
    const group = groups.get(key) ?? { date, key, label: format(date, 'PPPP', { locale: fr }), tasks: [] };
    group.tasks.push(task);
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function formatFrenchDate(date: Date, pattern = 'PPP'): string {
  return format(date, pattern, { locale: fr });
}

export function formatClockTime(value: string, timeFormat: '12h' | '24h' = '24h'): string {
  if (timeFormat === '24h') return value;
  const [hourValue, minuteValue = '00'] = value.split(':');
  const hour = Number(hourValue);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return value;
  return `${hour % 12 || 12}:${minuteValue} ${hour >= 12 ? 'PM' : 'AM'}`;
}
