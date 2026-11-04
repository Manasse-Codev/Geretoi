import { connectFirestoreEmulator, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { shouldUseFirebaseEmulators } from '@/lib/firebaseEnvironment';

export const firestore = initializeFirestore(firebaseApp, {
  localCache: import.meta.env.MODE === 'test'
    ? memoryLocalCache()
    : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if (shouldUseFirebaseEmulators({ dev: import.meta.env.DEV, mode: import.meta.env.MODE, enabled: import.meta.env.VITE_USE_EMULATORS })) {
  connectFirestoreEmulator(firestore, '127.0.0.1', 18080);
}
