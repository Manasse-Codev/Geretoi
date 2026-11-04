import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { InstallPromptContext } from '@/features/install/installContext';
import {
  deferInstall, detectInstallDevice, emptyInstallPreferences, isInstallAvailable, isStandalone,
  readInstallPreferences, recordInstallDecline, recordInstallSuccess, recordInstallVisit,
  recordTaskCreated, saveInstallPreferences, shouldShowInstallCard,
} from '@/features/install/installLogic';
import type { InstallPreferences } from '@/features/install/installLogic';

interface InstallChoiceEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function readStandaloneMode() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const standaloneNavigator = navigator as Navigator & { standalone?: boolean };
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  return isStandalone(displayModeStandalone, standaloneNavigator.standalone === true, false);
}

function readPreferences(): InstallPreferences {
  if (typeof window === 'undefined') return { ...emptyInstallPreferences };
  try { return readInstallPreferences(window.localStorage); }
  catch { return { ...emptyInstallPreferences }; }
}

export function InstallPromptProvider({ children }: PropsWithChildren) {
  const device = useMemo(() => typeof navigator === 'undefined'
    ? { isIOS: false, isSafari: false }
    : detectInstallDevice(navigator.userAgent, navigator.platform, navigator.maxTouchPoints), []);
  const [preferences, setPreferences] = useState(readPreferences);
  const preferencesRef = useRef(preferences);
  const [promptEvent, setPromptEvent] = useState<InstallChoiceEvent | null>(null);
  const [installPromptSupported, setInstallPromptSupported] = useState(false);
  const [standalone, setStandalone] = useState(readStandaloneMode);
  const [guideOpen, setGuideOpen] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const countedVisit = useRef(false);
  const successShown = useRef(false);

  const commitPreferences = useCallback((next: InstallPreferences) => {
    preferencesRef.current = next;
    setPreferences(next);
    if (typeof window !== 'undefined') {
      try { saveInstallPreferences(window.localStorage, next); }
      catch { /* Keep the current session functional when storage is unavailable. */ }
    }
  }, []);

  const markInstalled = useCallback(() => {
    commitPreferences(recordInstallSuccess(preferencesRef.current));
    if (!successShown.current) {
      successShown.current = true;
      setSuccessToast(true);
    }
  }, [commitPreferences]);

  useEffect(() => {
    if (!countedVisit.current) {
      countedVisit.current = true;
      commitPreferences(recordInstallVisit(preferencesRef.current));
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptSupported(true);
      setPromptEvent(event as InstallChoiceEvent);
      commitPreferences({ ...preferencesRef.current, promptSupported: true });
    };
    const onAppInstalled = () => markInstalled();
    const onTaskCreated = () => commitPreferences(recordTaskCreated(preferencesRef.current));
    const onDisplayModeChange = (event: MediaQueryListEvent) => {
      setStandalone(event.matches);
      if (event.matches) markInstalled();
    };
    const displayMode = window.matchMedia?.('(display-mode: standalone)');

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('dayflow:task-created', onTaskCreated);
    displayMode?.addEventListener('change', onDisplayModeChange);
    if (readStandaloneMode()) markInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('dayflow:task-created', onTaskCreated);
      displayMode?.removeEventListener('change', onDisplayModeChange);
    };
  }, [commitPreferences, markInstalled]);

  const isInstalled = standalone || preferences.installed;
  const available = isInstallAvailable(device.isIOS, preferences.promptSupported || installPromptSupported || promptEvent !== null);
  const showCard = shouldShowInstallCard(preferences, available, isInstalled);

  const requestInstall = useCallback(() => {
    if (device.isIOS || !promptEvent) {
      setGuideOpen(true);
      return;
    }
    const currentPrompt = promptEvent;
    setPromptEvent(null);
    void (async () => {
      try {
        await currentPrompt.prompt();
        const choice = await currentPrompt.userChoice;
        if (choice.outcome === 'accepted') markInstalled();
        else commitPreferences(recordInstallDecline(preferencesRef.current));
      } catch {
        setGuideOpen(true);
      }
    })();
  }, [commitPreferences, device.isIOS, markInstalled, promptEvent]);

  const dismissCard = useCallback(() => {
    commitPreferences(deferInstall(preferencesRef.current));
  }, [commitPreferences]);
  const closeGuide = useCallback(() => setGuideOpen(false), []);
  const dismissToast = useCallback(() => setSuccessToast(false), []);

  const value = useMemo(() => ({
    isIOS: device.isIOS,
    isSafari: device.isSafari,
    isInstalled,
    isInstallAvailable: available && !isInstalled,
    showCard,
    guideOpen,
    successToast,
    requestInstall,
    dismissCard,
    closeGuide,
    dismissToast,
  }), [available, closeGuide, device.isIOS, device.isSafari, dismissCard, dismissToast, guideOpen, isInstalled, requestInstall, showCard, successToast]);

  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>;
}
