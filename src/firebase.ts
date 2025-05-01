import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVTueD8Zu_yWoSH4FLMx-Sd5KZpqzu-dk",
  authDomain: "corevia-fitness-tracking.firebaseapp.com",
  projectId: "corevia-fitness-tracking",
  storageBucket: "corevia-fitness-tracking.firebasestorage.app",
  messagingSenderId: "118613268034",
  appId: "1:118613268034:web:eb0c8db85ee52b60f8ffdb",
  measurementId: "G-3HT5SN1CDP"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
