import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const gradeRules = {
    gratuit: { label: "Gratuit" },
    pro: { label: "Pro" },
    premium: { label: "Premium" },
    plus_ultra: { label: "Plus Ultra" }
};

function chargerDonneesLocales() {
    const savedTheme = localStorage.getItem("appTheme") || "dark";
    document.body.classList.add(savedTheme);

    const urlParams = new URLSearchParams(window.location.search);
    const prenomURL = urlParams.get('prenom');
    const surnomURL = urlParams.get('surnom');
    
    const profilActuel = sessionStorage.getItem("activeProfile") || "Principal";
    const userData = JSON.parse(localStorage.getItem("userAnswers")) || {};
    
    const userProfile = {
        prenom: prenomURL || userData.prenom || "Athlète",
        surnom: surnomURL || userData.surnom || "",
        grade: userData.grade || "gratuit", 
        billingType: userData.billingType || "mensuel",
        profilActif: profilActuel
    };

    displayGreeting(userProfile);
    displayUserStatus(userProfile);
    adapterMascotteSelonJour();
}

function adapterMascotteSelonJour(testCompleted = false) {
    const today = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const speechElem = document.getElementById("mascot-speech");
    const btnAction = document.getElementById("btn-action-du-jour") || document.getElementById("btn-charger");

    if (!speechElem || !btnAction) return;

    if (testCompleted) {
        speechElem.innerText = "Ton test de niveau est validé ! Ton programme est prêt.";
        btnAction.innerText = "📋 Voir mon programme";
        btnAction.onclick = () => window.location.href = "programme.html";
        return;
    }

    if (today === 0) {
        // Dimanche : Focus Test & Mesures
        speechElem.innerText = "Dernière ligne droite ! Pense à effectuer ton test de niveau et prendre tes mesures de départ.";
        btnAction.innerText = "📋 Faire le test & Mesures";
        btnAction.onclick = () => window.location.href = "tests.html";
    } else if (today === 1) {
        // Lundi : Focus Premier entraînement
        speechElem.innerText = "C'est parti ! Ton premier entraînement de musculation t'attend.";
        btnAction.innerText = "🏋️ Lancer la séance du jour";
        btnAction.onclick = () => window.location.href = "mes_programmes.html";
    } else {
        // Autres jours
        speechElem.innerText = "Reste régulier ! Vérifie ton programme ou consulte ton suivi d'entraînement.";
        btnAction.innerText = "📅 Mes programmes";
        btnAction.onclick = () => window.location.href = "mes_programmes.html";
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Connecté en tant que :", user.email);

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userDocRef);

            if (userSnap.exists() && userSnap.data().testCompleted === true) {
                adapterMascotteSelonJour(true);
            }
        } catch (error) {
            console.error("Erreur Firestore :", error);
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    chargerDonneesLocales();

    const btnSwitch = document.getElementById("btn-switch-profile");
    if (btnSwitch) {
        btnSwitch.onclick = () => window.location.href = "profiles.html" + window.location.search;
    }

    const btnPerso = document.getElementById("btn-perso");
    if (btnPerso) {
        btnPerso.onclick = () => window.location.href = `espace-personnel.html${window.location.search}`;
    }
});

function displayGreeting(profile) {
    const nameToDisplay = (profile.surnom && profile.surnom.trim() !== "") ? profile.surnom : profile.prenom;
    const hour = new Date().getHours();
    let greeting = "";

    if (hour >= 5 && hour < 12) greeting = `⚡ Bon matin, ${nameToDisplay} !`;
    else if (hour >= 12 && hour < 18) greeting = `🔥 Bon après-midi, ${nameToDisplay} !`;
    else if (hour >= 18 && hour < 23) greeting = `💪 Bonne soirée, ${nameToDisplay} !`;
    else greeting = `🌙 Mode nuit activé, ${nameToDisplay} !`;

    const headerElem = document.getElementById("header-message");
    if (headerElem) headerElem.innerText = greeting;
}

function displayUserStatus(profile) {
    const rules = gradeRules[profile.grade] || gradeRules["gratuit"];
    let paymentMethod = "";
    
    if (profile.grade !== "gratuit") {
        if (profile.billingType === "lifetime") paymentMethod = " (Accès à vie ⚡)";
        else if (profile.billingType === "annuel") paymentMethod = " (Abonnement Annuel)";
        else paymentMethod = " (Abonnement Mensuel)";
    }

    const badge = document.getElementById("user-grade-badge");
    if (badge) {
        badge.innerText = `Compte ${rules.label}${paymentMethod} | Profil: ${profile.profilActif}`;
    }
}
