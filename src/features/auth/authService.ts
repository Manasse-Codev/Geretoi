import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { clearIndexedDbPersistence, terminate, waitForPendingWrites } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { firestore } from '@/lib/firestore';

const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|Windows Phone/i;

/** Redirect for installed PWAs and mobile user agents; use a popup on desktop browsers. */
export function shouldUseGoogleRedirect(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const standaloneDisplay = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneDisplay || iosStandalone || mobileUserAgent.test(navigator.userAgent);
}

export function signInWithEmail(email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth, email, password).then(() => undefined);
}

export function createEmailAccount(email: string, password: string): Promise<void> {
  return createUserWithEmailAndPassword(auth, email, password).then(() => undefined);
}

export function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  return shouldUseGoogleRedirect()
    ? signInWithRedirect(auth, provider)
    : signInWithPopup(auth, provider).then(() => undefined);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email).then(() => undefined);
}

export function signOutCurrentUser(): Promise<void> {
  return signOutSafely();
}

export class PendingWritesError extends Error {
  constructor() {
    super('pending-writes');
    this.name = 'PendingWritesError';
  }
}

async function signOutSafely(): Promise<void> {
  let timeout: number | undefined;
  try {
    await Promise.race([
      waitForPendingWrites(firestore),
      new Promise<never>((_resolve, reject) => {
        timeout = window.setTimeout(() => reject(new PendingWritesError()), 10_000);
      }),
    ]);
  } catch {
    throw new PendingWritesError();
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }

  try {
    await terminate(firestore);
    await clearIndexedDbPersistence(firestore);
  } catch {
    // Reinitializing the Firebase singleton requires a fresh document context.
    window.location.reload();
    throw new Error('local-data-cleanup-failed');
  }

  await signOut(auth);
  window.location.replace('/');
}
