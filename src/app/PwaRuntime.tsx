import { useEffect, useRef, useState } from 'react';
import { registerSW } from '@/lib/pwaRegistration';
import { App } from '@/app/App';
import { PwaUpdateBanner } from '@/components/PwaUpdateBanner';
import { fr } from '@/i18n/fr';
import { hasPendingUnsavedChanges } from '@/lib/unsavedChanges';

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

export function PwaRuntime() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<UpdateServiceWorker | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const update = registerSW({
      immediate: true,
      onNeedRefresh: () => setUpdateAvailable(true),
      onRegisteredSW: (scriptUrl, registration) => {
        if (!import.meta.env.DEV) return;
        if (!registration) {
          console.warn('[PWA] Service worker non enregistré.', scriptUrl);
          return;
        }
        console.info('[PWA] Service worker enregistré.', {
          scope: registration.scope,
          state: registration.active?.state ?? registration.installing?.state ?? registration.waiting?.state ?? 'inconnu',
        });
        void navigator.serviceWorker.ready.then((ready) => {
          console.info('[PWA] Service worker prêt.', { scope: ready.scope, state: ready.active?.state ?? 'inconnu' });
        }).catch((error: unknown) => console.warn('[PWA] Service worker non prêt.', error));
      },
      onRegisterError: (error) => {
        if (import.meta.env.DEV) console.error('[PWA] Échec de l’enregistrement du service worker.', error);
      },
    });
    setUpdateServiceWorker(() => update);
  }, []);

  return (
    <>
      <App />
      {updateAvailable && updateServiceWorker && (
        <PwaUpdateBanner
          onDismiss={() => setUpdateAvailable(false)}
          onUpdate={() => {
            if (hasPendingUnsavedChanges() && !window.confirm(fr.pwa.unsavedUpdate)) return false;
            void updateServiceWorker(true);
            return true;
          }}
        />
      )}
    </>
  );
}
