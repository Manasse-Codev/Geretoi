export interface ProgressRingProps {
  value: number;
  label: string;
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({ value, label, centerLabel, size = 88, strokeWidth = 8 }: ProgressRingProps) {
  const progress = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress / 100);
  const angle = ((progress / 100) * 360 - 90) * (Math.PI / 180);
  const center = size / 2;
  const dotRadius = radius;
  const dotX = center + dotRadius * Math.cos(angle);
  const dotY = center + dotRadius * Math.sin(angle);

  return (
    <svg
      aria-label={label}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round(progress)}
      className="progress-ring"
      height={size}
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
    >
      <circle cx={center} cy={center} fill="none" r={radius} stroke="var(--color-outline)" strokeWidth={strokeWidth} />
      <circle
        className="progress-ring__arc"
        cx={center}
        cy={center}
        fill="none"
        r={radius}
        stroke="var(--color-violet)"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        transform={`rotate(-90 ${center} ${center})`}
      />
      {progress > 0 && <circle cx={dotX} cy={dotY} fill="var(--color-card)" r={strokeWidth * 0.7} stroke="var(--color-violet)" strokeWidth="2" />}
      {centerLabel && <text aria-hidden="true" dominantBaseline="central" fill="currentColor" fontSize={Math.max(10, size * 0.22)} fontWeight="700" textAnchor="middle" x={center} y={center}>{centerLabel}</text>}
    </svg>
  );
}
