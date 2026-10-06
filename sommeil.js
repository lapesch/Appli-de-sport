import { auth, db } from "./firebase-config.js";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let selectedNote = 3;
let selectedEtat = "passable";
let userConfig = { sleepTarget: 8, bedtimeTarget: "22:30", reminder: true };
let currentUserId = null;

// Initialisation au chargement
auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUserId = user.uid;
        await chargerConfigUtilisateur();
        await chargerHistoriqueSommeil();
        verifierSaisieAutoProposee();
    }
});

// Algorithme de calcul du score de récupération (0 à 100 %)
function calculerScoreRecuperation(dureeHeures, qualite, etat, perturbateursCount) {
    // 1. Ratio durée (Base sur 50 points)
    let ratioDuree = (dureeHeures / userConfig.sleepTarget);
    if (ratioDuree > 1) ratioDuree = 1;
    let pointsDuree = ratioDuree * 50;

    // 2. Qualité de nuit (Base sur 30 points : 6 pts par étoile)
    let pointsQualite = qualite * 6;

    // 3. État au réveil (Bonus / Malus)
    let bonusEtat = 0;
    if (etat === "forme") bonusEtat = 20;
    else if (etat === "passable") bonusEtat = 10;
    else if (etat === "epuise") bonusEtat = -10;

    // 4. Pénalité pour perturbateurs (-5 pts par perturbateur)
    let penaliteFreins = perturbateursCount * 5;

    let scoreFinal = pointsDuree + pointsQualite + bonusEtat - penaliteFreins;
    if (scoreFinal > 100) scoreFinal = 100;
    if (scoreFinal < 0) scoreFinal = 0;

    return Math.round(scoreFinal);
}

// Mise à jour de la carte d'en-tête (Section 2)
function afficherCardRecuperation(nuit) {
    const card = document.getElementById("card-recuperation");
    const pille = document.getElementById("pille-lumineuse");
    const scoreElem = document.getElementById("score-pourcentage");
    const rappelElem = document.getElementById("rappel-nuit");
    const conseilElem = document.getElementById("message-conseil-sportif");

    if (!nuit) {
        scoreElem.innerText = "--%";
        rappelElem.innerText = "Aucune nuit enregistrée pour aujourd'hui.";
        conseilElem.innerText = "Renseigne ta nuit pour obtenir ton conseil d'entraînement.";
        return;
    }

    const score = calculerScoreRecuperation(nuit.duree, nuit.qualite, nuit.etat, nuit.perturbateurs.length);
    scoreElem.innerText = `${score}%`;
    rappelElem.innerText = `Dernière nuit : ${nuit.dureeFormatte || nuit.duree + ' h'} dormies.`;

    // Réinitialisation des classes
    card.className = "card-recuperation";
    pille.className = "pille";

    if (score >= 80) {
        card.classList.add("status-vert");
        pille.classList.add("pille-verte");
        conseilElem.innerText = "⚡ Forme optimale. Prêt pour une séance intensive ou une tentative de record.";
    } else if (score >= 50) {
        card.classList.add("status-orange");
        pille.classList.add("pille-orange");
        conseilElem.innerText = "🟠 Récupération modérée. Effectue ta séance mais réduis le volume de 1 ou 2 séries.";
    } else {
        card.classList.add("status-rouge");
        pille.classList.add("pille-rouge");
        conseilElem.innerText = "🔴 Fatigue importante. Privilégie un jour de repos, du cardio léger ou de la mobilité.";
    }
}

// Chargement de l'historique et affichage du graphique (Section 4 & 5)
async function chargerHistoriqueSommeil() {
    const sleepRef = collection(db, "users", currentUserId, "sleep");
    const q = query(sleepRef, orderBy("date", "desc"), limit(14));
    const snapshot = await getDocs(q);

    const logs = [];
    snapshot.forEach(doc => logs.push(doc.data()));

    const septDerniers = logs.slice(0, 7).reverse();
    const septPrecedents = logs.slice(7, 14);

    afficherGraphiqueHebdo(septDerniers);
    calculerStatistiques(septDerniers, septPrecedents);

    // Mettre à jour l'en-tête avec la nuit la plus récente
    if (logs.length > 0) {
        afficherCardRecuperation(logs[0]);
    }
}

