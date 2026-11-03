import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

export function signOutCurrentUser(): Promise<void> {
  return signOut(auth);
}
