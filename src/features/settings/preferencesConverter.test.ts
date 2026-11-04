import { describe, expect, it } from 'vitest';
import { preferencesConverter } from './preferencesConverter';
import type { UserPreferences } from '@/types/models';

const preferences: UserPreferences = {
  theme: 'dark', language: 'fr', firstDayOfWeek: 'sunday', timeFormat: '12h', density: 'compact',
};

describe('preferencesConverter', () => {
  it('serializes density with the other profile preferences', () => {
    expect(preferencesConverter.toFirestore(preferences)).toEqual(preferences);
  });

  it('reads persisted density', () => {
    const result = preferencesConverter.fromFirestore({ data: () => preferences } as never, {} as never);
    expect(result.density).toBe('compact');
  });
});
