import { Button } from '@/components/Button';
import { fr } from '@/i18n/fr';

type PwaUpdateBannerProps = {
  onUpdate: () => void;
  onDismiss: () => void;
};

export function PwaUpdateBanner({ onUpdate, onDismiss }: PwaUpdateBannerProps) {
  return (
    <aside aria-label={fr.pwa.updateAvailable} className="pwa-update" role="status">
      <span>{fr.pwa.updateAvailable}</span>
      <div className="pwa-update__actions">
        <Button onClick={onDismiss} variant="ghost">{fr.pwa.updateLater}</Button>
        <Button onClick={onUpdate} variant="primary">{fr.pwa.updateNow}</Button>
      </div>
    </aside>
  );
}
