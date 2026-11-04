import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { fr } from '@/i18n/fr';

export function GuestState() {
  const navigate = useNavigate();
  return (
    <EmptyState
      action={<Button onClick={() => navigate('/new')} variant="primary"><LogIn aria-hidden="true" size={17} />{fr.welcome.startTask}</Button>}
      description={fr.welcome.guestDescription}
      title={fr.welcome.guestTitle}
    />
  );
}
