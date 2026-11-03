import { getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import type { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { getListsCollection } from '@/features/lists/listRepository';
import { getTagsCollection } from '@/features/tags/tagRepository';
import { getTasksCollection } from '@/features/tasks/taskRepository';
import type { List, Tag, Task } from '@/types/models';

const EXPORT_PAGE_SIZE = 100;

async function readAll<T>(reference: CollectionReference<T, DocumentData>): Promise<T[]> {
  const output: T[] = [];
  let cursor: QueryDocumentSnapshot<T> | null = null;
  while (true) {
    const nextQuery: Query<T, DocumentData> = cursor
      ? query(reference, orderBy('createdAt', 'asc'), startAfter(cursor), limit(EXPORT_PAGE_SIZE))
      : query(reference, orderBy('createdAt', 'asc'), limit(EXPORT_PAGE_SIZE));
    const snapshot: QuerySnapshot<T, DocumentData> = await getDocs(nextQuery);
    output.push(...snapshot.docs.map((item) => item.data()));
    if (snapshot.size < EXPORT_PAGE_SIZE) return output;
    cursor = snapshot.docs[snapshot.docs.length - 1] ?? null;
    if (!cursor) return output;
  }
}

export async function exportAccountData(uid: string): Promise<{ tasks: Task[]; lists: List[]; tags: Tag[] }> {
  const [tasks, lists, tags] = await Promise.all([
    readAll(getTasksCollection(uid)), readAll(getListsCollection(uid)), readAll(getTagsCollection(uid)),
  ]);
  return { tasks, lists, tags };
}

export function downloadJson(name: string, content: unknown) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  URL.revokeObjectURL(url);
}

const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

export function downloadCalendar(tasks: Task[]) {
  const events = tasks.filter((task) => task.status === 'active' && task.deletedAt === null && task.dueDate).map((task) => {
    const start = new Date(task.dueDate!);
    const [hour = '09', minute = '00'] = (task.startTime ?? '09:00').split(':');
    start.setHours(Number(hour), Number(minute), 0, 0);
    const end = new Date(start.getTime() + (task.estimatedMinutes ?? 30) * 60_000);
    const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return `BEGIN:VEVENT\r\nUID:${task.id}@dayflow\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(start)}\r\nDTEND:${stamp(end)}\r\nSUMMARY:${escapeIcs(task.title)}\r\nEND:VEVENT`;
  });
  const blob = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DayFlow//Planning//FR\r\n${events.join('\r\n')}\r\nEND:VCALENDAR`], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'dayflow.ics'; anchor.click(); URL.revokeObjectURL(url);
}
