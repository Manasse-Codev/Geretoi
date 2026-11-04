import { getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import type { CollectionReference, DocumentData, Query, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { getListsCollection } from '@/features/lists/listRepository';
import { getTagsCollection } from '@/features/tags/tagRepository';
import { getTasksCollection } from '@/features/tasks/taskRepository';
import type { List, Tag, Task } from '@/types/models';
import { formatDuration } from '@/lib/duration';

const EXPORT_PAGE_SIZE = 100;
export interface ExportOptions {
  includeHistory: boolean;
  includeTrash: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
  phase: 'tasks' | 'lists' | 'tags' | 'preparation' | 'download';
}

export interface ExportData {
  tasks: Task[];
  lists: List[];
  tags: Tag[];
}

export type ExportProgressHandler = (progress: ExportProgress) => void;

async function readAll<T>(
  reference: CollectionReference<T, DocumentData>,
  phase: ExportProgress['phase'],
  onProgress?: ExportProgressHandler,
  signal?: AbortSignal,
): Promise<T[]> {
  const output: T[] = [];
  let cursor: QueryDocumentSnapshot<T> | null = null;
  while (true) {
    if (signal?.aborted) throw new DOMException('Export annulé', 'AbortError');
    const nextQuery: Query<T, DocumentData> = cursor
      ? query(reference, orderBy('createdAt', 'asc'), startAfter(cursor), limit(EXPORT_PAGE_SIZE))
      : query(reference, orderBy('createdAt', 'asc'), limit(EXPORT_PAGE_SIZE));
    const snapshot: QuerySnapshot<T, DocumentData> = await getDocs(nextQuery);
    output.push(...snapshot.docs.map((item) => item.data()));
    onProgress?.({ current: output.length, total: output.length + (snapshot.size === EXPORT_PAGE_SIZE ? 1 : 0), phase });
    if (snapshot.size < EXPORT_PAGE_SIZE) return output;
    cursor = snapshot.docs[snapshot.docs.length - 1] ?? null;
    if (!cursor) return output;
  }
}

export async function exportAccountData(
  uid: string,
  options: ExportOptions = { includeHistory: true, includeTrash: false },
  onProgress?: ExportProgressHandler,
  signal?: AbortSignal,
): Promise<ExportData> {
  const [tasks, lists, tags] = await Promise.all([
    readAll(getTasksCollection(uid), 'tasks', onProgress, signal),
    readAll(getListsCollection(uid), 'lists', onProgress, signal),
    readAll(getTagsCollection(uid), 'tags', onProgress, signal),
  ]);
  return {
    tasks: tasks.filter((task) => (options.includeTrash || task.deletedAt === null) && (options.includeHistory || task.status === 'active')),
    lists,
    tags,
  };
}

export const EXPORT_TASK_HEADERS = [
  'Identifiant', 'Titre', 'Description', 'Statut', 'Priorité', 'Liste', 'Étiquettes',
  'Date d’échéance', 'Heure', 'Durée estimée (minutes)', 'Durée estimée', 'Terminée le', 'Supprimée le',
  'Créée le', 'Modifiée le', 'Liens', 'Nombre de sous-tâches', 'Sous-tâches terminées',
] as const;

export function escapeSpreadsheetText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvValue(value: string | number | Date | null): string {
  if (value === null) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `"${escapeSpreadsheetText(text).replace(/"/g, '""')}"`;
}

function dateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function dateTime(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export interface ExportTaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  list: string;
  tags: string;
  dueDate: Date | null;
  startTime: string;
  estimatedMinutes: number | null;
  estimatedLabel: string;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  links: string;
  subtaskCount: number;
  completedSubtaskCount: number;
}

export function buildTaskRows(data: ExportData): ExportTaskRow[] {
  const lists = new Map(data.lists.map((list) => [list.id, list.name]));
  return data.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: task.status === 'done' ? 'Terminée' : 'Active',
    priority: ({ 1: 'Urgente', 2: 'Haute', 3: 'Normale', 4: 'Basse' } as const)[task.priority],
    list: task.listId ? lists.get(task.listId) ?? '' : '',
    tags: task.tags.join(', '),
    dueDate: task.dueDate,
    startTime: task.startTime ?? '',
    estimatedMinutes: task.estimatedMinutes ?? null,
    estimatedLabel: formatDuration(task.estimatedMinutes),
    completedAt: task.completedAt,
    deletedAt: task.deletedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    links: task.links.join(', '),
    subtaskCount: task.subtasks.length,
    completedSubtaskCount: task.subtasks.filter((subtask) => subtask.done).length,
  }));
}

