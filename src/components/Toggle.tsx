import type { ButtonHTMLAttributes } from 'react';
import { Check, Minus } from 'lucide-react';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'aria-label'> {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Toggle({ checked, label, onCheckedChange, className = '', ...props }: ToggleProps) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={`toggle focus-ring ${className}`.trim()}
      onClick={() => onCheckedChange(!checked)}
    >
      <span className="toggle__track" aria-hidden="true">
        <span className="toggle__thumb">
          {checked ? <Check size={13} strokeWidth={3} /> : <Minus size={13} strokeWidth={3} />}
        </span>
      </span>
    </button>
  );
}
