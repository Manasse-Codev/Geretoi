import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock3, Moon, Settings, Sun } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BottomNav, type BottomNavTab } from '@/components/BottomNav';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { RetryNotice } from '@/components/RetryNotice';
import { SyncIndicator } from '@/components/SyncIndicator';
import { usePreferences } from '@/features/settings/usePreferences';
import { useAuth } from '@/features/auth/useAuth';
import { preloadPrimaryRoutes } from '@/app/router';
import { fr } from '@/i18n/fr';

export function AppLayout() {
  const location = useLocation(); const navigate = useNavigate(); const { user } = useAuth(); const { preferences, update, error: preferencesError, retry: retryPreferences, loading: preferencesLoading } = usePreferences();
  const isTaskForm = location.pathname === '/new';
  const prefersReducedMotion = useReducedMotion() ?? false;
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(location.pathname);
  const [pulseKey, setPulseKey] = useState(0);
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.timeFormat = preferences.timeFormat;
  }, [preferences.theme, preferences.timeFormat]);
  useEffect(() => {
    const onTaskCreated = () => setPulseKey((value) => value + 1);
    window.addEventListener('dayflow:task-created', onTaskCreated);
    return () => window.removeEventListener('dayflow:task-created', onTaskCreated);
  }, []);
  useEffect(() => {
    if (previousPath.current === '/new' && location.pathname !== '/new') addButtonRef.current?.focus();
    previousPath.current = location.pathname;
  }, [location.pathname]);
  useEffect(() => {
    if (!user) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string; downlink?: number } }).connection;
    if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g' || (connection?.downlink !== undefined && connection.downlink < 0.5)) return;
    const hasIdleCallback = 'requestIdleCallback' in window;
    const idle = hasIdleCallback
      ? window.requestIdleCallback(() => { void preloadPrimaryRoutes(); })
      : window.setTimeout(() => { void preloadPrimaryRoutes(); }, 1200);
    return () => {
      if (hasIdleCallback) window.cancelIdleCallback?.(idle as number);
      else window.clearTimeout(idle as number);
    };
  }, [user]);
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
    <AnimatePresence initial={false} mode="wait">
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="page-content"
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        key={location.pathname}
        transition={prefersReducedMotion ? { duration: 0.12 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      ><Outlet /></motion.main>
    </AnimatePresence>
    {!isTaskForm && <BottomNav active={active} addButtonRef={addButtonRef} onAdd={() => navigate('/new')} onNavigate={(tab) => navigate(tab === 'today' ? '/' : `/${tab}`)} pulseKey={pulseKey} />}
  </div>;
}
