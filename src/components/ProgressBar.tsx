import type { CSSProperties } from 'react';

export interface ProgressBarProps {
  value: number;
  label: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const progress = Math.min(100, Math.max(0, value));
  const style = { '--progress': progress / 100 } as CSSProperties;

  return (
    <div
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className="progress-bar"
      role="progressbar"
    >
      <span className="progress-bar__fill" style={style} />
    </div>
  );
}
