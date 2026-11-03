import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { fr } from '@/i18n/fr';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  children,
  variant = 'secondary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const surface = variant === 'ghost' ? '' : 'surface-raised';

  return (
    <button
      {...props}
      className={`btn btn--${variant} ${surface} ${className}`.trim()}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <LoaderCircle aria-hidden="true" size={18} />}
      {children}
      {loading && <span className="sr-only">{fr.design.labels.loading}</span>}
    </button>
  );
}
