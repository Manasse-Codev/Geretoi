import { LoginPage } from '@/features/auth/LoginPage';
import { Sheet } from '@/components/Sheet';
import { fr } from '@/i18n/fr';

export interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AuthDialog({ open, onClose, onAuthenticated }: AuthDialogProps) {
  return (
    <Sheet label={fr.auth.dialogLabel} onClose={onClose} open={open}>
      <LoginPage compact onAuthenticated={onAuthenticated} onClose={onClose} />
    </Sheet>
  );
}
