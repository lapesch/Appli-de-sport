import { auth } from "./firebase-config.js";
import { chargerDonneesCloud, sauvegarderDonneesCloud } from "./storage.js";

const getProfile = () => sessionStorage.getItem("activeProfile") || "Principal";

/**
 * Calcul du 1RM estimé selon la formule d'Epley
 */
export function calculerMaxEstime(poids, reps) {
    if (poids <= 0 || reps <= 0) return 0;
    if (reps === 1) return poids;
    return Math.round(poids * (1 + reps / 30) * 10) / 10;
}

/**
 * Calcul de la suggestion de surcharge progressive selon le mode retenu
 */
export function calculerProchainObjectif(historique, mode = "continu") {
    if (!historique || historique.length === 0) return null;

    const dernierePerf = historique[historique.length - 1];

    if (mode === "evaluation") {
        // En mode évaluation : les ajustements n'ont lieu qu'après un test explicite
        const derniereEval = [...historique].reverse().find(p => p.isEvaluation);
        if (!derniereEval) return { poids: dernierePerf.poids, reps: dernierePerf.reps };

        if (derniereEval.reussi) {
            return {
                poids: Math.round((derniereEval.poids * 1.025) * 2) / 2, // +2,5%
                reps: derniereEval.reps
            };
        }
        return { poids: derniereEval.poids, reps: derniereEval.reps };
    }

    // Mode continu : Analyse séance par séance
    if (dernierePerf.reussi) {
        if (dernierePerf.reps >= 12) {
            return { poids: Math.round((dernierePerf.poids + 2) * 2) / 2, reps: 8 };
        }
        return { poids: dernierePerf.poids, reps: dernierePerf.reps + 1 };
    }

    return { poids: dernierePerf.poids, reps: dernierePerf.reps };
}

/**
 * Sauvegarde les performances d'une séance et met à jour les indicateurs de progression
 */
export async function enregistrerPerformances(seanceId, exercicesExecutes, modeProgression = "continu") {
    const profile = getProfile();
    const storageKey = `statsPerformances_${profile}`;

    let globalStats = JSON.parse(localStorage.getItem(storageKey)) || {};
    const dateIso = new Date().toISOString().split("T")[0];

    exercicesExecutes.forEach(item => {
        const { exerciceId, nomExercice, series, isEvaluation, reussi } = item;

        if (!globalStats[exerciceId]) {
            globalStats[exerciceId] = {
                nom: nomExercice,
                historique: [],
                prochainObjectif: null
            };
        }

        let volumeTotal = 0;
        let meilleurMax = 0;
        let repsTotales = 0;
        let maxPoids = 0;

        series.forEach(s => {
            const p = parseFloat(s.poids) || 0;
            const r = parseInt(s.reps) || 0;
            
            volumeTotal += p * r;
            repsTotales += r;
            if (p > maxPoids) maxPoids = p;

            const maxEstime = calculerMaxEstime(p, r);
            if (maxEstime > meilleurMax) meilleurMax = maxEstime;
        });

        const entreePerf = {
            date: dateIso,
            seanceId,
            poids: maxPoids,
            reps: repsTotales,
            volume: volumeTotal,
            maxEstime: meilleurMax,
            series,
            isEvaluation: Boolean(isEvaluation),
            reussi: reussi !== undefined ? reussi : true
        };

        globalStats[exerciceId].historique.push(entreePerf);

        globalStats[exerciceId].prochainObjectif = calculerProchainObjectif(
            globalStats[exerciceId].historique,
            modeProgression
        );
    });

    // Enregistrement local
    localStorage.setItem(storageKey, JSON.stringify(globalStats));

    // Synchronisation cloud
    if (auth.currentUser) {
        try {
            const cloudStats = await chargerDonneesCloud("statsPerformances") || {};
            cloudStats[profile] = globalStats;
            await sauvegarderDonneesCloud("statsPerformances", cloudStats);
        } catch (error) {
            console.error("Erreur de synchronisation des statistiques :", error);
        }
    }

    return globalStats;
}

/**
 * Récupère l'historique complet d'un exercice spécifique
 */
export function obtenirStatistiquesExercice(exerciceId) {
    const profile = getProfile();
    const globalStats = JSON.parse(localStorage.getItem(`statsPerformances_${profile}`)) || {};
    return globalStats[exerciceId] || null;
}