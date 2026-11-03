import { connectFirestoreEmulator, initializeFirestore, memoryLocalCache, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

export const firestore = initializeFirestore(firebaseApp, {
  localCache: import.meta.env.MODE === 'test'
    ? memoryLocalCache()
    : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if ((import.meta.env.DEV || import.meta.env.MODE === 'test') && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(firestore, '127.0.0.1', 18080);
}
