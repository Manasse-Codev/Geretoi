import { useId } from 'react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const titleId = useId();
  return (
    <section className="empty-state" aria-labelledby={titleId}>
      {icon && <div aria-hidden="true" className="empty-state__icon">{icon}</div>}
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}