function afficherGraphiqueHebdo(logs) {
    const container = document.getElementById("bars-container");
    container.innerHTML = "";

    // Ligne d'objectif
    const lineElem = document.getElementById("target-line");
    const labelTarget = document.getElementById("target-label");
    const pctTarget = (userConfig.sleepTarget / 12) * 100;
    lineElem.style.bottom = `${pctTarget}%`;
    labelTarget.innerText = `${userConfig.sleepTarget}h00`;

    const joursSemaine = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

    for (let i = 0; i < 7; i++) {
        const log = logs[i] || null;
        const wrapper = document.createElement("div");
        wrapper.className = "bar-wrapper";

        const bar = document.createElement("div");
        bar.className = "bar";

        let duree = log ? log.duree : 0;
        let pctHeight = (duree / 12) * 100;
        if (pctHeight > 100) pctHeight = 100;
        bar.style.height = `${pctHeight}%`;

        // Couleur de la barre
        if (duree >= userConfig.sleepTarget) bar.classList.add("bar-green");
        else if (duree >= 6) bar.classList.add("bar-orange");
        else bar.classList.add("bar-red");

        // Tooltip
        const jourNom = log ? log.jourNom : joursSemaine[i];
        const freinsTxt = log && log.perturbateurs.length > 0 ? log.perturbateurs.join(", ") : "Aucun frein";
        bar.setAttribute("data-tooltip", log ? `${jourNom} : ${duree}h - Note ${log.qualite}/5 (${freinsTxt})` : "Pas de données");

        const label = document.createElement("span");
        label.className = "bar-label";
        label.innerText = jourNom;

        wrapper.appendChild(bar);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    }
}

// Calcul des statistiques (Section 5)
function calculerStatistiques(recents, anciens) {
    if (recents.length === 0) return;

    // 1. Moyenne 7 jours
    const sommeRecente = recents.reduce((acc, curr) => acc + curr.duree, 0);
    const moyRecente = sommeRecente / recents.length;
    
    document.getElementById("stat-moyenne-valeur").innerText = `${moyRecente.toFixed(1)} h`;

    // Comparaison avec les 7 jours précédents
    if (anciens.length > 0) {
        const sommeAncienne = anciens.reduce((acc, curr) => acc + curr.duree, 0);
        const moyAncienne = sommeAncienne / anciens.length;
        const diffMinutes = Math.round((moyRecente - moyAncienne) * 60);

        const tendanceElem = document.getElementById("stat-moyenne-tendance");
        if (diffMinutes >= 0) {
            tendanceElem.className = "stat-tendance tendance-up";
            tendanceElem.innerText = `↑ +${diffMinutes} min / semaine précédente`;
        } else {
            tendanceElem.className = "stat-tendance tendance-down";
            tendanceElem.innerText = `↓ ${diffMinutes} min / semaine précédente`;
        }
    }

    // 2. Perturbateur le plus fréquent
    const freinsMap = {};
    recents.forEach(log => {
        if (log.perturbateurs) {
            log.perturbateurs.forEach(f => freinsMap[f] = (freinsMap[f] || 0) + 1);
        }
    });

    let topFrein = null;
    let maxOccurrences = 0;
    for (const [frein, count] of Object.entries(freinsMap)) {
        if (count > maxOccurrences) {
            maxOccurrences = count;
            topFrein = frein;
        }
    }

    const mapNomsFreins = {
        ecrans: "Écrans tard",
        cafeine: "Caféine après 16 h",
        repas: "Repas lourd",
        reveils: "Réveils nocturnes",
        stress: "Stress"
    };

    if (topFrein) {
        document.getElementById("stat-frein-nom").innerText = mapNomsFreins[topFrein] || topFrein;
        document.getElementById("stat-frein-count").innerText = `${maxOccurrences} nuit(s) impactée(s)`;
    } else {
        document.getElementById("stat-frein-nom").innerText = "Aucun";
        document.getElementById("stat-frein-count").innerText = "0 frein détecté";
    }
}

// Interactions du Modal de saisie
window.setNote = function(n) {
    selectedNote = n;
    const stars = document.querySelectorAll(".rating-stars .star");
    stars.forEach((s, idx) => {
        if (idx < n) s.classList.add("active");
        else s.classList.remove("active");
    });
};

window.setEtat = function(etat) {
    selectedEtat = etat;
    document.querySelectorAll(".btn-badge").forEach(b => b.classList.remove("selected"));
    event.target.classList.add("selected");
};

window.ouvrirModalSaisie = function() {
    document.getElementById("modal-saisie").style.display = "flex";
    const aujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById("modal-date-titre").innerText = `Ta nuit du ${aujourdhui}`;
};

window.fermerModalSaisie = function() {
    document.getElementById("modal-saisie").style.display = "none";
};

