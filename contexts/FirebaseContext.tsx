import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface FirebaseContextType {
  auth: Auth | null;
  db: Firestore | null;
  isReady: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  auth: null,
  db: null,
  isReady: false,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Firebase is initialized in firebase.ts
    // Just mark as ready after a brief delay to ensure proper initialization
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <FirebaseContext.Provider value={{ auth, db, isReady }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
