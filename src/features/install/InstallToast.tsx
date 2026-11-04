import { useEffect } from 'react';
import { fr } from '@/i18n/fr';

type InstallToastProps = { onDismiss: () => void };

export function InstallToast({ onDismiss }: InstallToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 4500);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return <div aria-live="polite" className="toast install-toast surface-raised" role="status">{fr.install.installed}</div>;
}