// Enregistrement de la nuit dans Firestore
window.validerNuit = async function() {
    const coucher = document.getElementById("input-time-coucher").value;
    const reveil = document.getElementById("input-time-reveil").value;

    if (!coucher || !reveil) {
        alert("Veuillez remplir les heures de coucher et de réveil.");
        return;
    }

    // Calcul de la durée en heures décimales
    const [hC, mC] = coucher.split(":").map(Number);
    const [hR, mR] = reveil.split(":").map(Number);
    let totalMinutes = (hR * 60 + mR) - (hC * 60 + mC);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Passage de minuit

    const dureeHeures = parseFloat((totalMinutes / 60).toFixed(2));
    const dureeFormatte = `${Math.floor(totalMinutes / 60)}h${String(totalMinutes % 60).padStart(2, '0')}`;

    // Récupération des perturbateurs cochés
    const perturbateurs = [];
    document.querySelectorAll(".chk-frein:checked").forEach(c => perturbateurs.push(c.value));

    const todayStr = new Date().toISOString().split("T")[0];
    const jourNom = new Date().toLocaleDateString("fr-FR", { weekday: 'short' });

    const nuitData = {
        date: todayStr,
        jourNom: jourNom,
        coucher: coucher,
        reveil: reveil,
        duree: dureeHeures,
        dureeFormatte: dureeFormatte,
        qualite: selectedNote,
        etat: selectedEtat,
        perturbateurs: perturbateurs,
        timestamp: Date.now()
    };

    // Sauvegarde Firestore
    await setDoc(doc(db, "users", currentUserId, "sleep", todayStr), nuitData);

    // Réinitialisation du flag local
    localStorage.removeItem("pending_sleep_coucher");
    localStorage.removeItem("pending_sleep_reveil");

    fermerModalSaisie();
    await chargerHistoriqueSommeil();
};

// Vérification de la détection automatique transmise par Android/Sketchware
function verifierSaisieAutoProposee() {
    const autoCoucher = localStorage.getItem("pending_sleep_coucher");
    const autoReveil = localStorage.getItem("pending_sleep_reveil");

    if (autoCoucher && autoReveil) {
        document.getElementById("input-time-coucher").value = autoCoucher;
        document.getElementById("input-time-reveil").value = autoReveil;
        ouvrirModalSaisie();
    }
}

// Gestion des réglages (Section 6)
async function chargerConfigUtilisateur() {
    const docRef = doc(db, "users", currentUserId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().sleepSettings) {
        userConfig = snap.data().sleepSettings;
        document.getElementById("set-target-hours").value = userConfig.sleepTarget;
        document.getElementById("set-target-bedtime").value = userConfig.bedtimeTarget;
        document.getElementById("set-reminder-toggle").checked = userConfig.reminder;
    }
}

window.sauvegarderReglages = async function(e) {
    e.preventDefault();
    userConfig.sleepTarget = parseFloat(document.getElementById("set-target-hours").value);
    userConfig.bedtimeTarget = document.getElementById("set-target-bedtime").value;
    userConfig.reminder = document.getElementById("set-reminder-toggle").checked;

    await setDoc(doc(db, "users", currentUserId), { sleepSettings: userConfig }, { merge: true });
    alert("Réglages mis à jour !");
    await chargerHistoriqueSommeil();
};
// Calcule l'heure de coucher selon la fatigue/séance du jour
function calculerHeureCoucherOptimale(seanceDuJour) {
    let heureBase = 22; // 22h00 par défaut
    let minuteBase = 30; // 22h30

    // Si une séance lourde a été faite aujourd'hui (ex: Legday, Push intense, etc.)
    if (seanceDuJour && seanceDuJour.difficulte === "elevee") {
        // Besoin de 1h de sommeil en plus -> Coucher 45 min plus tôt
        minuteBase -= 45;
        if (minuteBase < 0) {
            minuteBase += 60;
            heureBase -= 1;
        }
    } else if (seanceDuJour && seanceDuJour.difficulte === "moyenne") {
        // Coucher 15 min plus tôt
        minuteBase -= 15;
        if (minuteBase < 0) {
            minuteBase += 60;
            heureBase -= 1;
        }
    }

    const hStr = String(heureBase).padStart(2, '0');
    const mStr = String(minuteBase).padStart(2, '0');
    return `${hStr}:${mStr}`;
}

// Fonction appelée pour transmettre l'heure de coucher finale à Android (Sketchware)
function programmerNotificationsNative(heureCoucher) {
    if (window.AndroidBridge) {
        // Envoie l'heure HH:mm au code Java Android
        window.AndroidBridge.programmerNotifications(heureCoucher);
    }
}