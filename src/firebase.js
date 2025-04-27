/* eslint-disable no-unused-vars */
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyDA4miIw6R-cD6xmSTrlu_cOis0QcqNrS4",
  authDomain: "roomloo-web.firebaseapp.com",
  projectId: "roomloo-web",
  storageBucket: "roomloo-web.firebasestorage.app",
  messagingSenderId: "732358793482",
  appId: "1:732358793482:web:1f2b7d4c4e61432a6e42f3",
  measurementId: "G-KJNDCPKHNS"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 
export const db = getFirestore(app);
export const storage = getStorage(app)
export default app;