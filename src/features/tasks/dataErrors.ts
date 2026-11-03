import { FirebaseError } from 'firebase/app';

export type DataErrorCode = 'unauthenticated' | 'permissionDenied' | 'syncUnavailable' | 'deadlineExceeded' | 'networkRequestFailed' | 'authNetworkFailed' | 'notFound' | 'invalidData' | 'retentionNotElapsed' | 'unknown';

export class DataError extends Error {
  constructor(readonly code: DataErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = 'DataError';
  }
}

export function toDataError(error: unknown): DataError {
  if (error instanceof DataError) return error;
  const code = error instanceof FirebaseError ? error.code : '';
  if (code === 'permission-denied' || code === 'firestore/permission-denied') return new DataError('permissionDenied', { cause: error });
  if (code === 'unauthenticated' || code === 'firestore/unauthenticated') return new DataError('unauthenticated', { cause: error });
  if (code === 'unavailable' || code === 'firestore/unavailable') return new DataError('syncUnavailable', { cause: error });
  if (code === 'deadline-exceeded' || code === 'firestore/deadline-exceeded') return new DataError('deadlineExceeded', { cause: error });
  if (code === 'network-request-failed' || code === 'firestore/network-request-failed') return new DataError('networkRequestFailed', { cause: error });
  if (code === 'auth/network-request-failed') return new DataError('authNetworkFailed', { cause: error });
  if (code === 'not-found') return new DataError('notFound', { cause: error });
  if (code === 'invalid-argument' || code === 'data-loss') return new DataError('invalidData', { cause: error });
  return new DataError('unknown', { cause: error });
}
