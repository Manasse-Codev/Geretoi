export const installPreferencesKey = 'dayflow.install.preferences.v1';
export const installSnoozeDurationMs = 14 * 24 * 60 * 60 * 1000;

export interface InstallPreferences {
  visits: number;
  taskCreated: boolean;
  dismissedUntil: number;
  consecutiveDeclines: number;
  installed: boolean;
  promptSupported: boolean;
}

export interface InstallDeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
}

export const emptyInstallPreferences: InstallPreferences = {
  visits: 0,
  taskCreated: false,
  dismissedUntil: 0,
  consecutiveDeclines: 0,
  installed: false,
  promptSupported: false,
};

export function readInstallPreferences(storage: Pick<Storage, 'getItem'>): InstallPreferences {
  try {
    const serialized = storage.getItem(installPreferencesKey);
    if (!serialized) return { ...emptyInstallPreferences };
    const stored: unknown = JSON.parse(serialized);
    if (!stored || typeof stored !== 'object') return { ...emptyInstallPreferences };
    const record = stored as Partial<Record<keyof InstallPreferences, unknown>>;
    return {
      visits: typeof record.visits === 'number' && Number.isFinite(record.visits) ? Math.max(0, Math.min(2, record.visits)) : 0,
      taskCreated: record.taskCreated === true,
      dismissedUntil: typeof record.dismissedUntil === 'number' && Number.isFinite(record.dismissedUntil) ? Math.max(0, record.dismissedUntil) : 0,
      consecutiveDeclines: typeof record.consecutiveDeclines === 'number' && Number.isFinite(record.consecutiveDeclines) ? Math.max(0, Math.min(3, record.consecutiveDeclines)) : 0,
      installed: record.installed === true,
      promptSupported: record.promptSupported === true,
    };
  } catch {
    return { ...emptyInstallPreferences };
  }
}

export function saveInstallPreferences(storage: Pick<Storage, 'setItem'>, preferences: InstallPreferences): void {
  try {
    storage.setItem(installPreferencesKey, JSON.stringify(preferences));
  } catch {
    // Installation remains available for the current session if local storage is unavailable.
  }
}

export function recordInstallVisit(preferences: InstallPreferences): InstallPreferences {
  return { ...preferences, visits: Math.min(2, preferences.visits + 1) };
}

export function recordTaskCreated(preferences: InstallPreferences): InstallPreferences {
  return { ...preferences, taskCreated: true };
}

export function deferInstall(preferences: InstallPreferences, now = Date.now()): InstallPreferences {
  return { ...preferences, dismissedUntil: now + installSnoozeDurationMs };
}

export function recordInstallDecline(preferences: InstallPreferences, now = Date.now()): InstallPreferences {
  return {
    ...preferences,
    consecutiveDeclines: Math.min(3, preferences.consecutiveDeclines + 1),
    dismissedUntil: now + installSnoozeDurationMs,
  };
}

export function recordInstallSuccess(preferences: InstallPreferences): InstallPreferences {
  return { ...preferences, installed: true, consecutiveDeclines: 0, dismissedUntil: 0 };
}

export function detectInstallDevice(userAgent: string, platform: string, maxTouchPoints: number): InstallDeviceInfo {
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  const isOtherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\//i.test(userAgent);
  return { isIOS, isSafari: isIOS && /Safari/i.test(userAgent) && !isOtherIOSBrowser };
}

export function isStandalone(displayModeStandalone: boolean, navigatorStandalone: boolean, installedEventSeen: boolean): boolean {
  return displayModeStandalone || navigatorStandalone || installedEventSeen;
}

export function isInstallAvailable(isIOS: boolean, promptAvailable: boolean): boolean {
  return isIOS || promptAvailable;
}

export function shouldShowInstallCard(
  preferences: InstallPreferences,
  installAvailable: boolean,
  installed: boolean,
  now = Date.now(),
): boolean {
  return installAvailable && !installed && preferences.consecutiveDeclines < 3 &&
    (preferences.taskCreated || preferences.visits >= 2) && preferences.dismissedUntil <= now;
}
