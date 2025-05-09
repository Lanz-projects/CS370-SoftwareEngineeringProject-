// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase config using VITE_ environment variables
const res = await fetch("http://localhost:5000/api/firebase-config"); 
const firebaseConfig = await res.json();

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
