import { Check, CloudOff, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { fr } from '@/i18n/fr';

export type UpdateExperienceMode = 'full' | 'banner';
export type UpdateExperienceState = 'ready' | 'updating' | 'success' | 'offline';

interface UpdateExperienceProps {
  mode: UpdateExperienceMode;
  state: UpdateExperienceState;
  onUpdate?: () => void;
  onRetry?: () => void;
  onDismiss?: () => void;
  onBackHome?: () => void;
}

function UpdateMark({ state }: { state: UpdateExperienceState }) {
  const isOffline = state === 'offline';
  const isSuccess = state === 'success';
  return <div aria-hidden="true" className={`update-experience__mark update-experience__mark--${state}`}>
    <span className="update-experience__ring">
      <svg viewBox="0 0 112 112">
        <circle className="update-experience__ring-track" cx="56" cy="56" r="50" />
        <circle className="update-experience__ring-progress" cx="56" cy="56" r="50" />
      </svg>
      <span className="update-experience__ring-knob" />
    </span>
    <span className="update-experience__disc">
      {isOffline ? <CloudOff size={28} strokeWidth={1.8} /> : isSuccess ? <Check className="update-experience__check" size={30} strokeWidth={2.5} /> : <Logo size="sm" symbolOnly />}
    </span>
  </div>;
}

export function UpdateExperience({ mode, state, onUpdate, onRetry, onDismiss, onBackHome }: UpdateExperienceProps) {
  const [interactionState, setInteractionState] = useState<UpdateExperienceState | null>(null);
  const isBanner = mode === 'banner';
  const currentState = interactionState ?? state;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isOffline = currentState === 'offline';
  const isUpdating = currentState === 'updating';
  const isSuccess = currentState === 'success';
  const title = isOffline ? fr.pwa.offlineTitle : isSuccess ? fr.pwa.successTitle : isBanner ? fr.pwa.bannerTitle : fr.pwa.readyTitle;
  const subtitle = isOffline ? fr.pwa.offlineMessage : isSuccess ? fr.pwa.successMessage : isUpdating ? fr.pwa.updatingMessage : isBanner ? fr.pwa.bannerMessage : fr.pwa.readyMessage;

  useEffect(() => {
    if (!isBanner) titleRef.current?.focus();
  }, [isBanner]);

  if (isBanner) {
    return <aside aria-label={fr.pwa.bannerTitle} className="pwa-update surface-raised" role="status">
      <div className="pwa-update__mark" aria-hidden="true"><RefreshCw size={20} /></div>
      <div className="pwa-update__copy"><strong>{title}</strong><span>{subtitle}</span></div>
      <div className="pwa-update__actions">
        <Button disabled={isUpdating} loading={isUpdating} onClick={onUpdate} variant="primary">{fr.pwa.updateNow}</Button>
        <button aria-label={fr.pwa.updateLater} className="pwa-update__dismiss" onClick={onDismiss} type="button"><X size={19} /></button>
      </div>
    </aside>;
  }

  async function update() {
    setInteractionState('updating');
    await onUpdate?.();
    setInteractionState('success');
  }

  return <main aria-labelledby="update-experience-title" className="update-experience">
    <div aria-hidden="true" className="update-experience__blob update-experience__blob--violet" />
    <div aria-hidden="true" className="update-experience__blob update-experience__blob--orange" />
    <section className={`update-experience__card surface-raised update-experience__card--${currentState}`}>
      <UpdateMark state={currentState} />
      <h1 id="update-experience-title" ref={titleRef} tabIndex={-1}>{title}</h1>
      <p>{subtitle}</p>
      <div className="update-experience__actions">
        {isOffline ? <Button onClick={onRetry} variant="primary"><RefreshCw aria-hidden="true" size={18} />{fr.actions.retry}</Button> : !isSuccess && <Button disabled={isUpdating} loading={isUpdating} onClick={() => { void update(); }} variant="primary">{isUpdating ? fr.pwa.updatingButton : fr.pwa.updateNow}</Button>}
        {!isUpdating && !isSuccess && <Button onClick={onBackHome} variant="secondary">{fr.routeError.backHome}</Button>}
      </div>
    </section>
  </main>;
}
