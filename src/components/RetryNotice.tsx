import { Button } from '@/components/Button';
import { fr } from '@/i18n/fr';

export function RetryNotice({ message, onRetry, loading = false }: { message: string; onRetry: () => void; loading?: boolean }) {
  return <div className="retry-notice" role="alert"><span>{message}</span><Button disabled={loading} loading={loading} onClick={onRetry} variant="ghost">{fr.actions.retry}</Button></div>;
}
