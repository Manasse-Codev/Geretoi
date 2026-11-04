import { describe, expect, it } from 'vitest';
import {
  deferInstall, detectInstallDevice, emptyInstallPreferences, installSnoozeDurationMs,
  installPreferencesKey, isInstallAvailable, isStandalone, readInstallPreferences,
  recordInstallDecline, recordInstallSuccess, recordInstallVisit, saveInstallPreferences,
  shouldShowInstallCard,
} from '@/features/install/installLogic';

describe('logique d’installation', () => {
  it('propose l’installation après la première tâche ou la deuxième visite', () => {
    const firstVisit = recordInstallVisit(emptyInstallPreferences);
    expect(shouldShowInstallCard(firstVisit, true, false, 100)).toBe(false);
    expect(shouldShowInstallCard({ ...firstVisit, taskCreated: true }, true, false, 100)).toBe(true);
    expect(shouldShowInstallCard(recordInstallVisit(firstVisit), true, false, 100)).toBe(true);
  });

  it('attend quatorze jours après Plus tard ou un refus', () => {
    const eligible = { ...recordInstallVisit(recordInstallVisit(emptyInstallPreferences)), dismissedUntil: 0 };
    const deferred = deferInstall(eligible, 1000);
    expect(deferred.dismissedUntil).toBe(1000 + installSnoozeDurationMs);
    expect(shouldShowInstallCard(deferred, true, false, 1000 + installSnoozeDurationMs - 1)).toBe(false);
    expect(shouldShowInstallCard(deferred, true, false, 1000 + installSnoozeDurationMs)).toBe(true);
    expect(shouldShowInstallCard(recordInstallDecline(eligible, 1000), true, false, 1000)).toBe(false);
  });

  it('cesse les propositions après trois refus et réinitialise le compteur après succès', () => {
    const one = recordInstallDecline(emptyInstallPreferences, 1);
    const two = recordInstallDecline(one, 2);
    const three = recordInstallDecline(two, 3);
    expect(three.consecutiveDeclines).toBe(3);
    expect(shouldShowInstallCard({ ...three, taskCreated: true, dismissedUntil: 0 }, true, false, 4)).toBe(false);
    expect(recordInstallSuccess(three)).toMatchObject({ installed: true, consecutiveDeclines: 0, dismissedUntil: 0 });
  });

  it('masque toute proposition quand l’application est déjà installée', () => {
    const eligible = { ...emptyInstallPreferences, visits: 2 };
    expect(shouldShowInstallCard(eligible, true, true)).toBe(false);
    expect(isStandalone(false, false, true)).toBe(true);
    expect(isStandalone(true, false, false)).toBe(true);
    expect(isStandalone(false, true, false)).toBe(true);
  });

  it('détecte iPhone, iPad et iPadOS tout en distinguant Safari', () => {
    expect(detectInstallDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile Safari/604.1', 'iPhone', 5)).toEqual({ isIOS: true, isSafari: true });
    expect(detectInstallDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15', 'MacIntel', 5)).toEqual({ isIOS: true, isSafari: true });
    expect(detectInstallDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) CriOS/120.0 Mobile Safari/604.1', 'iPhone', 5)).toEqual({ isIOS: true, isSafari: false });
    expect(detectInstallDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/605.1.15', 'MacIntel', 0)).toEqual({ isIOS: false, isSafari: false });
  });

  it('garde l’accès aux réglages après les refus et ne l’affiche que si une méthode existe', () => {
    expect(isInstallAvailable(false, true)).toBe(true);
    expect(isInstallAvailable(true, false)).toBe(true);
    expect(isInstallAvailable(false, false)).toBe(false);
  });

  it('mémorise qu’un navigateur a proposé l’installation sans stocker de donnée personnelle', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
    };
    const supported = { ...emptyInstallPreferences, promptSupported: true };
    saveInstallPreferences(storage, supported);
    expect(readInstallPreferences(storage)).toMatchObject({ promptSupported: true, installed: false });
    expect(values.get(installPreferencesKey)).not.toMatch(/email|uid|token/i);
  });
});
