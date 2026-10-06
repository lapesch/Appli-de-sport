// calcul_niveau.js — Calcul du niveau exercice par exercice

const BAREMES_EXERCICES = {
    "tractions": [
        { niveau: "Débutant", minReps: 0 },
        { niveau: "Intermédiaire", minReps: 5 },
        { niveau: "Avancé", minReps: 12 },
        { niveau: "Expert", minReps: 20 }
    ],
    "pompes": [
        { niveau: "Débutant", minReps: 0 },
        { niveau: "Intermédiaire", minReps: 12 },
        { niveau: "Avancé", minReps: 25 },
        { niveau: "Expert", minReps: 40 }
    ],
    "développé épaules": [
        { niveau: "Débutant", min1RM: 0 },
        { niveau: "Intermédiaire", min1RM: 15 },
        { niveau: "Avancé", min1RM: 25 },
        { niveau: "Expert", min1RM: 35 }
    ],
    "default": [
        { niveau: "Débutant", minReps: 0 },
        { niveau: "Intermédiaire", minReps: 8 },
        { niveau: "Avancé", minReps: 15 },
        { niveau: "Expert", minReps: 25 }
    ]
};

function estimer1RM(charge, reps) {
    if (!reps || reps <= 0) return 0;
    if (reps === 1) return charge;
    return Math.round(charge / (1.0278 - (0.0278 * reps)));
}

function nettoyerNomExercice(nom) {
    return nom.toLowerCase().replace(/\[ancre\]/g, "").trim();
}

/**
 * Recherche la meilleure perf dans les évaluations ponctuelles
 */
function trouverMeilleurePerfEvals(nomCible, historiqueEvals) {
    let meilleure = null;
    historiqueEvals.forEach(evalSession => {
        if (evalSession.details) {
            const exoEval = evalSession.details.find(e => nettoyerNomExercice(e.nom) === nomCible);
            if (exoEval && exoEval.reps > 0) {
                if (!meilleure || exoEval.reps > meilleure.reps) {
                    meilleure = { reps: Number(exoEval.reps), charge: Number(exoEval.charge) || 0 };
                }
            }
        }
    });
    return meilleure;
}

/**
 * Recherche la meilleure perf dans l'historique des séances de routine
 */
function trouverMeilleurePerfSeances(nomCible, historiqueSeances) {
    let maxReps = 0;
    let maxCharge = 0;
    let meilleur1RM = 0;

    historiqueSeances.forEach(seance => {
        if (!seance.exercices) return;
        seance.exercices.forEach(exo => {
            if (nettoyerNomExercice(exo.nom) === nomCible && exo.seriesEffectuees) {
                exo.seriesEffectuees.forEach(s => {
                    const r = Number(s.reps) || 0;
                    const c = Number(s.charge) || 0;
                    const rm = estimer1RM(c, r);

                    if (rm > meilleur1RM || (rm === meilleur1RM && r > maxReps)) {
                        meilleur1RM = rm;
                        maxReps = r;
                        maxCharge = c;
                    }
                });
            }
        });
    });

    return maxReps > 0 ? { reps: maxReps, charge: maxCharge } : null;
}

/**
 * Évalue le niveau d'un seul exercice selon une performance
 */
export function evaluerNiveauExercice(nomExercice, reps, charge = 0) {
    const clef = nettoyerNomExercice(nomExercice);
    const bareme = BAREMES_EXERCICES[clef] || BAREMES_EXERCICES["default"];
    const rm = estimer1RM(charge, reps);

    let niveauActuel = "Débutant";
    let indexNiveau = 0;

    for (let i = 0; i < bareme.length; i++) {
        const palier = bareme[i];
        const valide1RM = palier.min1RM !== undefined && rm >= palier.min1RM;
        const valideReps = palier.minReps !== undefined && reps >= palier.minReps;

        if (valide1RM || valideReps) {
            niveauActuel = palier.niveau;
            indexNiveau = i;
        }
    }

    const prochainPalier = bareme[indexNiveau + 1] || null;

    return {
        exercice: nomExercice,
        niveau: niveauActuel,
        palierIndex: indexNiveau + 1,
        rmEstimee: rm,
        meilleurePerf: { reps, charge },
        prochainObjectif: prochainPalier ? {
            niveauSuivant: prochainPalier.niveau,
            repsNécessaires: prochainPalier.minReps || null,
            charge1RMNécessaire: prochainPalier.min1RM || null
        } : "Niveau maximum atteint"
    };
}

/**
 * Calcule le niveau individuel de CHAQUE exercice
 * @param {Array<string>} listeExercices - Liste des noms d'exercices
 * @param {Array} historiqueEvals - Fiches des évaluations ponctuelles
 * @param {Array} historiqueSeances - Fiches des séances de routine
 * @param {string} modeAnalyse - 'evaluations' (par défaut) ou 'continu'
 */
export function analyserNiveauxTousLesExercices(
    listeExercices, 
    historiqueEvals = [], 
    historiqueSeances = [], 
    modeAnalyse = 'evaluations'
) {
    const resultatsParExercice = {};

    listeExercices.forEach(nomExo => {
        const nomCible = nettoyerNomExercice(nomExo);
        let meilleurePerf = null;
        let sourceData = "Aucune donnée";

        if (modeAnalyse === 'continu') {
            // Priority : Séances régulières -> Repli sur Évaluations
            meilleurePerf = trouverMeilleurePerfSeances(nomCible, historiqueSeances);
            if (meilleurePerf) {
                sourceData = "Séances en continu";
            } else {
                meilleurePerf = trouverMeilleurePerfEvals(nomCible, historiqueEvals);
                if (meilleurePerf) sourceData = "Évaluation (Repli)";
            }
        } else {
            // Mode 'evaluations' (Par défaut) : Priority Évaluations -> Repli sur Séances
            meilleurePerf = trouverMeilleurePerfEvals(nomCible, historiqueEvals);
            if (meilleurePerf) {
                sourceData = "Évaluation";
            } else {
                meilleurePerf = trouverMeilleurePerfSeances(nomCible, historiqueSeances);
                if (meilleurePerf) sourceData = "Séances en continu (Repli)";
            }
        }

        if (meilleurePerf) {
            resultatsParExercice[nomExo] = {
                ...evaluerNiveauExercice(nomExo, meilleurePerf.reps, meilleurePerf.charge),
                source: sourceData,
                modeAnalyse: modeAnalyse
            };
        } else {
            resultatsParExercice[nomExo] = {
                exercice: nomExo,
                niveau: "Non évalué",
                palierIndex: 0,
                source: sourceData,
                modeAnalyse: modeAnalyse,
                conseil: modeAnalyse === 'continu' 
                    ? "Enregistre des séances pour calculer ton niveau sur cet exercice."
                    : "Passe un test de niveau dédié pour débloquer ton rang sur cet exercice."
            };
        }
    });

    return resultatsParExercice;
}
