import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebase.config.js';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);
export const functions = getFunctions(app, 'asia-southeast1');
export const storage = getStorage(app);

if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_EMULATOR === 'true' &&
  !window.__EMULATOR_CONNECTED__
) {
  window.__EMULATOR_CONNECTED__ = true;
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectDatabaseEmulator(db, 'localhost', 9000);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;
