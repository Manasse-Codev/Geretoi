import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Clock3, Moon, Settings, Sun } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BottomNav, type BottomNavTab } from '@/components/BottomNav';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { RetryNotice } from '@/components/RetryNotice';
import { SyncIndicator } from '@/components/SyncIndicator';
import { InstallCard } from '@/features/install/InstallCard';
import { InstallGuideSheet } from '@/features/install/InstallGuideSheet';
import { InstallPromptProvider } from '@/features/install/InstallPromptProvider';
import { useInstallPrompt } from '@/features/install/useInstallPrompt';
import { InstallToast } from '@/features/install/InstallToast';
import { usePreferences } from '@/features/settings/usePreferences';
import { useAuth } from '@/features/auth/useAuth';
import { preloadPrimaryRoutes } from '@/app/router';
import { fr } from '@/i18n/fr';
import { hasPendingUnsavedChanges } from '@/lib/unsavedChanges';

export function AppLayout() {
  return <InstallPromptProvider><AppLayoutContent /></InstallPromptProvider>;
}

function AppLayoutContent() {
  const location = useLocation(); const navigate = useNavigate(); const { user } = useAuth(); const { preferences, update, error: preferencesError, retry: retryPreferences, loading: preferencesLoading } = usePreferences();
  const install = useInstallPrompt();
  const isTaskForm = location.pathname === '/new' || location.pathname.startsWith('/edit/');
  const isSettingsPage = location.pathname === '/settings';
  const prefersReducedMotion = useReducedMotion() ?? false;
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(location.pathname);
  const [pulseKey, setPulseKey] = useState(0);
  const [isEditingText, setIsEditingText] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.timeFormat = preferences.timeFormat;
    document.documentElement.dataset.density = preferences.density;
  }, [preferences.density, preferences.theme, preferences.timeFormat]);
  useEffect(() => {
    const onTaskCreated = () => setPulseKey((value) => value + 1);
    window.addEventListener('dayflow:task-created', onTaskCreated);
    return () => window.removeEventListener('dayflow:task-created', onTaskCreated);
  }, []);
  useEffect(() => {
    const isEditingElement = (element: Element | null) => element instanceof HTMLElement &&
      element.matches('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]), textarea, select, [contenteditable="true"]');
    const hasTextDraft = () => [...document.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="search"], input[type="email"], textarea')]
      .some((input) => input.value.trim().length > 0);
    const updateEditingState = (event: Event) => {
      if (event.type === 'focusin') setIsEditingText(event.target instanceof Element && isEditingElement(event.target));
      else if (event.type === 'input') setIsEditingText(true);
      else if (event.type === 'focusout') window.setTimeout(() => {
        const active = document.activeElement;
        setIsEditingText(isEditingElement(active) || hasTextDraft());
      }, 0);
    };
    document.addEventListener('focusin', updateEditingState);
    document.addEventListener('focusout', updateEditingState);
    document.addEventListener('input', updateEditingState);
    return () => {
      document.removeEventListener('focusin', updateEditingState);
      document.removeEventListener('focusout', updateEditingState);
      document.removeEventListener('input', updateEditingState);
    };
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasDraft = [...document.querySelectorAll<HTMLInputElement>('input[type="text"], input[type="search"], input[type="email"], textarea')]
        .some((input) => input.value.trim().length > 0);
      setIsEditingText(hasDraft);
    }, 360);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);
  useEffect(() => {
    if ((previousPath.current === '/new' || previousPath.current.startsWith('/edit/')) && location.pathname !== '/new' && !location.pathname.startsWith('/edit/')) addButtonRef.current?.focus();
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
    {!isTaskForm && !isSettingsPage && install.showCard && !isEditingText && !hasPendingUnsavedChanges() && <InstallCard isIOS={install.isIOS} onInstall={install.requestInstall} onLater={install.dismissCard} visible />}
    <InstallGuideSheet isIOS={install.isIOS} isSafari={install.isSafari} onClose={install.closeGuide} open={install.guideOpen} />
    {install.successToast && <InstallToast onDismiss={install.dismissToast} />}
  </div>;
}
