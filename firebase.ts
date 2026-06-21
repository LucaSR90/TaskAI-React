import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'A',
  authDomain: 'taskai4.firebaseapp.com',
  projectId: 'taskai4',
  storageBucket: 'taskai4.firebasestorage.app',
  messagingSenderId: '869498891278',
  appId: '1:869498891278:web:1482fdd988ba0b3111205f',
};

let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  app = getApp();
}

// Inicialización defensiva de servicios
let authInstance: any = null;
let dbInstance: any = null;

try {
  authInstance = getAuth(app);
} catch (e) {
  console.warn('[Firebase Auth Init Warning]', e);
}

try {
  dbInstance = getFirestore(app);
} catch (e) {
  console.warn('[Firebase Firestore Init Warning]', e);
}

export const auth = authInstance;
export const db = dbInstance;
