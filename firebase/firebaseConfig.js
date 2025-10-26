import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';   // ✅ add this line
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBvmh9DZobjF_vFR_71gL2NkwK8Oga18uw",
  authDomain: "vastramitra-b1cd0.firebaseapp.com",
  projectId: "vastramitra-b1cd0",
  storageBucket: "vastramitra-b1cd0.firebasestorage.app",
  messagingSenderId: "982643274182",
  appId: "1:982643274182:web:ddab7eda90b3b52ecd82c7",
  measurementId: "G-SQ7JKTBGP3"
};

const app = initializeApp(firebaseConfig);

// 🧠 Detect if web or native (Expo)
let auth;
if (typeof window !== 'undefined') {
  auth = getAuth(app);
  auth.setPersistence(browserLocalPersistence);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// ✅ Firestore database instance
const db = getFirestore(app);

export { app, auth, db };
