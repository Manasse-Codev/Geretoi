import { Card } from '@/components/Card';

interface StatsMetricCardProps {
  label: string;
  value: string;
  unit?: string;
  description: string;
}

export function StatsMetricCard({ label, value, unit, description }: StatsMetricCardProps) {
  const accessibleValue = [value, unit].filter(Boolean).join(' ');

  return <Card aria-label={`${label} : ${accessibleValue}`} className="stats-ring-card" role="group">
    <strong className="stats-value" data-stats-value="true">
      <span className="stats-value__number">{value}</span>
      {unit && <span className="stats-value__unit">{unit}</span>}
    </strong>
    <h2>{label}</h2>
    <p>{description}</p>
  </Card>;
}
