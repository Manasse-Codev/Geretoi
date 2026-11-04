import { useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BarChart3, CalendarDays, ListChecks, Plus } from 'lucide-react';
import { fr } from '@/i18n/fr';

export type BottomNavTab = 'today' | 'planner' | 'lists' | 'stats';

export interface BottomNavProps {
  active: BottomNavTab;
  onNavigate: (tab: BottomNavTab) => void;
  onAdd: () => void;
  addButtonRef?: RefObject<HTMLButtonElement | null>;
  pulseKey?: number;
}

const entranceKey = 'dayflow:add-button-entered';

export function BottomNav({ active, onNavigate, onAdd, addButtonRef, pulseKey = 0 }: BottomNavProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const tabs = useMemo(() => [
    { id: 'today' as const, label: fr.navigation.today, icon: <CalendarDays size={18} /> },
    { id: 'planner' as const, label: fr.navigation.planner, icon: <CalendarDays size={18} /> },
    { id: 'lists' as const, label: fr.navigation.lists, icon: <ListChecks size={18} /> },
    { id: 'stats' as const, label: fr.navigation.stats, icon: <BarChart3 size={18} /> },
  ], []);
  const tabColumns = [1, 2, 4, 5];
  const [alreadyEntered] = useState(() => {
    try { return window.sessionStorage.getItem(entranceKey) === 'true'; } catch { return false; }
  });
  const [entranceDone, setEntranceDone] = useState(alreadyEntered && !prefersReducedMotion);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState === 'visible');
  const [engaged, setEngaged] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);
  const lastPulse = useRef(0);
  const openingTimer = useRef<number | null>(null);

  useEffect(() => {
    if (alreadyEntered && !prefersReducedMotion) setEntranceDone(true);
  }, [alreadyEntered, prefersReducedMotion]);

  useEffect(() => {
    const onVisibilityChange = () => setPageVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    let previousY = window.scrollY;
    let stopTimer: number | undefined;
    const onScroll = () => {
      const nextY = window.scrollY;
      if (nextY > previousY + 1) setScrollingDown(true);
      else if (nextY < previousY - 1) setScrollingDown(false);
      previousY = nextY;
      setScrolling(true);
      window.clearTimeout(stopTimer);
      stopTimer = window.setTimeout(() => { setScrolling(false); setScrollingDown(false); }, 180);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); window.clearTimeout(stopTimer); };
  }, []);

  useEffect(() => {
    if (pulseKey === lastPulse.current) return;
    lastPulse.current = pulseKey;
    if (prefersReducedMotion) return;
    setPulseActive(true);
    const timer = window.setTimeout(() => setPulseActive(false), 460);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, pulseKey]);

  useEffect(() => () => { if (openingTimer.current !== null) window.clearTimeout(openingTimer.current); }, []);

  const floating = entranceDone && pageVisible && !prefersReducedMotion && !engaged && !pressed && !opening && !scrolling && !pulseActive;
  const iconRotation = prefersReducedMotion ? 0 : opening ? 45 : engaged ? 90 : 0;

  function openTaskForm() {
    if (opening || openingTimer.current !== null) return;
    setEngaged(false);
    setOpening(true);
    openingTimer.current = window.setTimeout(() => {
      openingTimer.current = null;
      onAdd();
    }, prefersReducedMotion ? 0 : 200);
  }

  return (
    <nav aria-label={fr.navigation.label} className="bottom-nav surface-raised">
      <div className="bottom-nav__tabs">
        <span
          aria-hidden="true"
          className="bottom-nav__indicator"
          style={{ transform: `translateX(${((tabColumns[tabs.findIndex((tab) => tab.id === active)] ?? 1) - 1) * 100}%)` }}
        />
        {tabs.map((tab, index) => (
          <button
            aria-current={active === tab.id ? 'page' : undefined}
            className="bottom-nav__tab focus-ring"
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            style={{ gridColumn: tabColumns[index] }}
            type="button"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <span className="bottom-nav__add-wrap">
        <span aria-hidden="true" className="bottom-nav__add-shadow" data-engaged={engaged} data-floating={floating} data-pressed={pressed} />
        <button
          aria-label={fr.design.bottomNav.add}
          className={`bottom-nav__add focus-ring${opening ? ' bottom-nav__add--opening' : ''}${scrollingDown ? ' bottom-nav__add--scrolling-down' : ''}${prefersReducedMotion ? ' bottom-nav__add--reduced' : ''}`}
          data-floating={floating}
          data-engaged={engaged}
          data-entrance-done={entranceDone}
          data-page-visible={pageVisible}
          data-prefers-reduced={prefersReducedMotion}
          data-pressed={pressed}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }}
          onFocus={() => setEngaged(true)}
          onPointerDown={() => { setPressed(true); setEngaged(true); }}
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => { setPressed(false); setEngaged(false); }}
          onPointerUp={() => setPressed(false)}
          onClick={openTaskForm}
          ref={addButtonRef}
          type="button"
        >
          <AnimatePresence>
            {pulseActive && !prefersReducedMotion && <motion.span
              animate={{ opacity: 0, scale: 1.6 }}
              aria-hidden="true"
              className="bottom-nav__add-pulse-ring"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0.4, scale: 1 }}
              key={pulseKey}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />}
          </AnimatePresence>
          <motion.span
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            aria-hidden="true"
            className="bottom-nav__add-face"
            data-fab-face
            data-floating={floating}
            data-pulse={pulseActive && !prefersReducedMotion}
            initial={prefersReducedMotion ? { opacity: 0 } : alreadyEntered ? false : { opacity: 1, scale: 0.6, y: 16 }}
            onAnimationComplete={() => {
              if (entranceDone) return;
              if (!prefersReducedMotion) {
                try { window.sessionStorage.setItem(entranceKey, 'true'); } catch { /* session storage may be unavailable */ }
              }
              setEntranceDone(true);
            }}
            transition={prefersReducedMotion ? { duration: 0.12 } : alreadyEntered ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 24, delay: 0.12 }}
          >
            <span className="bottom-nav__add-raise">
              <motion.span
                animate={{ scale: prefersReducedMotion ? 1 : pressed ? 0.94 : scrollingDown ? 0.88 : 1, opacity: prefersReducedMotion && (pressed || opening) ? 0.82 : 1 }}
                className="bottom-nav__add-surface"
                transition={prefersReducedMotion ? { duration: 0.12, ease: 'linear' } : pressed || scrollingDown ? { type: 'tween', duration: pressed ? 0.12 : 0.15, ease: 'easeInOut' } : { type: 'spring', stiffness: 300, damping: 20 }}
              >
                <motion.span
                  animate={{ rotate: iconRotation, opacity: prefersReducedMotion && (pressed || opening) ? 0.82 : 1 }}
                  className="bottom-nav__add-icon"
                  transition={prefersReducedMotion ? { duration: 0.12 } : { duration: opening ? 0.2 : 0.18, ease: 'easeInOut' }}
                >
                  <Plus aria-hidden="true" size={24} strokeWidth={2.5} />
                </motion.span>
              </motion.span>
            </span>
          </motion.span>
        </button>
      </span>
    </nav>
  );
}
