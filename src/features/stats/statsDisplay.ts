import { STATS_TASK_LIMIT } from '@/features/tasks/taskRepository';
import { fr } from '@/i18n/fr';

export function completedCountLabel(count: number, hasMore: boolean): string {
  return hasMore ? fr.statsPage.overLimit(STATS_TASK_LIMIT) : String(count);
}
