import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { addDays, addWeeks, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { fr as frDate } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, GripVertical, Plus } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { SyncIndicator } from '@/components/SyncIndicator';
import { useTaskActions, useTasksInRange, useUnscheduledTasks } from '@/features/tasks';
import { usePreferences } from '@/features/settings/usePreferences';
import { fr } from '@/i18n/fr';
import type { Task } from '@/types/models';

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd');

function DraggableTask({ task, onSchedule }: { task: Task; onSchedule?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { taskId: task.id } });
  return <article className={`planner-task surface-raised${isDragging ? ' is-dragging' : ''}`} ref={setNodeRef} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}>
    <button aria-label={`Déplacer ${task.title}`} className="planner-task__drag" {...listeners} {...attributes} type="button"><GripVertical size={17} /></button>
    <div><h3>{task.title}</h3><p>{task.startTime ? `${task.startTime} · ` : ''}{task.estimatedMinutes ? `${task.estimatedMinutes} min` : 'Durée non estimée'}</p></div>
    {onSchedule && <button aria-label={`${fr.plannerPage.schedule} ${task.title} ${format(new Date(), 'd MMMM', { locale: frDate })}`} className="icon-button surface-raised" onClick={onSchedule} type="button"><Plus size={18} /></button>}
  </article>;
}

function CalendarDropZone({ date, children }: { date: Date; children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: dayKey(date), data: { date: dayKey(date) } });
  return <div className={`planner-day-drop${isOver ? ' is-over' : ''}`} ref={setNodeRef}>{children}</div>;
}

export function PlannerPage() {
  const { preferences } = usePreferences();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);
  const weekStartsOn = preferences.firstDayOfWeek === 'monday' ? 1 : 0;
  const start = useMemo(() => startOfWeek(selectedDate, { weekStartsOn, locale: frDate }), [selectedDate, weekStartsOn]);
  const end = useMemo(() => endOfWeek(selectedDate, { weekStartsOn, locale: frDate }), [selectedDate, weekStartsOn]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(start, index)), [start]);
  const tasks = useTasksInRange(start, end);
  const unscheduled = useUnscheduledTasks();
  const actions = useTaskActions();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dayTasks = tasks.tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, selectedDate)).sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'));

  async function schedule(taskId: string, date: Date) {
    try { await actions.reschedule(taskId, date); } catch { /* message displayed in the page */ }
  }
  function onDragEnd(event: DragEndEvent) {
    const dateValue = event.over?.data.current?.date;
    if (typeof event.active.id !== 'string' || typeof dateValue !== 'string') return;
    const [year, month, day] = dateValue.split('-').map(Number);
    if (year && month && day) void schedule(event.active.id, new Date(year, month - 1, day));
  }

  return <div className="screen screen--planner">
    <header className="screen-heading screen-heading--row"><div><p className="eyebrow"><CalendarDays size={17} />{fr.plannerPage.title}</p><h1>{format(selectedDate, 'MMMM yyyy', { locale: frDate })}</h1></div><div className="week-controls"><Button aria-label={fr.plannerPage.previous} onClick={() => setSelectedDate((date) => subWeeks(date, 1))}><ChevronLeft /></Button><Button aria-label={fr.plannerPage.next} onClick={() => setSelectedDate((date) => addWeeks(date, 1))}><ChevronRight /></Button></div></header>
    <div className="week-strip" aria-label={fr.plannerPage.chooseDay} role="group">{days.map((date) => <button aria-pressed={isSameDay(date, selectedDate)} className="week-day surface-raised" key={dayKey(date)} onClick={() => setSelectedDate(date)} type="button"><span>{format(date, 'EEE', { locale: frDate })}</span><strong>{format(date, 'd')}</strong></button>)}</div>
    <div className="planner-summary"><span>{fr.plannerPage.today}</span><SyncIndicator sync={tasks.sync} /></div>
    <div className="planner-workspace">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <Card className="timeline-card">
          <div className="timeline-heading"><h2>{format(selectedDate, 'EEEE d MMMM', { locale: frDate })}</h2><span>{dayTasks.length} {fr.plannerPage.tasks}</span></div>
          {tasks.loading && tasks.tasks.length === 0 ? <div className="task-skeleton surface-raised" /> : <CalendarDropZone date={selectedDate}><div className="timeline">
            {Array.from({ length: 11 }, (_, index) => 8 + index).map((hour) => <div className="timeline__hour" key={hour}><span>{`${hour.toString().padStart(2, '0')}:00`}</span><div /></div>)}
            <div className="timeline__events">{dayTasks.map((task) => <DraggableTask key={task.id} task={task} />)}</div>
            {dayTasks.length === 0 && <div className="timeline-empty">{fr.plannerPage.dropHelp}</div>}
          </div></CalendarDropZone>}
        </Card>
        <Card className="unscheduled-card"><div className="section-heading"><h2>{fr.plannerPage.unscheduled}</h2><span>{unscheduled.tasks.length}</span></div><p className="muted">{fr.plannerPage.dragHelp}</p>{unscheduled.loading ? <div className="task-skeleton surface-raised" /> : unscheduled.tasks.length === 0 ? <EmptyState title={fr.plannerPage.allScheduled} description={fr.plannerPage.unscheduledHelp} /> : <div className="planner-unscheduled">{unscheduled.tasks.map((task) => <DraggableTask key={task.id} task={task} onSchedule={() => void schedule(task.id, selectedDate)} />)}</div>}</Card>
      </DndContext>
    </div>
    {(tasks.errorMessage || unscheduled.errorMessage || actions.errorMessage) && <p className="inline-error" role="alert">{tasks.errorMessage || unscheduled.errorMessage || actions.errorMessage}</p>}
    <Button className="planner-info" onClick={() => setShowInfo((value) => !value)} variant="ghost">{showInfo ? fr.plannerPage.hideAbout : fr.plannerPage.about}</Button>
    {showInfo && <p className="feature-help">{fr.plannerPage.calendarLimit}</p>}
    {!tasks.loading && <span className="sr-only"><Clock3 />La liste est filtrée sur la date sélectionnée.</span>}
  </div>;
}
