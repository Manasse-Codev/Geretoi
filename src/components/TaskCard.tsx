import { useState } from 'react';
import { ArrowDown, ArrowUp, Flame, Minus, Clock3, ListChecks, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react';
import type { Task } from '@/types/models';
import { format } from 'date-fns';
import { fr as frDate } from 'date-fns/locale';
import { Checkbox } from '@/components/Checkbox';
import { fr } from '@/i18n/fr';
import { formatClockTime } from '@/lib/dates';

const priorityIcons = { 1: Flame, 2: ArrowUp, 3: Minus, 4: ArrowDown } as const;

export function TaskCard({ task, onComplete, onReopen, onDelete, onSubtask, onReschedule, onRestore, variant = 'active', listName, canDeleteForever }: {
  task: Task; onComplete?: () => void; onReopen?: () => void; onDelete?: () => void;
  onSubtask?: (id: string, checked: boolean) => void; onReschedule?: () => void; onRestore?: () => void;
  variant?: 'active' | 'history' | 'trash'; listName?: string; canDeleteForever?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = priorityIcons[task.priority];
  const subtaskCount = task.subtasks.length;
  const subtaskDone = task.subtasks.filter((item) => item.done).length;
  const timeFormat = typeof document !== 'undefined' && document.documentElement.dataset.timeFormat === '12h' ? '12h' : '24h';
  const dueText = task.dueDate ? `${format(task.dueDate, 'EEE d MMM', { locale: frDate })}${task.startTime ? ` · ${formatClockTime(task.startTime, timeFormat)}` : ''}` : null;

  return (
    <article className={`task-card surface-raised ${task.status === 'done' ? 'task-card--done' : ''}`}>
      <div className="task-card__main">
        {variant === 'active' && onComplete && <Checkbox checked={false} label={`${fr.task.complete} : ${task.title}`} onCheckedChange={onComplete} />}
        {variant === 'history' && <span className="task-card__check" aria-label={fr.task.completed}><span aria-hidden="true">✓</span></span>}
        <div className="task-card__content">
          <div className="task-card__title-row"><h3>{task.title}</h3><span className={`priority priority--${task.priority}`}><Icon aria-hidden="true" size={15} />{fr.priorities[task.priority].label}</span></div>
          {task.description && <p className="task-card__description">{task.description}</p>}
          <div className="task-card__meta">
            {dueText && <span><Clock3 aria-hidden="true" size={15} />{dueText}</span>}
            {listName && <span className="task-card__list">{listName}</span>}
            {subtaskCount > 0 && <button aria-expanded={expanded} className="task-card__meta-button" onClick={() => setExpanded((value) => !value)} type="button"><ListChecks aria-hidden="true" size={15} />{subtaskDone}/{subtaskCount} {fr.task.subtasks}</button>}
            {task.estimatedMinutes && <span>{task.estimatedMinutes} min</span>}
          </div>
          {expanded && subtaskCount > 0 && <ul className="subtask-list">{task.subtasks.map((subtask) => <li key={subtask.id}>{variant === 'active' && onSubtask ? <Checkbox checked={subtask.done} label={subtask.title} onCheckedChange={(checked) => onSubtask(subtask.id, checked)} /> : <span aria-hidden="true">{subtask.done ? '✓' : '○'}</span>}<span className={subtask.done ? 'is-done' : ''}>{subtask.title}</span></li>)}</ul>}
        </div>
      </div>
      <div className="task-card__actions">
        {variant === 'active' && <>
          {onReschedule && <button className="icon-button surface-raised" onClick={onReschedule} aria-label={`${fr.task.reschedule} : ${task.title}`} type="button"><Clock3 size={18} /></button>}
          {onDelete && <button className="icon-button surface-raised" onClick={onDelete} aria-label={`${fr.task.delete} : ${task.title}`} type="button"><Trash2 size={18} /></button>}
        </>}
        {variant === 'history' && onReopen && <button className="task-card__action" onClick={onReopen} type="button"><RotateCcw size={16} />{fr.task.reopen}</button>}
        {variant === 'trash' && onRestore && <button className="task-card__action" onClick={onRestore} type="button"><RotateCcw size={16} />{fr.task.restore}</button>}
        {variant === 'trash' && onDelete && canDeleteForever && <button className="icon-button surface-raised" onClick={onDelete} aria-label={`${fr.task.deleteForever} : ${task.title}`} type="button"><Trash2 size={18} /></button>}
      </div>
      {variant === 'active' && <button aria-label={`${fr.task.moreActions} : ${task.title}`} className="task-card__more" onClick={() => setExpanded((value) => !value)} type="button"><MoreHorizontal size={18} /></button>}
    </article>
  );
}
