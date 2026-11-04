import { describe, expect, it } from 'vitest';
import { missingFirebaseVariables, shouldUseFirebaseEmulators } from '@/lib/firebaseEnvironment';

describe('firebase environment', () => {
  it('never connects a production build to emulators, even when requested', () => {
    expect(shouldUseFirebaseEmulators({ dev: false, mode: 'production', enabled: 'true' })).toBe(false);
  });

  it('connects to emulators only when explicitly enabled in development or tests', () => {
    expect(shouldUseFirebaseEmulators({ dev: true, mode: 'development', enabled: 'true' })).toBe(true);
    expect(shouldUseFirebaseEmulators({ dev: false, mode: 'test', enabled: 'true' })).toBe(true);
    expect(shouldUseFirebaseEmulators({ dev: true, mode: 'development', enabled: 'false' })).toBe(false);
  });

  it('returns missing variable names without exposing their values', () => {
    expect(missingFirebaseVariables({ VITE_FIREBASE_API_KEY: 'secret-value' })).toEqual([
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID',
    ]);
  });

  it('does not require optional Firebase service configuration', () => {
    expect(missingFirebaseVariables({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'example.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'example-project',
      VITE_FIREBASE_APP_ID: '1:123:web:abc',
    })).toEqual([]);
  });
});
