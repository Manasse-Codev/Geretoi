import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ChevronDown, Flame, History, RefreshCw, TrendingUp } from 'lucide-react';
import { addDays, format, isAfter, startOfDay, subDays } from 'date-fns';
import { fr as frDate } from 'date-fns/locale';
import { Card } from '@/components/Card';
import { ProgressRing } from '@/components/ProgressRing';
import { SyncIndicator } from '@/components/SyncIndicator';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useHistory, useTaskActions, useTodayTasks } from '@/features/tasks';
import { fr } from '@/i18n/fr';

export function StatsPage() {
  const history = useHistory(); const today = useTodayTasks(); const actions = useTaskActions();
  const [range, setRange] = useState<7 | 30>(7); const [details, setDetails] = useState<'history' | 'habits' | null>(null);
  const cutoff = startOfDay(subDays(new Date(), range - 1));
  const recent = history.tasks.filter((task) => task.completedAt && !isAfter(cutoff, task.completedAt));
  const activeCount = today.tasks.length;
  const totalSample = recent.length + activeCount;
  const completion = totalSample ? Math.round((recent.length / totalSample) * 100) : 0;
  const estimatedHours = Math.round(recent.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0) / 60 * 10) / 10;
  const chartData = useMemo(() => Array.from({ length: range === 7 ? 7 : 14 }, (_, index) => {
    const date = addDays(new Date(), -(range === 7 ? 6 : 13) + index);
    return { date, day: format(date, range === 7 ? 'EEE' : 'd MMM', { locale: frDate }), tasks: recent.filter((task) => task.completedAt && format(task.completedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length };
  }), [range, recent]);

  return <div className="screen screen--stats">
    <header className="screen-heading screen-heading--row"><div><p className="eyebrow"><Activity size={18} />{fr.statsPage.title}</p><h1>{fr.statsPage.summary}</h1><p className="muted">{fr.statsPage.scope}</p></div><select aria-label="Période des statistiques" className="text-control stats-range" onChange={(event) => setRange(Number(event.currentTarget.value) as 7 | 30)} value={range}><option value={7}>{fr.statsPage.week}</option><option value={30}>{fr.statsPage.days30}</option></select></header>
    <SyncIndicator sync={history.sync} />
    <section className="stats-rings"><Card className="stats-ring-card"><ProgressRing label={`${fr.statsPage.completedRate} : ${completion} %`} value={completion} size={132} /><h2>{completion}%</h2><h3>{fr.statsPage.completedRate}</h3><p>{recent.length} {fr.statsPage.complete.toLocaleLowerCase('fr')} · {activeCount} {fr.statsPage.activeToday.toLocaleLowerCase('fr')}</p></Card><Card className="stats-ring-card"><ProgressRing label={fr.statsPage.estimatedTime} value={Math.min(100, Math.round(estimatedHours / 8 * 100))} size={132} /><h2>{estimatedHours} h</h2><h3>{fr.statsPage.estimatedTime}</h3><p>{fr.statsPage.inRange}</p></Card></section>
    <Card className="stats-counter-row"><div><strong>{recent.length}</strong><span>{fr.statsPage.complete}</span></div><div><strong>{activeCount}</strong><span>{fr.statsPage.activeToday}</span></div><div><strong>{history.tasks.length}</strong><span>{fr.statsPage.loaded}</span></div></Card>
    <Card className="activity-chart-card"><div className="section-heading"><div><h2>{fr.statsPage.recentActivity}</h2><p className="muted">{fr.statsPage.perDay}</p></div><div className="average-stat"><strong>{(recent.length / (range === 7 ? 7 : 14)).toFixed(1)}</strong><span>{fr.statsPage.perDayShort}</span></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 10, left: -24, bottom: 0 }}><CartesianGrid stroke="var(--color-outline)" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 14, background: 'var(--color-card)', border: '1px solid var(--color-outline)', color: 'var(--color-text)' }} /><Bar dataKey="tasks" name={fr.statsPage.complete} fill="var(--color-orange)" radius={[9, 9, 2, 2]} maxBarSize={36} /></BarChart></ResponsiveContainer></div><p className="feature-help">{fr.statsPage.sampleLimit.replace('{count}', String(history.tasks.length))}</p></Card>
    <button aria-expanded={details === 'history'} className="accordion-card surface-raised" onClick={() => setDetails(details === 'history' ? null : 'history')} type="button"><span><History size={20} />{fr.statsPage.detailHistory}</span><ChevronDown className={details === 'history' ? 'accordion-chevron is-open' : 'accordion-chevron'} /></button>
    {details === 'history' && (history.tasks.length ? <div className="task-list">{history.tasks.slice(0, 5).map((task) => <TaskCard key={task.id} task={task} variant="history" onReopen={() => void actions.reopen(task.id).catch(() => undefined)} />)}{history.hasMore && <Button disabled={history.loading} onClick={() => void history.loadMore()}>Charger plus</Button>}</div> : <EmptyState title={fr.task.empty} description={fr.pagesContent.history} />)}
    <button aria-expanded={details === 'habits'} className="accordion-card surface-raised" onClick={() => setDetails(details === 'habits' ? null : 'habits')} type="button"><span><RefreshCw size={20} />{fr.statsPage.habits}</span><ChevronDown className={details === 'habits' ? 'accordion-chevron is-open' : 'accordion-chevron'} /></button>
    {details === 'habits' && <Card className="feature-note"><Flame /><p>{fr.pagesContent.unsupported} Le suivi d’habitudes et de séries n’est pas enregistré dans le modèle actuel.</p></Card>}
    {history.loading && <p className="muted" role="status">Chargement des données…</p>}{history.errorMessage && <p className="inline-error" role="alert">{history.errorMessage}</p>}{actions.errorMessage && <p className="inline-error" role="alert">{actions.errorMessage}</p>}
    {history.hasMore && <Button aria-label={fr.statsPage.historyLabel} onClick={() => void history.loadMore()} variant="ghost"><TrendingUp size={16} />{fr.statsPage.loadMoreStats}</Button>}
  </div>;
}
