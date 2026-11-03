export type TaskStatus = 'active' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  completedAt: Date | null;
  deletedAt: Date | null;
  dueDate: Date | null;
  priority: TaskPriority;
  listId: string | null;
  tags: string[];
  subtasks: Subtask[];
  recurrence: Recurrence | null;
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask { id: string; title: string; completed: boolean }
export interface Recurrence { frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval?: number; weekdays?: number[] }
export interface Reminder { id: string; at: Date }
export interface List { id: string; name: string; color?: string; icon?: string; createdAt: Date; updatedAt: Date }
export interface Tag { id: string; name: string; color?: string }
export interface UserProfile { uid: string; displayName?: string; email?: string; createdAt: Date }
