import { describe, expect, it } from 'vitest';
import { fr } from './fr';

const forbiddenVisibleText = /firebase|firestore|émulateur|schéma|règles?\s+de\s+sécurité|non\s+fourni|indisponible/i;
const justifiedExceptions: readonly { path: string; reason: string }[] = [];

function collectStrings(value: unknown, path = 'fr'): Array<{ path: string; text: string }> {
  if (typeof value === 'string') return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
}

describe('textes français affichables en production', () => {
  it('ne révèlent pas de détails techniques', () => {
    const exceptions = new Set(justifiedExceptions.map(({ path }) => path));
    const violations = collectStrings(fr).filter(({ path, text }) => forbiddenVisibleText.test(text) && !exceptions.has(path));
    expect(violations, JSON.stringify(justifiedExceptions)).toEqual([]);
  });
});
