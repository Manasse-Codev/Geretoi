import { NavLink, Outlet } from 'react-router-dom';
import { fr } from '@/i18n/fr';

const tabs = [
  { to: '/', label: fr.navigation.today },
  { to: '/planner', label: fr.navigation.planner },
  { to: '/lists', label: fr.navigation.lists },
  { to: '/stats', label: fr.navigation.stats },
];

export function AppLayout() {
  return (
    <div className="app-shell">
      <main className="page-content"><Outlet /></main>
      <nav className="floating-nav" aria-label={fr.navigation.label}>
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.to === '/'}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
