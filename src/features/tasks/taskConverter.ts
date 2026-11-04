import { serverTimestamp, Timestamp } from 'firebase/firestore';
import type { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, WithFieldValue } from 'firebase/firestore';
import type { Recurrence, Reminder, Subtask, Task, TaskPriority, TaskStatus } from '@/types/models';
import { isValidDurationMinutes } from '@/lib/duration';

type TaskDocument = Omit<Task, 'id' | 'completedAt' | 'deletedAt' | 'dueDate' | 'createdAt' | 'updatedAt' | 'reminders'> & {
  completedAt: Timestamp | null;
  deletedAt: Timestamp | null;
  dueDate: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reminders: Array<Omit<Reminder, 'at'> & { at: Timestamp }>;
};

function asDate(value: unknown, fallback: Date | null = null): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  return fallback;
}

function asSubtasks(value: unknown): Subtask[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): Subtask[] => {
    if (typeof entry !== 'object' || entry === null) return [];
    const item = entry as Partial<Subtask>;
    return typeof item.id === 'string' && typeof item.title === 'string'
      ? [{ id: item.id, title: item.title, done: item.done === true }]
      : [];
  });
}

function asReminders(value: unknown): Reminder[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): Reminder[] => {
    if (typeof entry !== 'object' || entry === null) return [];
    const item = entry as { at?: unknown; sent?: unknown };
    const at = asDate(item.at);
    return at ? [{ at, sent: item.sent === true }] : [];
  });
}

function asRecurrence(value: unknown): Recurrence | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Partial<Recurrence>;
  if (!['daily', 'weekly', 'monthly', 'yearly'].includes(item.type ?? '')) return null;
  return {
    type: item.type as Recurrence['type'],
    ...(typeof item.interval === 'number' ? { interval: item.interval } : {}),
    ...(Array.isArray(item.days) ? { days: item.days.filter((day): day is number => typeof day === 'number') } : {}),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function fromDocument(id: string, value: Partial<TaskDocument>): Task {
  const epoch = new Date(0);
  const status: TaskStatus = value.status === 'done' ? 'done' : 'active';
  const priority: TaskPriority = value.priority === 1 || value.priority === 2 || value.priority === 4 ? value.priority : 3;
  return {
    id,
    title: typeof value.title === 'string' ? value.title : '',
    ...(typeof value.description === 'string' ? { description: value.description } : {}),
    status,
    completedAt: asDate(value.completedAt),
    deletedAt: asDate(value.deletedAt),
    dueDate: asDate(value.dueDate),
    priority,
    ...(typeof value.startTime === 'string' || value.startTime === null ? { startTime: value.startTime } : {}),
    ...(isValidDurationMinutes(value.estimatedMinutes) || value.estimatedMinutes === null ? { estimatedMinutes: value.estimatedMinutes } : {}),
    listId: typeof value.listId === 'string' ? value.listId : null,
    tags: asStringArray(value.tags),
    links: asStringArray(value.links),
    subtasks: asSubtasks(value.subtasks),
    recurrence: asRecurrence(value.recurrence),
    reminders: asReminders(value.reminders),
    createdAt: asDate(value.createdAt, epoch) ?? epoch,
    updatedAt: asDate(value.updatedAt, epoch) ?? epoch,
  };
}

export const taskConverter: FirestoreDataConverter<Task, TaskDocument> = {
  toFirestore(model: WithFieldValue<Task>): WithFieldValue<TaskDocument> {
    const { id, ...fields } = model;
    void id;
    const timestamp = (value: unknown): unknown => value instanceof Date ? Timestamp.fromDate(value) : value;
    const reminders = fields.reminders;
    return {
      ...fields,
      completedAt: timestamp(fields.completedAt),
      deletedAt: timestamp(fields.deletedAt),
      dueDate: timestamp(fields.dueDate),
      createdAt: fields.createdAt instanceof Date ? serverTimestamp() : fields.createdAt,
      updatedAt: fields.updatedAt instanceof Date ? serverTimestamp() : fields.updatedAt,
      reminders: Array.isArray(reminders)
        ? reminders.map((reminder) => {
          const fields = reminder as { at?: unknown };
          return 'at' in fields ? { ...reminder, at: timestamp(fields.at) } : reminder;
        })
        : reminders,
    } as WithFieldValue<TaskDocument>;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Task {
    return fromDocument(snapshot.id, snapshot.data(options) as Partial<TaskDocument>);
  },
};
