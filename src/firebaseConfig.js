// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'; 
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCk16QL9Prxu2dDhgGO59eNGkFMGoUP73I",
  authDomain: "shoppingdemo-e82d9.firebaseapp.com",
  projectId: "shoppingdemo-e82d9",
  storageBucket: "shoppingdemo-e82d9.firebasestorage.app",
  messagingSenderId: "928496052552",
  appId: "1:928496052552:web:3bdefe18b0218764fb6b7d",
  measurementId: "G-0LM2KWY97V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, analytics };