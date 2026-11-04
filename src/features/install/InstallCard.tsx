import { useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { fr } from '@/i18n/fr';

type InstallCardProps = {
  visible: boolean;
  isIOS: boolean;
  onInstall: () => void;
  onLater: () => void;
};

export function InstallCard({ visible, isIOS, onInstall, onLater }: InstallCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const titleId = useId();
  return <AnimatePresence initial={false}>
    {visible && <motion.aside
      animate={{ opacity: 1, y: 0 }}
      aria-labelledby={titleId}
      aria-live="polite"
      className="install-card surface-raised"
      data-testid="install-card"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
      role="region"
      transition={{ duration: reducedMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileTap={reducedMotion ? { opacity: 0.86 } : { scale: 0.98 }}
    >
      <div aria-live="polite" className="install-card__content" role="status">
        <span className="install-card__logo"><Logo size="sm" symbolOnly /></span>
        <div className="install-card__copy">
          <h2 id={titleId}>{fr.install.title}</h2>
          <p>{fr.install.description}</p>
        </div>
      </div>
      <div className="install-card__actions">
        <Button className="install-card__primary" onClick={onInstall} variant="primary">{isIOS ? fr.install.seeHow : fr.install.install}</Button>
        <button className="install-card__later" onClick={onLater} type="button">{fr.install.later}</button>
      </div>
    </motion.aside>}
  </AnimatePresence>;
}
