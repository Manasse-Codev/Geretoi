import { useMemo, useState } from 'react';
import { Flame, Search, SlidersHorizontal, Sparkles, Sun } from 'lucide-react';
import { isSameDay } from 'date-fns';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ProgressRing } from '@/components/ProgressRing';
import { SyncIndicator } from '@/components/SyncIndicator';
import { TaskCard } from '@/components/TaskCard';
import { Toast } from '@/components/Toast';
import { useLists } from '@/features/lists/useLists';
import { useTags } from '@/features/tags/useTags';
import { useHistory, useOverdueTasks, useTaskActions, useTodayTasks } from '@/features/tasks';
import type { Task } from '@/types/models';
import { formatFrenchDate } from '@/lib/dates';
import { fr } from '@/i18n/fr';

type Filter = 'all' | 'overdue' | 'priority' | 'done';
interface UndoToast { message: string; undo: () => Promise<void> }

export function TodayPage() {
  const today = useTodayTasks();
  const overdue = useOverdueTasks();
  const history = useHistory();
  const { lists } = useLists();
  const { tags } = useTags();
  const actions = useTaskActions();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [listFilter, setListFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [toast, setToast] = useState<UndoToast | null>(null);

  const completedToday = history.tasks.filter((task) => task.completedAt && isSameDay(task.completedAt, new Date()));
  const all = useMemo(() => [...today.tasks].sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99')), [today.tasks]);
  const matchesDetails = (task: Task) => task.title.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')) && (!listFilter || task.listId === listFilter) && (!tagFilter || task.tags.includes(tagFilter));
  const matching = all.filter((task) => {
    if (!matchesDetails(task)) return false;
    if (filter === 'overdue') return overdue.tasks.some((item) => item.id === task.id);
    if (filter === 'priority') return task.priority <= 2;
    return true;
  });
  const shown = filter === 'done' ? completedToday.filter(matchesDetails) : filter === 'overdue' ? overdue.tasks.filter(matchesDetails) : matching;
  const top = [...all, ...completedToday].sort((a, b) => a.priority - b.priority || (a.startTime ?? '').localeCompare(b.startTime ?? '')).slice(0, 3);
  const progress = top.length ? Math.round((completedToday.filter((task) => top.some((item) => item.id === task.id)).length / top.length) * 100) : 0;
  const sync = today.sync;

  async function perform(label: string, operation: () => Promise<() => Promise<void>>) {
    try {
      const undo = await operation();
      setToast({ message: label, undo });
    } catch { /* errors are exposed by the mutation hook below */ }
  }

  return <div className="screen screen--today">
    <header className="screen-heading screen-heading--today">
      <div className="today-heading"><Sun aria-hidden="true" size={18} /><span>{formatFrenchDate(new Date(), 'EEEE d MMMM yyyy')}</span></div>
      <h1>{fr.pages.today}</h1><SyncIndicator sync={sync} />
    </header>
    <div className="task-search"><Search aria-hidden="true" size={20} /><input aria-label={fr.task.search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder={fr.todayPage.searchPlaceholder} type="search" value={search} /><button aria-expanded={filterOpen} aria-label={fr.todayPage.filters} className="icon-button" onClick={() => setFilterOpen((value) => !value)} type="button"><SlidersHorizontal aria-hidden="true" size={19} /></button></div>
    {filterOpen && <div className="advanced-filters"><label><span>{fr.todayPage.list}</span><select onChange={(event) => setListFilter(event.currentTarget.value)} value={listFilter}><option value="">{fr.todayPage.allLists}</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label><label><span>{fr.todayPage.tag}</span><select onChange={(event) => setTagFilter(event.currentTarget.value)} value={tagFilter}><option value="">{fr.todayPage.allTags}</option>{tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}</select></label></div>}
    <Card className="focus-card">
      <div className="focus-card__copy"><span className="eyebrow"><Sparkles size={16} />{fr.todayPage.morningPriority}</span><h2>{fr.todayPage.topThree}</h2><p>{completedToday.length} {fr.todayPage.completedToday}</p><div className="focus-card__progress"><span style={{ transform: `scaleX(${progress / 100})` }} /></div></div>
      <ProgressRing centerLabel={`${Math.round(progress)}%`} label={`Progression des tâches du jour : ${progress} %`} value={progress} size={78} />
    </Card>
    <div aria-label="Filtrer les tâches" className="task-filters" role="group">
      {([['all', `${fr.task.all} (${today.tasks.length})`], ['overdue', `${fr.task.overdue} (${overdue.tasks.length})`], ['priority', 'Priorité'], ['done', fr.task.done]] as const).map(([value, label]) => <button aria-pressed={filter === value} className="filter-chip surface-raised" key={value} onClick={() => setFilter(value)} type="button">{value === 'priority' && <Flame size={16} />}{label}</button>)}
    </div>
    <div className="section-heading"><h2>{fr.task.planned}</h2><span>{today.tasks.length} {fr.todayPage.remaining}</span></div>
    {today.loading && today.tasks.length === 0 ? <div className="task-list" aria-busy="true"><div className="task-skeleton surface-raised" /><div className="task-skeleton surface-raised" /></div> : shown.length === 0 ? <EmptyState title={fr.task.empty} description={fr.task.emptyDescription} /> : <div className="task-list">
      {shown.map((task: Task) => <TaskCard key={task.id} task={task} variant={filter === 'done' ? 'history' : 'active'} listName={lists.find((list) => list.id === task.listId)?.name} onComplete={filter === 'done' ? undefined : () => void perform(fr.task.undoComplete, () => actions.complete(task.id))} onReopen={filter === 'done' ? () => void actions.reopen(task.id).catch(() => undefined) : undefined} onDelete={filter === 'done' ? undefined : () => void perform(fr.task.undoDelete, () => actions.softDelete(task.id))} onSubtask={(id, checked) => void actions.toggleSubtask(task.id, id, checked).catch(() => undefined)} onReschedule={filter === 'done' ? undefined : () => { const next = new Date(); next.setDate(next.getDate() + 1); void perform(fr.task.undoReschedule, () => actions.reschedule(task.id, next)); }} />)}
    </div>}
    {today.errorMessage && <p className="inline-error" role="alert">{today.errorMessage}</p>}
    {actions.errorMessage && <p className="inline-error" role="alert">{actions.errorMessage}</p>}
    {toast && <Toast message={toast.message} onDismiss={() => setToast(null)} onUndo={() => { void toast.undo(); setToast(null); }} />}
  </div>;
}
