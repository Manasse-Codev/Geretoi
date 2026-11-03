import type { ReactNode } from 'react';
import { fr } from '@/i18n/fr';

export function Sheet({ children }: { children: ReactNode }) {
  return <section aria-label={fr.placeholders.sheet}>{children}</section>;
}
