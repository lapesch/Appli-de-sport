// analyse_continue.js — Analyse de la performance continue au fil des séances

/**
 * Calcule le volume total d'un exercice (Tonnage = séries * reps * charge)
 * @param {Array} series - Tableau des séries réalisées [{ reps: 10, charge: 20 }, ...]
 */
export function calculerVolumeExercice(series) {
    if (!series || !Array.isArray(series)) return 0;
    return series.reduce((total, s) => {
        const reps = Number(s.reps) || 0;
        const charge = Number(s.charge) || 0;
        // Si charge === 0 (ex: poid du corps), on compte juste le nombre total de reps
        return total + (charge > 0 ? reps * charge : reps);
    }, 0);
}

/**
 * Calcule le volume global et le nombre total de répétitions de la séance
 * @param {Array} exercices - Liste des exercices validés durant la séance
 */
export function analyserVolumeSeance(exercices) {
    let volumeTotalKg = 0;
    let repsTotales = 0;
    let seriesTotales = 0;

    exercices.forEach(exo => {
        if (exo.seriesEffectuees && Array.isArray(exo.seriesEffectuees)) {
            exo.seriesEffectuees.forEach(s => {
                const r = Number(s.reps) || 0;
                const c = Number(s.charge) || 0;
                repsTotales += r;
                volumeTotalKg += (r * c);
                seriesTotales++;
            });
        }
    });

    return {
        volumeTotalKg,
        repsTotales,
        seriesTotales
    };
}

/**
 * Compare la performance d'un exercice avec la séance précédente (Surcharge Progressive)
 * @param {Object} exoActuel - { nom, seriesEffectuees: [{reps, charge}] }
 * @param {Object} exoPrecedent - { nom, seriesEffectuees: [{reps, charge}] }
 */
export function verifierSurchargeProgressive(exoActuel, exoPrecedent) {
    if (!exoPrecedent) {
        return { statut: "NOUVEAU", message: "Première réalisation enregistrée." };
    }

    const volActuel = calculerVolumeExercice(exoActuel.seriesEffectuees);
    const volPrecedent = calculerVolumeExercice(exoPrecedent.seriesEffectuees);

    const diffVol = volActuel - volPrecedent;
    const diffPct = volPrecedent > 0 ? ((diffVol / volPrecedent) * 100).toFixed(1) : 0;

    let statut = "EGAL"; // Maintien
    if (diffVol > 0) statut = "PROGRESSION";
    else if (diffVol < 0) statut = "REGRESSION";

    return {
        statut,
        volActuel,
        volPrecedent,
        diffVol,
        diffPct: Number(diffPct)
    };
}

/**
 * Calcule le taux de réussite d'une séance (Séries prévues vs Séries réalisées)
 * @param {Array} exercices - Liste des exercices de la séance avec `seriesPrevues` et `seriesEffectuees`
 */
export function calculerCompletionSeance(exercices) {
    let seriesPrevuesCount = 0;
    let seriesRealiseesCount = 0;

    exercices.forEach(exo => {
        const prevues = Number(exo.series) || 3;
        const realisees = exo.seriesEffectuees ? exo.seriesEffectuees.length : 0;

        seriesPrevuesCount += prevues;
        seriesRealiseesCount += realisees;
    });

    const taux = seriesPrevuesCount > 0 
        ? Math.round((seriesRealiseesCount / seriesPrevuesCount) * 100) 
        : 0;

    return {
        tauxCompletion: Math.min(taux, 100),
        seriesPrevuesCount,
        seriesRealiseesCount
    };
}

/**
 * Suggère un ajustement pour la prochaine fois (Surcharge automatique)
 * @param {Array} seriesEffectuees - [{reps, charge}]
 * @param {number} targetReps - Reps cibles (ex: 10)
 */
export function suggereObjectifProchaineSeance(seriesEffectuees, targetReps) {
    if (!seriesEffectuees || seriesEffectuees.length === 0) return null;

    // Vérifie si toutes les séries ont atteint ou dépassé la cible de reps
    const toutesReussies = seriesEffectuees.every(s => Number(s.reps) >= targetReps);

    if (toutesReussies) {
        return {
            action: "AUGMENTER",
            conseil: "Objectif atteint sur toutes les séries ! Augmente la charge de 1 à 2 kg ou vise +1 à 2 reps la prochaine fois."
        };
    } else {
        return {
            action: "MAINTENIR",
            conseil: "Garde la même charge jusqu'à valider toutes tes répétitions proprement."
        };
    }
}