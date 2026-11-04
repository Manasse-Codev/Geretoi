import { useMemo, useState } from 'react';
import { Activity, Search, SlidersHorizontal } from 'lucide-react';
import { differenceInCalendarDays, format } from 'date-fns';
import { EmptyState } from '@/components/EmptyState';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/Button';
import { RetryNotice } from '@/components/RetryNotice';
import { useLists } from '@/features/lists/useLists';
import { useTags } from '@/features/tags/useTags';
import { useHistory, useTaskActions, useTrash } from '@/features/tasks';
import { fr } from '@/i18n/fr';
import { groupTasksByCompletionDay } from '@/lib/dates';

type HistoryTab = 'done' | 'trash' | 'all';

export function HistoryPage({ trashOnly = false }: { trashOnly?: boolean }) {
  const history = useHistory(); const trash = useTrash(); const listsState = useLists(); const lists = listsState.lists; const tagsState = useTags(); const tags = tagsState.tags; const actions = useTaskActions();
  const [tab, setTab] = useState<HistoryTab>(trashOnly ? 'trash' : 'done');
  const [search, setSearch] = useState(''); const [listFilter, setListFilter] = useState(''); const [tagFilter, setTagFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const selectedTab = trashOnly ? 'trash' : tab;
  const base = selectedTab === 'trash' ? trash.tasks : selectedTab === 'all' ? [...history.tasks, ...trash.tasks] : history.tasks;
  const filtered = base.filter((task) => task.title.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')) && (!listFilter || task.listId === listFilter) && (!tagFilter || task.tags.includes(tagFilter)));
  const historyFiltered = selectedTab === 'all' ? filtered.filter((task) => task.deletedAt === null) : filtered;
  const grouped = useMemo(() => selectedTab === 'trash' ? [] : groupTasksByCompletionDay(historyFiltered.filter((task) => task.status === 'done')), [historyFiltered, selectedTab]);

  return <div className="screen screen--history">
    <header className="screen-heading screen-heading--row"><div><p className="eyebrow"><Activity size={17} />{trashOnly ? fr.pages.trash : fr.pages.history}</p><h1>{trashOnly ? fr.pages.trash : fr.pages.history}</h1></div></header>
    <div className="task-search"><Search aria-hidden="true" size={20} /><input aria-label={fr.historyPage.search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder={fr.historyPage.search} type="search" value={search} /><button aria-expanded={filterOpen} aria-label={fr.historyPage.filters} className="icon-button" onClick={() => setFilterOpen((value) => !value)} type="button"><SlidersHorizontal aria-hidden="true" size={18} /></button></div>
    {!trashOnly && <div className="segmented history-tabs" role="group" aria-label={fr.historyPage.show}><button aria-pressed={tab === 'done'} className="filter-chip surface-raised" onClick={() => setTab('done')} type="button">{fr.historyPage.done}</button><button aria-pressed={tab === 'trash'} className="filter-chip surface-raised" onClick={() => setTab('trash')} type="button">{fr.historyPage.deleted}</button><button aria-pressed={tab === 'all'} className="filter-chip surface-raised" onClick={() => setTab('all')} type="button">{fr.historyPage.all}</button></div>}
    {selectedTab !== 'trash' && <><div className="list-filter-row"><button aria-pressed={!listFilter} className="filter-chip surface-raised" onClick={() => setListFilter('')} type="button">{fr.historyPage.allLists}</button>{lists.map((list) => <button aria-pressed={listFilter === list.id} className="filter-chip surface-raised" key={list.id} onClick={() => setListFilter(list.id)} type="button">{list.name}</button>)}</div>{filterOpen && tags.length > 0 && <div className="list-filter-row" aria-label={fr.historyPage.filterTags}>{tags.map((tag) => <button aria-pressed={tagFilter === tag.id} className="filter-chip surface-raised" key={tag.id} onClick={() => setTagFilter(tagFilter === tag.id ? '' : tag.id)} type="button">#{tag.name}</button>)}</div>}</>}
    {selectedTab === 'trash' ? <section className="history-groups"><div className="section-heading"><h2>{fr.historyPage.deletedItems}</h2><span>{fr.historyPage.retention}</span></div>{trash.loading && filtered.length === 0 ? <div className="task-skeleton surface-raised" /> : filtered.length === 0 ? <EmptyState title={fr.historyPage.emptyTrash} description={fr.pagesContent.trash} /> : <div className="task-list">{filtered.map((task) => <TaskCard key={task.id} task={task} listName={lists.find((list) => list.id === task.listId)?.name} variant="trash" canDeleteForever={Boolean(task.deletedAt && task.deletedAt.getTime() <= Date.now() - 30 * 24 * 60 * 60 * 1000)} onRestore={() => void actions.restore(task.id).catch(() => undefined)} onDelete={() => void actions.permanentlyDelete(task.id).catch(() => undefined)} />)}</div>}{trash.hasMore && <Button disabled={trash.loading} onClick={() => void trash.loadMore()}>{fr.historyPage.more}</Button>}</section> : <>
      <section className="history-groups">{history.loading && history.tasks.length === 0 ? <div className="task-skeleton surface-raised" /> : grouped.length === 0 ? <EmptyState title={fr.task.empty} description={fr.pagesContent.history} /> : grouped.map((group) => <div className="history-group" key={group.key}><div className="section-heading"><h2>{group.key === format(new Date(), 'yyyy-MM-dd') ? fr.historyPage.todayHeading : differenceInCalendarDays(new Date(), group.date) === 1 ? fr.historyPage.yesterday : group.label}</h2></div><div className="task-list">{group.tasks.map((task) => <TaskCard key={task.id} task={task} listName={lists.find((list) => list.id === task.listId)?.name} variant="history" onReopen={() => void actions.reopen(task.id).catch(() => undefined)} />)}</div></div>)}{history.hasMore && <Button disabled={history.loading} onClick={() => void history.loadMore()}>{fr.historyPage.more}</Button>}</section>
      {selectedTab === 'all' && <section className="history-groups"><div className="section-heading"><h2>{fr.historyPage.deletedItems}</h2></div><div className="task-list">{filtered.filter((task) => task.deletedAt !== null).map((task) => <TaskCard key={task.id} task={task} listName={lists.find((list) => list.id === task.listId)?.name} variant="trash" canDeleteForever={Boolean(task.deletedAt && task.deletedAt.getTime() <= Date.now() - 30 * 24 * 60 * 60 * 1000)} onRestore={() => void actions.restore(task.id).catch(() => undefined)} onDelete={() => void actions.permanentlyDelete(task.id).catch(() => undefined)} />)}</div>{trash.hasMore && <Button disabled={trash.loading} onClick={() => void trash.loadMore()}>{fr.historyPage.moreTrash}</Button>}</section>}
    </>}
    {history.errorMessage && <RetryNotice loading={history.loading} message={history.errorMessage} onRetry={history.retry} />}
    {trash.errorMessage && <RetryNotice loading={trash.loading} message={trash.errorMessage} onRetry={trash.retry} />}
    {listsState.errorMessage && <RetryNotice loading={listsState.loading} message={listsState.errorMessage} onRetry={listsState.retry} />}
    {tagsState.errorMessage && <RetryNotice loading={tagsState.loading} message={tagsState.errorMessage} onRetry={tagsState.retry} />}
    {actions.errorMessage && <p className="inline-error" role="alert">{actions.errorMessage}</p>}
  </div>;
}
