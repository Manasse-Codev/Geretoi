import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  'aria-label': string;
  icon: ReactNode;
  children?: ReactNode;
}

export function IconButton({ icon, children, className = '', type = 'button', ...props }: IconButtonProps) {
  return (
    <button {...props} className={`icon-button surface-raised focus-ring ${className}`.trim()} type={type}>
      <span aria-hidden="true">{icon}</span>
      {children}
    </button>
  );
}
