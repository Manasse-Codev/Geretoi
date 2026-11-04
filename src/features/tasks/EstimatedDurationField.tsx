import { AlertCircle, Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { fr } from '@/i18n/fr';
import {
  durationFromParts, durationPartsFromMinutes, formatDuration, MAX_DURATION_MINUTES,
  normalizeDurationParts, sanitizeDurationPart,
} from '@/lib/duration';

const shortcuts = [15, 30, 60, 120] as const;

export function EstimatedDurationField({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  const initial = durationPartsFromMinutes(value);
  const [hours, setHours] = useState(initial.hours);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [custom, setCustom] = useState(value !== null && !shortcuts.includes(value as typeof shortcuts[number]));
  const total = durationFromParts(hours, minutes);
  const overLimit = total > MAX_DURATION_MINUTES;

  useEffect(() => {
    const parts = durationPartsFromMinutes(value);
    setHours(parts.hours);
    setMinutes(parts.minutes);
    setCustom(value !== null && !shortcuts.includes(value as typeof shortcuts[number]));
  }, [value]);

  const selected = useMemo(() => (custom || value === null ? null : value), [custom, value]);

  function chooseShortcut(next: number) {
    setCustom(false);
    setHours(String(Math.floor(next / 60)));
    setMinutes(String(next % 60));
    onChange(next);
  }

  function chooseCustom() {
    setCustom(true);
    if (value === null) {
      setHours('');
      setMinutes('');
    }
  }

  function updateParts(nextHours: string, nextMinutes: string) {
    if (/[-.,]/.test(nextHours) || /[-.,]/.test(nextMinutes)) return;
    const cleanHours = sanitizeDurationPart(nextHours);
    const cleanMinutes = sanitizeDurationPart(nextMinutes);
    const nextTotal = durationFromParts(cleanHours, cleanMinutes);
    if (nextTotal > MAX_DURATION_MINUTES) {
      setHours(cleanHours);
      setMinutes(cleanMinutes);
      return;
    }
    const normalized = normalizeDurationParts(cleanHours, cleanMinutes);
    setHours(normalized.hours);
    setMinutes(normalized.minutes);
    onChange(normalized.total > 0 ? normalized.total : null);
  }

  function adjust(part: 'hours' | 'minutes', delta: number) {
    const current = durationFromParts(hours, minutes);
    const next = Math.max(0, current + (part === 'hours' ? delta * 60 : delta * 5));
    if (next === 0) {
      updateParts('', '');
      return;
    }
    updateParts(String(Math.floor(next / 60)), String(next % 60));
  }

  return (
    <fieldset className="choice-field duration-field" role="group" aria-labelledby="estimated-duration-label">
      <legend id="estimated-duration-label">{fr.taskForm.estimate}</legend>
      <div className="choice-row">
        {shortcuts.map((shortcut) => (
          <button aria-pressed={selected === shortcut} className="filter-chip surface-raised" key={shortcut} onClick={() => chooseShortcut(shortcut)} type="button">
            {formatDuration(shortcut)}
          </button>
        ))}
        <button aria-pressed={custom} className="filter-chip surface-raised" onClick={chooseCustom} type="button">{fr.taskForm.otherDuration}</button>
        {value !== null && <button className="filter-chip surface-raised" onClick={() => { setHours(''); setMinutes(''); setCustom(false); onChange(null); }} type="button">{fr.taskForm.clearDuration}</button>}
      </div>
      {custom && <div aria-label={fr.taskForm.manualDuration} className="duration-editor surface-inset">
        <div className="duration-input">
          <label htmlFor="duration-hours">{fr.taskForm.hours}</label>
          <div className="duration-input__controls">
            <Button aria-label={fr.taskForm.decreaseHours} className="round-control" onClick={() => adjust('hours', -1)} type="button" variant="ghost"><Minus size={18} /></Button>
            <input id="duration-hours" inputMode="numeric" min="0" onChange={(event) => updateParts(event.currentTarget.value, minutes)} pattern="[0-9]*" type="text" value={hours} />
            <Button aria-label={fr.taskForm.increaseHours} className="round-control" onClick={() => adjust('hours', 1)} type="button" variant="ghost"><Plus size={18} /></Button>
          </div>
        </div>
        <div className="duration-input">
          <label htmlFor="duration-minutes">{fr.taskForm.minutes}</label>
          <div className="duration-input__controls">
            <Button aria-label={fr.taskForm.decreaseMinutes} className="round-control" onClick={() => adjust('minutes', -1)} type="button" variant="ghost"><Minus size={18} /></Button>
            <input id="duration-minutes" inputMode="numeric" min="0" onChange={(event) => updateParts(hours, event.currentTarget.value)} pattern="[0-9]*" type="text" value={minutes} />
            <Button aria-label={fr.taskForm.increaseMinutes} className="round-control" onClick={() => adjust('minutes', 1)} type="button" variant="ghost"><Plus size={18} /></Button>
          </div>
        </div>
        <output aria-live="polite" className="duration-value">{total > 0 ? formatDuration(total) : fr.taskForm.noDuration}</output>
      </div>}
      {overLimit && <p className="inline-error duration-error" role="alert"><AlertCircle aria-hidden="true" size={18} />{fr.taskForm.durationTooLong}</p>}
    </fieldset>
  );
}
