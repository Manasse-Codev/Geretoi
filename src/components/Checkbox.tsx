import type { ButtonHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'aria-label'> {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({ checked, label, onCheckedChange, className = '', ...props }: CheckboxProps) {
  return (
    <button
      {...props}
      type="button"
      role="checkbox"
      aria-label={label}
      aria-checked={checked}
      className={`round-control surface-inset focus-ring ${className}`.trim()}
      onClick={() => onCheckedChange(!checked)}
    >
      {checked && <Check aria-hidden="true" size={18} strokeWidth={3} />}
    </button>
  );
}
