import { useMemo } from 'react';
import { BarChart3, CalendarDays, ListChecks, Plus } from 'lucide-react';
import { IconButton } from '@/components/IconButton';
import { fr } from '@/i18n/fr';

export type BottomNavTab = 'today' | 'planner' | 'lists' | 'stats';

export interface BottomNavProps {
  active: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
  onAdd: () => void;
}

export function BottomNav({ active, onNavigate, onAdd }: BottomNavProps) {
  const tabs = useMemo(() => [
    { id: 'today' as const, label: fr.navigation.today, icon: <CalendarDays size={18} /> },
    { id: 'planner' as const, label: fr.navigation.planner, icon: <CalendarDays size={18} /> },
    { id: 'lists' as const, label: fr.navigation.lists, icon: <ListChecks size={18} /> },
    { id: 'stats' as const, label: fr.navigation.stats, icon: <BarChart3 size={18} /> },
  ], []);
  const activeIndex = tabs.findIndex((tab) => tab.id === active);

  return (
    <nav aria-label={fr.navigation.label} className="bottom-nav surface-raised">
      <div className="bottom-nav__tabs">
        <span
          aria-hidden="true"
          className="bottom-nav__indicator"
          style={{ transform: `translateX(${Math.max(0, activeIndex) * 100}%)` }}
        />
        {tabs.map((tab) => (
          <button
            aria-current={active === tab.id ? 'page' : undefined}
            className="bottom-nav__tab focus-ring"
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            type="button"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <IconButton
        aria-label={fr.design.bottomNav.add}
        className="bottom-nav__add"
        icon={<Plus aria-hidden="true" size={22} />}
        onClick={onAdd}
      ><span className="sr-only">{fr.design.bottomNav.add}</span></IconButton>
    </nav>
  );
}
