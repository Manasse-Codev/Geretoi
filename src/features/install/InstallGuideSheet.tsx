import { useId } from 'react';
import { Home, Share } from 'lucide-react';
import { Sheet } from '@/components/Sheet';
import { fr } from '@/i18n/fr';

type InstallGuideSheetProps = {
  open: boolean;
  isIOS: boolean;
  isSafari: boolean;
  onClose: () => void;
};

export function InstallGuideSheet({ open, isIOS, isSafari, onClose }: InstallGuideSheetProps) {
  const titleId = useId();
  return <Sheet label={fr.install.guideTitle} onClose={onClose} open={open}>
    <div aria-labelledby={titleId} className="install-guide">
      <h2 id={titleId}>{fr.install.guideTitle}</h2>
      {isIOS && !isSafari && <p className="install-guide__note">{fr.install.openSafari}</p>}
      {!isIOS && <p className="install-guide__note">{fr.install.browserGuide}</p>}
      {isIOS && <ol className="install-guide__steps">
        <li>
          <span aria-hidden="true" className="install-guide__illustration"><Share size={24} strokeWidth={1.9} /></span>
          <span><span className="install-guide__number">1</span><strong>{fr.install.stepShare}</strong></span>
        </li>
        <li>
          <span aria-hidden="true" className="install-guide__illustration"><Home size={24} strokeWidth={1.9} /></span>
          <span><span className="install-guide__number">2</span><strong>{fr.install.stepHome}</strong></span>
        </li>
      </ol>}
    </div>
  </Sheet>;
}
