const firebaseConfig = {
  apiKey: "AIzaSyAx2H9E03tD1NV5Y4xP0UolMC6pyLv0OJI",
  authDomain: "appli-de-sport-b086f.firebaseapp.com",
  projectId: "appli-de-sport-b086f",
  storageBucket: "appli-de-sport-b086f.firebasestorage.app",
  messagingSenderId: "964841162605",
  appId: "1:964841162605:web:d9fec25cde9ebea14d7c64",
  measurementId: "G-Z80ZG5YGSC"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Gestionnaire d'affichage des erreurs
function afficherErreur(message) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
        errorEl.innerText = message;
        errorEl.style.display = 'block';
    } else {
        alert(message);
    }
}

function masquerErreur() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.innerText = '';
    }
}

// 1. Connexion via Google
document.getElementById('google-btn').addEventListener('click', () => {
    masquerErreur();
    localStorage.removeItem("manualLogout"); 
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider).catch(error => {
        console.error("Erreur Google Auth :", error);
        afficherErreur("Erreur Google : " + error.message);
    });
});

// 2. Connexion par Email
document.getElementById('login-btn').addEventListener('click', () => {
    masquerErreur();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        afficherErreur("Veuillez saisir un e-mail et un mot de passe.");
        return;
    }

    localStorage.removeItem("manualLogout");
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(error => {
            console.error("Erreur connexion :", error);
            afficherErreur("Erreur de connexion : " + error.message);
        });
});

// 3. Inscription par Email
document.getElementById('signup-btn').addEventListener('click', () => {
    masquerErreur();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        afficherErreur("Veuillez saisir un e-mail et un mot de passe pour vous inscrire.");
        return;
    }

    localStorage.removeItem("manualLogout"); 
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => alert("Compte créé avec succès !"))
        .catch(error => {
            console.error("Erreur inscription :", error);
            afficherErreur("Erreur d'inscription : " + error.message);
        });
});

// 4. Directeur de trafic & Automatisation Firestore (INSTANTANÉ)
firebase.auth().onAuthStateChanged((user) => {
    if (user && localStorage.getItem("manualLogout") !== "true") {
        // Redirection immédiate sans attendre le réseau
        window.location.href = "profiles.html";

        // Tâche de fond non-bloquante
        const userRef = db.collection("users").doc(user.uid);
        userRef.get().then((docSnap) => {
            if (!docSnap.exists) {
                const emailUtilisateur = user.email || "";
                const prenomExtrait = user.displayName || (emailUtilisateur ? emailUtilisateur.split('@')[0] : "Membre");
                
                return userRef.set({
                    email: emailUtilisateur,
                    prenom: prenomExtrait,
                    role: "user",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }).catch((error) => {
            console.error("Erreur arrière-plan Firestore :", error);
        });
    } else {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.style.display = 'block';
        }
    }
});
