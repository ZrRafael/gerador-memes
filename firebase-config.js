// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC0uzKfX3UiSRDqJQ3EC4CoKPfyGS31p5o",
    authDomain: "gerador-de-memes-305eb.firebaseapp.com",
    projectId: "gerador-de-memes-305eb",
    storageBucket: "gerador-de-memes-305eb.firebasestorage.app",
    messagingSenderId: "990923988410",
    appId: "1:990923988410:web:663c31097641c37286d183",
    measurementId: "G-NNCNK1WXP3"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 