import type { MouseEventHandler, ReactNode } from 'react';
import { Check } from 'lucide-react';

interface ChipBaseProps {
  children: ReactNode;
  selected?: boolean;
  className?: string;
  id?: string;
}

export type ChipProps = ChipBaseProps & {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Chip(props: ChipProps) {
  const { children, selected = false, className = '', id } = props;
  const classes = `chip surface-raised ${className}`.trim();

  if (props.onClick) {
    return (
      <button
        id={id}
        disabled={props.disabled}
        className={`${classes} chip--action`}
        type={props.type ?? 'button'}
        aria-pressed={selected}
        onClick={props.onClick}
      >
        {selected && <Check aria-hidden="true" size={15} />}
        {children}
      </button>
    );
  }

  return <span className={classes} id={id}>{children}</span>;
}
