import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAi56vVxMQrMGbTkIpddp54AzEEEDpp8TQ",
  authDomain: "would-you-rather-99e71.firebaseapp.com",
  projectId: "would-you-rather-99e71",
  storageBucket: "would-you-rather-99e71.firebasestorage.app",
  messagingSenderId: "737670658095",
  appId: "1:737670658095:web:24dbc858725928ec102eda",
  measurementId: "G-E2KMVTTK3D",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
