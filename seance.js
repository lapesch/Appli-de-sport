import { auth, db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const activeProfile = sessionStorage.getItem("activeProfile") || "Principal";
document.getElementById("activeProfileBadge").innerText = `Profil actif : ${activeProfile}`;

const exercisesContainer = document.getElementById("exercisesContainer");
const btnAddExercise = document.getElementById("btnAddExercise");
const btnSaveSession = document.getElementById("btnSaveSession");
const btnAbandon = document.getElementById("btnAbandon");

let exerciseCount = 0;

// Ajouter un exercice dynamiquement
function ajouterExercice() {
    exerciseCount++;
    const exId = `ex_${exerciseCount}`;

    const exCard = document.createElement("div");
    exCard.className = "exercise-card";
    exCard.id = exId;

    exCard.innerHTML = `
        <div class="exercise-header">
            <input type="text" class="ex-name" placeholder="Nom de l'exercice (ex: Développé couché)" style="font-weight:bold;">
            <button class="btn-remove" onclick="document.getElementById('${exId}').remove()">🗑️</button>
        </div>
        <div class="sets-grid">
            <span>Série</span>
            <span>Poids (kg)</span>
            <span>Répétitions</span>
        </div>
        <div class="sets-container">
            <div class="sets-grid" style="margin-top:5px;">
                <span>1</span>
                <input type="number" class="ex-weight" placeholder="0" step="0.5">
                <input type="number" class="ex-reps" placeholder="0">
            </div>
        </div>
    `;

    exercisesContainer.appendChild(exCard);
}

// Événements
btnAddExercise.addEventListener("click", ajouterExercice);

btnAbandon.addEventListener("click", () => {
    if (confirm("Abandonner cette séance ? Les données saisies seront perdues.")) {
        window.location.href = "tous_les_programmes.html";
    }
});

// Sauvegarde de la séance (Firestore + localStorage)
btnSaveSession.addEventListener("click", async () => {
    const sessionName = document.getElementById("sessionName").value.trim() || "Séance Sans Nom";
    const exerciseCards = document.querySelectorAll(".exercise-card");

    if (exerciseCards.length === 0) {
        alert("Ajoute au moins un exercice avant de valider la séance !");
        return;
    }

    const exercicesData = [];

    exerciseCards.forEach(card => {
        const name = card.querySelector(".ex-name").value.trim() || "Exercice";
        const weight = parseFloat(card.querySelector(".ex-weight").value) || 0;
        const reps = parseInt(card.querySelector(".ex-reps").value) || 0;

        exercicesData.push({
            nom: name,
            poids: weight,
            repetition: reps
        });
    });

    const seanceObjet = {
        nom: sessionName,
        profil: activeProfile,
        date: new Date().toISOString(),
        exercices: exercicesData
    };

    btnSaveSession.disabled = true;
    btnSaveSession.innerText = "Enregistrement...";

    try {
        // 1. Sauvegarde LocalStorage (Spécifique au profil actif)
        const localKey = `historique_seances_${activeProfile}`;
        const historiqueLocal = JSON.parse(localStorage.getItem(localKey) || "[]");
        historiqueLocal.push(seanceObjet);
        localStorage.setItem(localKey, JSON.stringify(historiqueLocal));

        // 2. Sauvegarde Cloud Firebase Firestore (si utilisateur connecté)
        const user = auth.currentUser;
        if (user) {
            await addDoc(collection(db, "users", user.uid, "historique_seances"), {
                ...seanceObjet,
                createdAt: serverTimestamp()
            });
        }

        alert("🎉 Séance enregistrée avec succès !");
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Erreur d'enregistrement :", error);
        alert("Séance enregistrée en local ! (Erreur de synchro Cloud)");
        window.location.href = "dashboard.html";
    }
});

// Ajouter un premier exercice par défaut au chargement
ajouterExercice();

