import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8hXe4UGt8HZ7npl36k7T7Z973NCyMEkM",
  authDomain: "lavme-9a96a.firebaseapp.com",
  projectId: "lavme-9a96a",
  storageBucket: "lavme-9a96a.firebasestorage.app",
  messagingSenderId: "636672962662",
  appId: "1:636672962662:web:87713d02eaa9bdcd17bda7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
