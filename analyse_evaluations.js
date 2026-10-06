// analyse_evaluations.js — Logique d'analyse dédiée aux évaluations / tests d'ancres

/**
 * Calcule la 1RM estimée selon la formule de Brzycki
 * @param {number} poid - Charge soulevée (kg)
 * @param {number} reps - Nombre de répétitions réalisées
 */
export function calculer1RM(poid, reps) {
    if (reps <= 0) return 0;
    if (reps === 1) return poid;
    // Formule de Brzycki : Charge / (1.0278 - (0.0278 * reps))
    return Math.round(poid / (1.0278 - (0.0278 * reps)));
}

/**
 * Compare deux évaluations d'un même exercice (ex: Tractions ou Pompes ancre)
 * @param {Object} ancienne - { date, charge, reps }
 * @param {Object} nouvelle - { date, charge, reps }
 */
export function comparerEvaluationExercice(ancienne, nouvelle) {
    const rmAncienne = calculer1RM(ancienne.charge || 0, ancienne.reps || 0);
    const rmNouvelle = calculer1RM(nouvelle.charge || 0, nouvelle.reps || 0);

    const diffRM = rmNouvelle - rmAncienne;
    const pctProgression = rmAncienne > 0 
        ? ((diffRM / rmAncienne) * 100).toFixed(1) 
        : 0;

    return {
        rmAncienne,
        rmNouvelle,
        diffRM,
        pctProgression: parseFloat(pctProgression),
        enProgression: diffRM > 0
    };
}

/**
 * Analyse le bilan global d'une session d'évaluation complète
 * @param {Array} exercicesEval - Liste des résultats des exercices [ { nom, charge, reps, objectifReps } ]
 */
export function analyserBilanEvaluation(exercicesEval) {
    let totalScore = 0;
    let exercicesReussis = 0;

    const details = exercicesEval.map(exo => {
        const rm = calculer1RM(exo.charge || 0, exo.reps);
        const reussi = exo.objectifReps ? exo.reps >= exo.objectifReps : true;
        
        if (reussi) exercicesReussis++;

        return {
            nom: exo.nom,
            reps: exo.reps,
            charge: exo.charge || 0,
            rmEstimee: rm,
            estAncre: exo.nom.toLowerCase().includes("[ancre]"),
            objectifAtteint: reussi
        };
    });

    const tauxReussite = Math.round((exercicesReussis / exercicesEval.length) * 100);

    return {
        date: new Date().toISOString().split("T")[0],
        tauxReussite,
        totalExercices: exercicesEval.length,
        exercicesReussis,
        details
    };
}

/**
 * Extrait l'historique de progression des exercices [ancre] à partir de la base
 * @param {Array} historiqueEvals - Tableau de toutes les évaluations passées
 */
export function extraireTendanceAncres(historiqueEvals) {
    const tendanceAncres = {};

    historiqueEvals.forEach(evalSession => {
        evalSession.details.forEach(exo => {
            if (exo.estAncre) {
                if (!tendanceAncres[exo.nom]) {
                    tendanceAncres[exo.nom] = [];
                }
                tendanceAncres[exo.nom].push({
                    date: evalSession.date,
                    rmEstimee: exo.rmEstimee,
                    reps: exo.reps,
                    charge: exo.charge
                });
            }
        });
    });

    return tendanceAncres;
}