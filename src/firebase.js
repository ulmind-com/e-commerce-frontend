import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkLDaaoKYlBqjPECM4JzhEtqSo3liu5tw",
  authDomain: "onebasket-1f7db.firebaseapp.com",
  projectId: "onebasket-1f7db",
  storageBucket: "onebasket-1f7db.firebasestorage.app",
  messagingSenderId: "880221819517",
  appId: "1:880221819517:web:bdc47cc8379c7b71f5d714",
  measurementId: "G-4WVR1F4PPH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
