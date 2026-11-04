export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 24 * 60;

export function isValidDurationMinutes(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) &&
    value >= MIN_DURATION_MINUTES && value <= MAX_DURATION_MINUTES;
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return '';
  if (!Number.isFinite(minutes) || !Number.isInteger(minutes) || minutes < 0) return '';
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours === 0) return `${remaining} min`;
  if (remaining === 0) return `${hours} h`;
  return `${hours} h ${remaining} min`;
}

export function parseDuration(value: string): number | null {
  const normalized = value.trim().toLowerCase().replace(',', '.');
  const hours = normalized.match(/(\d+)\s*h/);
  const minutes = normalized.match(/(\d+)\s*min/);
  if (!hours && !minutes) {
    const numeric = Number.parseInt(normalized.replace(/\D/g, ''), 10);
    return Number.isNaN(numeric) ? null : numeric;
  }
  const total = (hours ? Number.parseInt(hours[1] ?? '0', 10) * 60 : 0) +
    (minutes ? Number.parseInt(minutes[1] ?? '0', 10) : 0);
  return isValidDurationMinutes(total) ? total : null;
}

export function sanitizeDurationPart(value: string): string {
  return value.replace(/\D/g, '');
}

export function durationFromParts(hours: string, minutes: string): number {
  const parsedHours = Number.parseInt(sanitizeDurationPart(hours) || '0', 10);
  const parsedMinutes = Number.parseInt(sanitizeDurationPart(minutes) || '0', 10);
  return parsedHours * 60 + parsedMinutes;
}

export function normalizeDurationParts(hours: string, minutes: string): { hours: string; minutes: string; total: number } {
  const total = durationFromParts(hours, minutes);
  if (total <= 0) return { hours: '', minutes: '', total: 0 };
  const bounded = Math.min(total, MAX_DURATION_MINUTES);
  return {
    hours: String(Math.floor(bounded / 60)),
    minutes: String(bounded % 60),
    total: bounded,
  };
}

export function durationPartsFromMinutes(minutes: number | null | undefined): { hours: string; minutes: string } {
  if (!isValidDurationMinutes(minutes)) return { hours: '', minutes: '' };
  return { hours: String(Math.floor(minutes / 60)), minutes: String(minutes % 60) };
}
