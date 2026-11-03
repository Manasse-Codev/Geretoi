import type { HTMLAttributes, ReactNode } from 'react';

export interface NumberBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function NumberBadge({ children, className = '', ...props }: NumberBadgeProps) {
  return <span {...props} className={`number-badge ${className}`.trim()}>{children}</span>;
}
