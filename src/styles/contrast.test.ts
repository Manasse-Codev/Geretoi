import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tokensCss = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function blockFor(selector: string): string {
  const start = tokensCss.indexOf(selector);
  const open = tokensCss.indexOf('{', start);
  const close = tokensCss.indexOf('}', open);
  if (start < 0 || open < 0 || close < 0) throw new Error(`Token block not found: ${selector}`);
  return tokensCss.slice(open + 1, close);
}

function readTokens(block: string): Record<string, string> {
  return Object.fromEntries(
    [...block.matchAll(/(--[\w-]+)\s*:\s*(#[\da-fA-F]{3,8})\s*;/g)].map((match) => [match[1] ?? '', match[2] ?? '']),
  );
}

function luminance(hex: string): number {
  const normalized = hex.slice(1);
  const channels = [0, 2, 4].map((index) => Number.parseInt(normalized.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const red = linear[0] ?? 0;
  const green = linear[1] ?? 0;
  const blue = linear[2] ?? 0;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const light = readTokens(blockFor(':root'));
const dark = readTokens(blockFor(":root[data-theme='dark']"));
const themes = [
  { name: 'clair', tokens: light },
  { name: 'sombre', tokens: dark },
];

describe('contraste des tokens réellement déclarés', () => {
  it.each(themes)('$name : texte principal et secondaire sur le fond ≥ 4.5:1', ({ tokens }) => {
    expect(contrast(tokens['--color-text'] ?? '', tokens['--color-background'] ?? '')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens['--color-text-secondary'] ?? '', tokens['--color-background'] ?? '')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens['--color-orange-text'] ?? '', tokens['--color-background'] ?? '')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(themes)('$name : texte de premier plan sur les accents ≥ 4.5:1', ({ tokens }) => {
    expect(contrast(tokens['--color-on-violet'] ?? '', tokens['--color-violet'] ?? '')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(tokens['--color-on-orange'] ?? '', tokens['--color-orange'] ?? '')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(themes)('$name : accents et bordure sur leurs surfaces ≥ 3:1', ({ tokens }) => {
    const background = tokens['--color-background'] ?? '';
    const card = tokens['--color-card'] ?? '';
    const outline = tokens['--color-outline'] ?? '';
    const focus = tokens['--color-focus'] ?? '';
    expect(contrast(tokens['--color-orange'] ?? '', background)).toBeGreaterThanOrEqual(3);
    expect(contrast(tokens['--color-violet'] ?? '', background)).toBeGreaterThanOrEqual(3);
    expect(contrast(outline, card)).toBeGreaterThanOrEqual(3);
    expect(contrast(outline, background)).toBeGreaterThanOrEqual(3);
    expect(contrast(focus, background)).toBeGreaterThanOrEqual(3);
    expect(contrast(focus, card)).toBeGreaterThanOrEqual(3);
  });

  it('clair : le rôle de texte orange respecte 4.5:1', () => {
    expect(contrast(light['--color-orange-text'] ?? '', light['--color-background'] ?? '')).toBeGreaterThanOrEqual(4.5);
  });
});
