import firebase from '@react-native-firebase/app';

// Import other firebase modules you need, e.g., auth, firestore
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';

const initializeFirebase = () => {
  if (!firebase.apps.length) {
    console.log('Firebase has not been initialized. Ensure you have the google-services.json (Android) and GoogleService-Info.plist (iOS) files in the correct locations.');
  } else {
    console.log('Firebase initialized successfully.');
  }
};

initializeFirebase();

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage(); 