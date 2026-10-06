import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAx2H9E03tD1NV5Y4xP0UolMC6pyLv0OJI",
  authDomain: "appli-de-sport-b086f.firebaseapp.com",
  projectId: "appli-de-sport-b086f",
  storageBucket: "appli-de-sport-b086f.firebasestorage.app",
  messagingSenderId: "964841162605",
  appId: "1:964841162605:web:d9fec25cde9ebea14d7c64",
  measurementId: "G-Z80ZG5YGSC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
