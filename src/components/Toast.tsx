import { useEffect } from 'react';
import { Button } from '@/components/Button';
import { fr } from '@/i18n/fr';

export interface ToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div aria-live="polite" className="toast surface-raised" role="status">
      <span>{message}</span>
      <Button onClick={onUndo} variant="ghost">{fr.design.labels.undo}</Button>
    </div>
  );
}
