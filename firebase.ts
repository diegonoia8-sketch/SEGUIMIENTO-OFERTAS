import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRzm3bvkogl0sfpxmgGGAxcVy7aNrJCI8",
  authDomain: "project-managment-d4a21.firebaseapp.com",
  projectId: "project-managment-d4a21",
  storageBucket: "project-managment-d4a21.firebasestorage.app",
  messagingSenderId: "921399366035",
  appId: "1:921399366035:web:21638be9321e23d6579866",
  measurementId: "G-GLY1NSTK0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
const analytics = getAnalytics(app);