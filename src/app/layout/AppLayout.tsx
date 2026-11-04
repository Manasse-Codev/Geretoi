import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock3, Moon, Settings, Sun } from 'lucide-react';
import { BottomNav, type BottomNavTab } from '@/components/BottomNav';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { RetryNotice } from '@/components/RetryNotice';
import { SyncIndicator } from '@/components/SyncIndicator';
import { usePreferences } from '@/features/settings/usePreferences';
import { fr } from '@/i18n/fr';

export function AppLayout() {
  const location = useLocation(); const navigate = useNavigate(); const { preferences, update, error: preferencesError, retry: retryPreferences, loading: preferencesLoading } = usePreferences();
  const isTaskForm = location.pathname === '/new';
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.timeFormat = preferences.timeFormat;
  }, [preferences.theme, preferences.timeFormat]);
  const active: BottomNavTab = location.pathname.startsWith('/planner') ? 'planner' : location.pathname.startsWith('/lists') ? 'lists' : location.pathname.startsWith('/stats') || location.pathname.startsWith('/history') || location.pathname.startsWith('/trash') ? 'stats' : 'today';
  const toggleTheme = () => void update({ theme: preferences.theme === 'dark' ? 'light' : 'dark' }).catch(() => undefined);

  return <div className="app-shell">
    {!isTaskForm && <header className="app-topbar">
      <Link aria-label="DayFlow, accueil" className="app-brand" to="/"><Logo size="sm" /></Link>
      <SyncIndicator />
      <nav aria-label="Liens secondaires" className="app-topbar__actions">
        <Button aria-label={fr.pages.history} onClick={() => navigate('/history')}><Clock3 size={18} /><span className="desktop-label">{fr.pages.history}</span></Button>
        <Button aria-label={preferences.theme === 'dark' ? 'Activer le thème clair' : 'Activer le thème sombre'} onClick={toggleTheme}><span className="theme-toggle__icon">{preferences.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span><span className="desktop-label">Thème</span></Button>
        <Button aria-label={fr.pages.settings} onClick={() => navigate('/settings')}><Settings size={18} /><span className="desktop-label">{fr.pages.settings}</span></Button>
      </nav>
    </header>}
    {isTaskForm && <div className="app-sync--form"><SyncIndicator /></div>}
    {preferencesError && <div className="page-content"><RetryNotice loading={preferencesLoading} message={fr.settingsPage.saveError} onRetry={retryPreferences} /></div>}
    <main className="page-content"><Outlet /></main>
    {!isTaskForm && <BottomNav active={active} onAdd={() => navigate('/new')} onNavigate={(tab) => navigate(tab === 'today' ? '/' : `/${tab}`)} />}
  </div>;
}
