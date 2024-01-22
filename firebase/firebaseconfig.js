import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const firebaseConfig = {
  apiKey: "AIzaSyBg3lZ0hg6ATM7SCqIry0yVLOsvHRm1loQ",
  authDomain: "chatapp-621ed.firebaseapp.com",
  projectId: "chatapp-621ed",
  storageBucket: "chatapp-621ed.appspot.com",
  messagingSenderId: "765456765973",
  appId: "1:765456765973:web:d6c57d78cf8e659b8eea1c",
  measurementId: "G-F2R1VZ4MBN"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth();
export const database = getFirestore();
export default app;

const getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  } else {
    return null;
  }
};

export { getCurrentUser };