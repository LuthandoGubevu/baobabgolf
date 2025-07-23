// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPiz21odg4cknDAJmeik28rPfDPsTv6Ew",
  authDomain: "baobabgolf.firebaseapp.com",
  projectId: "baobabgolf",
  storageBucket: "baobabgolf.appspot.com",
  messagingSenderId: "78161841879",
  appId: "1:78161841879:web:08cdff541d18324fec2a92",
  measurementId: "G-J7WQB1TXEL"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = typeof window !== 'undefined' && isSupported() ? getAnalytics(app) : null;


export { app, db, analytics };
