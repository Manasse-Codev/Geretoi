import { CheckCircle2, ListChecks, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Sheet } from '@/components/Sheet';
import { fr } from '@/i18n/fr';

export function WelcomeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  function close() {
    try { localStorage.setItem('dayflow-welcome-seen', 'true'); } catch { /* La session reste utilisable sans stockage local. */ }
    onClose();
  }

  return (
    <Sheet label={fr.welcome.title} onClose={close} open={open}>
      <div className="welcome-dialog">
        <Sparkles aria-hidden="true" className="welcome-dialog__icon" size={28} />
        <h1>{fr.welcome.title}</h1>
        <p>{fr.welcome.description}</p>
        <div className="welcome-dialog__benefits">
          <Card><ListChecks aria-hidden="true" size={20} /><div><strong>{fr.welcome.organizeTitle}</strong><span>{fr.welcome.organizeDescription}</span></div></Card>
          <Card><Target aria-hidden="true" size={20} /><div><strong>{fr.welcome.planTitle}</strong><span>{fr.welcome.planDescription}</span></div></Card>
          <Card><CheckCircle2 aria-hidden="true" size={20} /><div><strong>{fr.welcome.progressTitle}</strong><span>{fr.welcome.progressDescription}</span></div></Card>
        </div>
        <Button onClick={close} variant="primary">{fr.welcome.discover}</Button>
        <button className="welcome-dialog__skip" onClick={close} type="button">{fr.welcome.skip}</button>
      </div>
    </Sheet>
  );
}
