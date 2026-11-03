import type { ReactNode } from 'react';

export function Button({ children }: { children: ReactNode }) {
  return <button className="placeholder-button" type="button">{children}</button>;
}
