import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { fr as frDate } from 'date-fns/locale';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { RetryNotice } from '@/components/RetryNotice';
import { TaskCard } from '@/components/TaskCard';
import { useTaskActions } from '@/features/tasks';
import { fr } from '@/i18n/fr';
import { StatsMetricCard } from './StatsMetricCard';
import { useStatsTasks } from './useStatsTasks';

export function StatsPage() {
  const actions = useTaskActions();
  const [range, setRange] = useState<7 | 30>(7);
  const start = useMemo(() => startOfDay(subDays(new Date(), range - 1)), [range]);
  const end = useMemo(() => endOfDay(new Date()), []);
  const stats = useStatsTasks(start, end, range);
  const recent = stats.tasks;
  const estimatedHours = Math.round(stats.estimatedMinutes / 60 * 10) / 10;
  const estimatedHoursLabel = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(estimatedHours);
  const chartData = useMemo(() => Array.from({ length: range }, (_, index) => {
    const date = addDays(start, index);
    return { day: format(date, range === 7 ? 'EEE' : 'd MMM', { locale: frDate }), tasks: stats.dailyCounts[index] ?? 0 };
  }), [range, start, stats.dailyCounts]);

  return <div className="screen screen--stats">
    <header className="screen-heading screen-heading--row"><div><p className="eyebrow"><Activity size={18} />{fr.statsPage.title}</p><h1>{fr.statsPage.summary}</h1><p className="muted">{fr.statsPage.scope}</p></div><select aria-label={fr.statsPage.periodLabel} className="text-control stats-range" onChange={(event) => setRange(Number(event.currentTarget.value) as 7 | 30)} value={range}><option value={7}>{fr.statsPage.week}</option><option value={30}>{fr.statsPage.days30}</option></select></header>
    {stats.loading && recent.length === 0 && stats.completedCount === 0 ? <div aria-busy="true" className="task-skeleton surface-raised" /> : stats.errorMessage ? <RetryNotice loading={stats.loading} message={stats.errorMessage} onRetry={stats.retry} /> : stats.completedCount === 0 ? <EmptyState title={fr.statsEmpty.title} description={fr.statsEmpty.description} /> : <>
      <section className="stats-rings"><StatsMetricCard description={range === 7 ? fr.statsPage.week : fr.statsPage.days30} label={fr.statsPage.complete} value={new Intl.NumberFormat('fr-FR').format(stats.completedCount)} /><StatsMetricCard description={fr.statsPage.inRange} label={fr.statsPage.estimatedTime} unit="h" value={estimatedHoursLabel} /></section>
      <Card className="activity-chart-card"><div className="section-heading"><div><h2>{fr.statsPage.recentActivity}</h2><p className="muted">{fr.statsPage.perDay}</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 12, right: 10, left: -24, bottom: 0 }}><CartesianGrid stroke="var(--color-outline)" strokeDasharray="3 6" vertical={false} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 14, background: 'var(--color-card)', border: '1px solid var(--color-outline)', color: 'var(--color-text)' }} /><Bar dataKey="tasks" name={fr.statsPage.complete} fill="var(--color-orange)" radius={[9, 9, 2, 2]} maxBarSize={36} /></BarChart></ResponsiveContainer></div></Card>
      <section className="history-groups"><div className="section-heading"><h2>{fr.statsPage.detailHistory}</h2></div><div className="task-list">{recent.slice(0, 5).map((task) => <TaskCard key={task.id} task={task} variant="history" onReopen={() => void actions.reopen(task.id).catch(() => undefined)} />)}</div></section>
    </>}
    {actions.errorMessage && <p className="inline-error" role="alert">{actions.errorMessage}</p>}
  </div>;
}
