export type TaskStatus = 'active' | 'done';
/** Priorités Firestore : 1 = urgente, 2 = haute, 3 = normale (par défaut), 4 = basse. */
export type TaskPriority = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completedAt: Date | null;
  deletedAt: Date | null;
  dueDate: Date | null;
  priority: TaskPriority;
  startTime?: string | null;
  estimatedMinutes?: number | null;
  listId: string | null;
  tags: string[];
  links: string[];
  subtasks: Subtask[];
  recurrence: Recurrence | null;
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
  startTime?: string | null;
  estimatedMinutes?: number | null;
  listId?: string | null;
  tags?: string[];
  links?: string[];
  subtasks?: Subtask[];
  recurrence?: Recurrence | null;
  reminders?: Reminder[];
}

export type TaskUpdate = Partial<Pick<Task,
  'title' | 'description' | 'dueDate' | 'priority' | 'startTime' | 'estimatedMinutes' |
  'listId' | 'tags' | 'links' | 'subtasks' | 'recurrence' | 'reminders'
>>;

export interface Subtask { id: string; title: string; done: boolean }
export interface Recurrence { type: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval?: number; days?: number[] }
export interface Reminder { at: Date; sent: boolean }
export interface List { id: string; name: string; color?: string; icon?: string; order: number; createdAt: Date; updatedAt: Date }
export interface Tag { id: string; name: string; color?: string; order: number; createdAt: Date; updatedAt: Date }
export interface TagInput { name: string; color?: string; order?: number }
export interface ListInput { name: string; color?: string; icon?: string; order?: number }
export interface UserProfile { uid: string; displayName?: string; email?: string; createdAt: Date }
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
  firstDayOfWeek: 'monday' | 'sunday';
  timeFormat: '12h' | '24h';
  density: 'compact' | 'comfortable';
}
