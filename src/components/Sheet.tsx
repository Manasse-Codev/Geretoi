import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from '@/components/IconButton';
import { fr } from '@/i18n/fr';

export interface SheetProps {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}

const focusableSelector = 'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Sheet({ open, label, onClose, children }: SheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const initialFocus = dialog?.querySelector<HTMLElement>(focusableSelector) ?? dialog;
    initialFocus?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)];
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop">
      <div
        aria-label={label}
        aria-modal="true"
        className="sheet surface-raised"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div aria-hidden="true" className="sheet__handle" />
        <div className="sheet__toolbar">
          <span aria-hidden="true" />
          <IconButton aria-label={fr.design.labels.closeSheet} icon={<X size={18} />} onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}
