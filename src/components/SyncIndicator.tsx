import { AlertTriangle, Check, CloudOff, LoaderCircle, RefreshCw } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import type { SyncMetadata } from '@/features/tasks/taskRepository';
import { fr } from '@/i18n/fr';
import { getPendingWrites, getSyncError, subscribeSyncStatus } from '@/lib/syncStatus';

function subscribeNetwork(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineStatus() { return typeof navigator === 'undefined' || navigator.onLine; }

export function SyncIndicator({ sync }: { sync?: SyncMetadata }) {
  const online = useSyncExternalStore(subscribeNetwork, getOnlineStatus, () => true);
  const globalSyncError = useSyncExternalStore(subscribeSyncStatus, getSyncError, () => null);
  const queuedWrites = useSyncExternalStore(subscribeSyncStatus, getPendingWrites, () => false);
  // `sync.isOffline` is sampled when Firestore emits a snapshot and can be stale
  // after the browser comes back online. Network reachability is live state.
  const offline = !online;
  const pendingWrites = (sync?.hasPendingWrites ?? false) || queuedWrites;
  const errorCode = sync?.errorCode ?? globalSyncError;
  const fromCache = sync?.fromCache ?? false;
  const label = offline ? fr.data.sync.offline : errorCode ? fr.data.sync.error : pendingWrites ? fr.data.sync.syncing : fromCache ? fr.data.sync.cached : fr.data.sync.synced;
  const Icon = offline ? CloudOff : errorCode ? AlertTriangle : pendingWrites ? LoaderCircle : fromCache ? RefreshCw : Check;
  const description = errorCode ? fr.data.errors[errorCode] : undefined;
  return <span aria-label={description ? `${label}. ${description}` : label} className={`sync-indicator${errorCode && !offline ? ' sync-indicator--error' : ''}`} role="status" title={description}><Icon aria-hidden="true" size={16} /><span>{label}{offline && pendingWrites ? ` · ${fr.data.sync.pending}` : ''}</span>{description && <span className="sync-indicator__message">{description}</span>}</span>;
}
