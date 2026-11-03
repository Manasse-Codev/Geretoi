import { describe, expect, it } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { toDataError } from './dataErrors';

describe('toDataError', () => {
  it('classifies unavailable as a Firestore sync failure, not an offline state', () => {
    expect(toDataError(new FirebaseError('unavailable', 'test')).code).toBe('syncUnavailable');
  });

  it('keeps a Firestore timeout distinct from an unavailable service', () => {
    expect(toDataError(new FirebaseError('deadline-exceeded', 'test')).code).toBe('deadlineExceeded');
  });

  it('reports Firebase network request failures separately from browser offline state', () => {
    expect(toDataError(new FirebaseError('network-request-failed', 'test')).code).toBe('networkRequestFailed');
  });

  it('keeps permission failures distinct', () => {
    expect(toDataError(new FirebaseError('permission-denied', 'test')).code).toBe('permissionDenied');
  });

  it('keeps authentication and Auth network failures distinct', () => {
    expect(toDataError(new FirebaseError('unauthenticated', 'test')).code).toBe('unauthenticated');
    expect(toDataError(new FirebaseError('auth/network-request-failed', 'test')).code).toBe('authNetworkFailed');
  });
});
