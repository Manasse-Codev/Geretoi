import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CalendarDays, ChevronDown, Flame, FolderOpen, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { TextField } from '@/components/TextField';
import { RetryNotice } from '@/components/RetryNotice';
import { useLists } from '@/features/lists/useLists';
import { useTags } from '@/features/tags/useTags';
import { useTaskActions } from '@/features/tasks';
import { fr } from '@/i18n/fr';
import { setUnsavedChanges } from '@/lib/unsavedChanges';
import type { TaskPriority, Subtask } from '@/types/models';

function localDateString(date: Date) {
  const year = date.getFullYear(); const month = `${date.getMonth() + 1}`.padStart(2, '0'); const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function TaskFormPage() {
  const navigate = useNavigate();
  const actions = useTaskActions();
  const listsState = useLists(); const lists = listsState.lists;
  const tagsState = useTags(); const tags = tagsState.tags;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(localDateString(new Date()));
  const [time, setTime] = useState('09:30');
  const [priority, setPriority] = useState<TaskPriority>(3);
  const [listId, setListId] = useState('');
  const [minutes, setMinutes] = useState<number | null>(30);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [draftSubtask, setDraftSubtask] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const priorities: TaskPriority[] = [4, 3, 2, 1];

  useEffect(() => () => setUnsavedChanges(false), []);

  function makeDueDate(value: string) {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return year && month && day ? new Date(year, month - 1, day, 0, 0, 0, 0) : null;
  }

  async function submit(again = false) {
    if (!title.trim() || submitting) { if (!title.trim()) setError(fr.taskForm.emptyTitle); return; }
    setError(null);
    setSubmitting(true);
    try {
      await actions.create({ title, description, priority, dueDate: makeDueDate(date), startTime: time || null, estimatedMinutes: minutes, listId: listId || null, tags: selectedTags, subtasks });
      window.dispatchEvent(new Event('dayflow:task-created'));
      if (again) { setTitle(''); setDescription(''); setSubtasks([]); setDraftSubtask(''); }
      else { setUnsavedChanges(false); navigate(-1); }
    } catch { setError(actions.errorMessage ?? fr.task.createError); }
    finally { setSubmitting(false); }
  }

  function addSubtask() {
    const text = draftSubtask.trim();
    if (!text) return;
    setSubtasks((items) => [...items, { id: crypto.randomUUID(), title: text, done: false }]); setDraftSubtask('');
  }

  function quickDate(offset: number) {
    const next = new Date(); next.setDate(next.getDate() + offset); setDate(localDateString(next));
  }
  const weekendOffset = (6 - new Date().getDay() + 7) % 7;
  const quickDates = [['Aujourd’hui', 0], ['Demain', 1], ['Ce week-end', weekendOffset]] as const;

  return <div className="screen screen--task-form">
    <header className="form-toolbar"><Button aria-label={fr.task.cancel} disabled={submitting} onClick={() => { setUnsavedChanges(false); navigate(-1); }} variant="ghost"><ArrowLeft size={18} />{fr.task.cancel}</Button><h1>{fr.pages.newTask}</h1><Button aria-label={fr.task.add} className="form-save" disabled={submitting} loading={submitting} onClick={() => void submit()} variant="primary">✓</Button></header>
    <form className="task-form" onChange={() => setUnsavedChanges(true)} onClickCapture={(event) => { if ((event.target as HTMLElement).closest('button')) setUnsavedChanges(true); }} onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      <TextField autoFocus error={error ?? undefined} label={fr.task.title} onChange={(event) => setTitle(event.currentTarget.value)} placeholder={fr.taskForm.titlePlaceholder} value={title} />
      <div className="quick-date-row" role="group" aria-label={fr.taskForm.dateLabel}>
        {quickDates.map(([, offset], index) => { const expected = new Date(); expected.setDate(expected.getDate() + offset); const label = [fr.taskForm.dateToday, fr.taskForm.dateTomorrow, fr.taskForm.dateWeekend][index] ?? ''; return <button aria-pressed={date === localDateString(expected)} className="filter-chip surface-raised" key={label} onClick={() => quickDate(offset)} type="button"><CalendarDays size={16} />{label}</button>; })}
      </div>
      <div className="form-quick-fields">
        <label className="form-select"><span><Flame size={17} />{fr.taskForm.priority}</span><select onChange={(event) => setPriority(Number(event.currentTarget.value) as TaskPriority)} value={priority}>{priorities.map((value) => <option key={value} value={value}>{fr.priorities[value].label}</option>)}</select><ChevronDown size={16} /></label>
        <label className="form-select"><span><FolderOpen size={17} />{fr.taskForm.list}</span><select onChange={(event) => setListId(event.currentTarget.value)} value={listId}><option value="">{fr.task.unknownList}</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select><ChevronDown size={16} /></label>
        <label className="form-select"><span><Bell size={17} />{fr.taskForm.time}</span><input aria-label={fr.taskForm.time} onChange={(event) => setTime(event.currentTarget.value)} type="time" value={time} /></label>
      </div>
      <Card className="task-details">
        <button aria-expanded={detailsOpen} className="accordion-trigger" onClick={() => setDetailsOpen((value) => !value)} type="button"><span><SlidersHorizontal size={19} />{fr.taskForm.moreDetails}</span><ChevronDown className={detailsOpen ? 'accordion-chevron is-open' : 'accordion-chevron'} size={18} /></button>
        {detailsOpen && <div className="task-details__body">
          <div className="form-two-col"><TextField label={fr.task.dueDate} onChange={(event) => setDate(event.currentTarget.value)} type="date" value={date} /><TextField label={fr.taskForm.time} onChange={(event) => setTime(event.currentTarget.value)} type="time" value={time} /></div>
          <TextField label={fr.task.description} onChange={(event) => setDescription(event.currentTarget.value)} placeholder="Ajouter quelques détails…" value={description} />
          <fieldset className="choice-field"><legend>{fr.taskForm.estimate}</legend><div className="choice-row">{[15, 30, 45, 60, 120].map((value) => <button aria-pressed={minutes === value} className="filter-chip surface-raised" key={value} onClick={() => setMinutes(value)} type="button">{value < 60 ? `${value} min` : `${value / 60} h`}</button>)}</div></fieldset>
          <fieldset className="choice-field"><legend>{fr.task.priority}</legend><div className="choice-row">{priorities.map((value) => <button aria-pressed={priority === value} className={`priority-choice priority-choice--${value}`} key={value} onClick={() => setPriority(value)} type="button">{fr.priorities[value].label}</button>)}</div></fieldset>
          {tags.length > 0 && <fieldset className="choice-field"><legend>{fr.taskForm.tags}</legend><div className="choice-row">{tags.map((tag) => <button aria-pressed={selectedTags.includes(tag.id)} className="filter-chip surface-raised" key={tag.id} onClick={() => setSelectedTags((current) => current.includes(tag.id) ? current.filter((id) => id !== tag.id) : [...current, tag.id])} type="button">{tag.name}</button>)}</div></fieldset>}
          <fieldset className="choice-field"><legend>Sous-tâches ({subtasks.filter((item) => item.done).length}/{subtasks.length})</legend>{subtasks.map((subtask) => <div className="subtask-edit-row" key={subtask.id}><Checkbox checked={subtask.done} label={subtask.title} onCheckedChange={(done) => setSubtasks((items) => items.map((item) => item.id === subtask.id ? { ...item, done } : item))} /><span className={subtask.done ? 'is-done' : ''}>{subtask.title}</span><button aria-label={`Retirer ${subtask.title}`} className="icon-button" onClick={() => setSubtasks((items) => items.filter((item) => item.id !== subtask.id))} type="button"><Trash2 size={16} /></button></div>)}<div className="add-subtask-row"><input aria-label={fr.taskForm.subtaskPlaceholder} className="text-control" onChange={(event) => setDraftSubtask(event.currentTarget.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSubtask(); } }} placeholder={fr.taskForm.subtaskPlaceholder} value={draftSubtask} /><Button aria-label={fr.taskForm.addSubtask} onClick={addSubtask}><Plus size={17} /></Button></div></fieldset>
        </div>}
      </Card>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {listsState.errorMessage && <RetryNotice loading={listsState.loading} message={listsState.errorMessage} onRetry={listsState.retry} />}
      {tagsState.errorMessage && <RetryNotice loading={tagsState.loading} message={tagsState.errorMessage} onRetry={tagsState.retry} />}
      <div className="form-actions"><Button className="form-submit" disabled={submitting} loading={submitting} onClick={() => void submit()} type="button" variant="primary"><Plus size={19} />{fr.task.add}</Button><Button disabled={submitting} loading={submitting} onClick={() => void submit(true)} variant="ghost">{fr.task.addAnother}</Button></div>
    </form>
  </div>;
}
