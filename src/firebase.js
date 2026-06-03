import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqbYjy-rtm0x3vlk_gOr2tub4fpKkFDqw",
  authDomain: "zipzo-d12f9.firebaseapp.com",
  projectId: "zipzo-d12f9",
  storageBucket: "zipzo-d12f9.firebasestorage.app",
  messagingSenderId: "565407418691",
  appId: "1:565407418691:web:5bea041386d5ebaf4887f6",
  measurementId: "G-NHJ26GNMZ2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);