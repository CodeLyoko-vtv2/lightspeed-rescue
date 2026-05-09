// admin-web/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from './firebase.config.js';

// Khởi tạo Firebase app — chỉ gọi 1 lần duy nhất
const app = initializeApp(firebaseConfig);

// Khởi tạo các services
export const auth     = getAuth(app);
export const db       = getDatabase(app);      // Realtime DB — dùng cho GPS
export const firestore = getFirestore(app);    // Firestore — dùng cho SOS records
export const storage  = getStorage(app);       // Storage — dùng cho ảnh/ghi âm

// Kết nối Emulator khi chạy local (tránh ảnh hưởng data production)
if (import.meta.env.DEV && !window.__EMULATOR_CONNECTED__) {
  window.__EMULATOR_CONNECTED__ = true;
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectDatabaseEmulator(db, 'localhost', 9000);
}

export default app;