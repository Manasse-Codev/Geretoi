import type { DataErrorCode } from '@/features/tasks/dataErrors';
import { toDataError } from '@/features/tasks/dataErrors';

let syncError: DataErrorCode | null = null;
let pendingWrites = 0;
const listeners = new Set<() => void>();

function notify() { listeners.forEach((listener) => listener()); }

export function subscribeSyncStatus(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncError() { return syncError; }
export function getPendingWrites() { return pendingWrites > 0; }

export function setSyncError(code: DataErrorCode) {
  syncError = code;
  notify();
}

export function clearSyncError() {
  if (syncError === null) return;
  syncError = null;
  notify();
}

export async function settleWrite(write: Promise<void>, waitForServer = true): Promise<void> {
  if (!waitForServer) {
    pendingWrites += 1;
    notify();
    void write.then(clearSyncError).catch((error: unknown) => setSyncError(toDataError(error).code)).finally(() => {
      pendingWrites = Math.max(0, pendingWrites - 1);
      notify();
    });
    return;
  }
  try {
    await write;
    clearSyncError();
  } catch (error) {
    setSyncError(toDataError(error).code);
    throw error;
  }
}
