import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type VercelHeader = { key: string; value: string };
type VercelConfig = { headers: Array<{ headers: VercelHeader[] }> };

const vercelPath = resolve(process.cwd(), 'vercel.json');
const cloudflarePath = resolve(process.cwd(), 'public/_headers');

describe('en-têtes de sécurité', () => {
  it('utilise la même CSP en mode rapport sur Vercel et Cloudflare Pages', () => {
    const vercel = JSON.parse(readFileSync(vercelPath, 'utf8')) as VercelConfig;
    const cloudflare = readFileSync(cloudflarePath, 'utf8');
    const vercelHeaders = vercel.headers[0]?.headers ?? [];
    const vercelCsp = vercelHeaders.find((header) => header.key === 'Content-Security-Policy-Report-Only');
    const cloudflareCsp = cloudflare.match(/^\s*Content-Security-Policy-Report-Only:\s*(.+)$/m)?.[1];

    expect(vercelCsp).toBeDefined();
    expect(cloudflareCsp).toBeDefined();
    expect(vercelCsp?.value).toBe(cloudflareCsp);
    expect(vercelHeaders.some((header) => header.key === 'Content-Security-Policy')).toBe(false);
    expect(cloudflare).not.toMatch(/^\s*Content-Security-Policy:/m);
  });

  it('conserve les protections de type, cadrage, référent, permissions et transport', () => {
    const vercel = JSON.parse(readFileSync(vercelPath, 'utf8')) as VercelConfig;
    const cloudflare = readFileSync(cloudflarePath, 'utf8');
    const vercelHeaders = vercel.headers[0]?.headers ?? [];
    const required = [
      ['X-Content-Type-Options', 'nosniff'],
      ['X-Frame-Options', 'DENY'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()'],
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
    ];

    for (const [key, value] of required) {
      expect(vercelHeaders.find((header) => header.key === key)?.value).toBe(value);
      expect(cloudflare).toContain(`${key}: ${value}`);
    }
  });
});