export function buildCsv(data: ExportData): string {
  const rows = buildTaskRows(data);
  const values = rows.map((row) => [
    row.id, row.title, row.description, row.status, row.priority, row.list, row.tags,
    dateOnly(row.dueDate), row.startTime, row.estimatedMinutes, row.estimatedLabel, dateTime(row.completedAt),
    dateTime(row.deletedAt), dateTime(row.createdAt), dateTime(row.updatedAt), row.links,
    row.subtaskCount, row.completedSubtaskCount,
  ]);
  return `\uFEFF${[EXPORT_TASK_HEADERS, ...values].map((line) => line.map((value) => csvValue(value)).join(';')).join('\r\n')}`;
}

export async function buildXlsxBuffer(data: ExportData): Promise<ArrayBuffer> {
  const { Workbook } = await import('exceljs-hardened');
  const workbook = new Workbook();
  const rows = buildTaskRows(data);
  const addSheet = (name: string, headers: string[], values: Array<Array<string | number | Date | null>>) => {
    const sheet = workbook.addWorksheet(name);
    sheet.addRow(headers);
    values.forEach((value) => sheet.addRow(value.map((item) => typeof item === 'string' ? escapeSpreadsheetText(item) : item)));
    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.alignment = { vertical: 'middle' };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + headers.length)}${Math.max(1, values.length + 1)}` };
    sheet.columns.forEach((column) => { column.width = Math.min(42, Math.max(12, ...((column.values as Array<string | number | null | undefined> | undefined) ?? []).map((item) => String(item ?? '').length + 2))); });
    return sheet;
  };
  const tasksSheet = addSheet('Tâches', [...EXPORT_TASK_HEADERS], rows.map((row) => [
    row.id, row.title, row.description, row.status, row.priority, row.list, row.tags, row.dueDate,
    row.startTime, row.estimatedMinutes, row.estimatedLabel, row.completedAt, row.deletedAt, row.createdAt, row.updatedAt,
    row.links, row.subtaskCount, row.completedSubtaskCount,
  ]));
  [8, 12, 13, 14, 15].forEach((index) => { tasksSheet.getColumn(index).numFmt = 'dd/mm/yyyy'; });
  const subtasks = data.tasks.flatMap((task) => task.subtasks.map((subtask, index) => [task.id, task.title, subtask.title, subtask.done ? 'Oui' : 'Non', index]));
  addSheet('Sous-tâches', ['Identifiant de la tâche', 'Titre de la tâche', 'Titre de la sous-tâche', 'Terminée', 'Ordre'], subtasks);
  addSheet('Listes', ['Identifiant', 'Nom', 'Ordre', 'Couleur', 'Icône'], data.lists.map((list) => [list.id, list.name, list.order, list.color ?? '', list.icon ?? '']));
  addSheet('Étiquettes', ['Identifiant', 'Nom', 'Ordre', 'Couleur'], data.tags.map((tag) => [tag.id, tag.name, tag.order, tag.color ?? '']));
  return workbook.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}

export function downloadBlob(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadCsv(name: string, data: ExportData) {
  downloadBlob(name, new Blob([buildCsv(data)], { type: 'text/csv;charset=utf-8' }));
}

export async function downloadXlsx(name: string, data: ExportData) {
  downloadBlob(name, new Blob([await buildXlsxBuffer(data)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
}

export const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

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
