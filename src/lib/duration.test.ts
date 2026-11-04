import { describe, expect, it } from 'vitest';
import {
  durationFromParts, durationPartsFromMinutes, formatDuration, isValidDurationMinutes,
  normalizeDurationParts, parseDuration, sanitizeDurationPart,
} from './duration';

describe('duration', () => {
  it.each([
    [45, '45 min'],
    [60, '1 h'],
    [80, '1 h 20 min'],
    [750, '12 h 30 min'],
  ])('formate %s minutes en français', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });

  it('convertit 90 minutes en 1 h 30', () => {
    expect(normalizeDurationParts('0', '90')).toEqual({ hours: '1', minutes: '30', total: 90 });
    expect(parseDuration('90 min')).toBe(90);
    expect(parseDuration('1 h 30 min')).toBe(90);
  });

  it('additionne les champs heures et minutes', () => {
    expect(durationFromParts('1', '20')).toBe(80);
    expect(durationPartsFromMinutes(80)).toEqual({ hours: '1', minutes: '20' });
  });

  it('ignore les caractères non numériques', () => {
    expect(sanitizeDurationPart('-1.5h')).toBe('15');
  });

  it('refuse les valeurs hors limites', () => {
    expect(isValidDurationMinutes(1)).toBe(true);
    expect(isValidDurationMinutes(1440)).toBe(true);
    expect(isValidDurationMinutes(0)).toBe(false);
    expect(isValidDurationMinutes(1441)).toBe(false);
    expect(isValidDurationMinutes(12.5)).toBe(false);
    expect(isValidDurationMinutes('30')).toBe(false);
    expect(isValidDurationMinutes(Number.NaN)).toBe(false);
  });
});
