// exercices-catalogue.js
// Catalogue structuré des exercices : chaque entrée sait quel groupe musculaire
// elle travaille et quel matériel elle demande (les id doivent correspondre
// à ceux utilisés dans Bibliothèque_de_Matériel.html / userMaterials).
// "aucun" = exercice au poids du corps, toujours réalisable.
//
// C'est un simple tableau JS : ajoute, retire ou modifie une entrée directement
// si un exo ne te convient pas ou si un id de matériel ne correspond pas chez toi.

export const CATALOGUE_EXERCICES = [
    // --- PECS ---
    { id: "pompes_classiques", nom: "Pompes classiques", groupe: "pecs", equipementRequis: ["aucun"], seriesDefaut: 4, repsDefaut: 12 },
    { id: "developpe_couche_barre", nom: "Développé couché barre", groupe: "pecs", equipementRequis: ["barre_salle_rack", "banc_bench_press"], seriesDefaut: 4, repsDefaut: 8 },
    { id: "developpe_couche_halteres", nom: "Développé couché haltères", groupe: "pecs", equipementRequis: ["halteres_reglables", "banc_bench_press"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "ecarte_poulie_vis_a_vis", nom: "Écarté à la poulie vis-à-vis", groupe: "pecs", equipementRequis: ["poulie_vis_a_vis"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "pec_deck", nom: "Pec Deck / Butterfly", groupe: "pecs", equipementRequis: ["pec_deck"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "dips_pecs", nom: "Dips (buste penché en avant)", groupe: "pecs", equipementRequis: ["barre_traction"], seriesDefaut: 3, repsDefaut: 10 },

    // --- DOS ---
    { id: "tractions_pronation", nom: "Tractions pronation", groupe: "dos", equipementRequis: ["barre_traction"], seriesDefaut: 4, repsDefaut: 6 },
    { id: "tirage_vertical_poulie", nom: "Tirage vertical (Lat Pulldown)", groupe: "dos", equipementRequis: ["lat_pulldown"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "rowing_halteres", nom: "Rowing haltère un bras", groupe: "dos", equipementRequis: ["halteres_reglables"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "rowing_barre", nom: "Rowing barre", groupe: "dos", equipementRequis: ["barre_salle_rack"], seriesDefaut: 4, repsDefaut: 8 },
    { id: "tirage_horizontal_assis", nom: "Tirage horizontal assis (Seated Row)", groupe: "dos", equipementRequis: ["seated_row"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "superman_sol", nom: "Superman au sol", groupe: "dos", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 15 },

    // --- ÉPAULES ---
    { id: "developpe_militaire_halteres", nom: "Développé militaire haltères", groupe: "epaules", equipementRequis: ["halteres_reglables"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "elevations_laterales_halteres", nom: "Élévations latérales haltères", groupe: "epaules", equipementRequis: ["halteres_reglables"], seriesDefaut: 3, repsDefaut: 15 },
    { id: "pike_pushups", nom: "Pike push-ups", groupe: "epaules", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 12 },

    // --- BICEPS ---
    { id: "curl_halteres", nom: "Curl biceps haltères", groupe: "biceps", equipementRequis: ["halteres_reglables"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "curl_barre", nom: "Curl biceps barre", groupe: "biceps", equipementRequis: ["barre_salle_rack"], seriesDefaut: 3, repsDefaut: 10 },
    { id: "curl_bandes_elastiques", nom: "Curl biceps élastique", groupe: "biceps", equipementRequis: ["bandes_elastiques"], seriesDefaut: 3, repsDefaut: 15 },

    // --- TRICEPS ---
    { id: "dips_triceps_banc", nom: "Dips triceps sur banc", groupe: "triceps", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "extension_triceps_poulie", nom: "Extension triceps à la poulie", groupe: "triceps", equipementRequis: ["poulie_vis_a_vis"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "pompes_serrees", nom: "Pompes serrées (triceps)", groupe: "triceps", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 12 },

    // --- QUADRICEPS ---
    { id: "squats_poids_corps", nom: "Squats au poids du corps", groupe: "quadriceps", equipementRequis: ["aucun"], seriesDefaut: 4, repsDefaut: 15 },
    { id: "squat_barre", nom: "Squat barre", groupe: "quadriceps", equipementRequis: ["barre_salle_rack"], seriesDefaut: 4, repsDefaut: 8 },
    { id: "presse_a_cuisses", nom: "Presse à cuisses", groupe: "quadriceps", equipementRequis: ["leg_press"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "leg_extension", nom: "Leg Extension", groupe: "quadriceps", equipementRequis: ["leg_extension_salle"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "squat_guide_smith", nom: "Squat guidé (Smith Machine)", groupe: "quadriceps", equipementRequis: ["smith_machine"], seriesDefaut: 4, repsDefaut: 10 },
    { id: "hack_squat_machine", nom: "Hack Squat", groupe: "quadriceps", equipementRequis: ["hack_squat"], seriesDefaut: 4, repsDefaut: 10 },

    // --- ISCHIOS / FESSIERS ---
    { id: "fentes_poids_corps", nom: "Fentes au poids du corps", groupe: "ischios-fessiers", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "leg_curl", nom: "Leg Curl", groupe: "ischios-fessiers", equipementRequis: ["leg_curl_salle"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "hip_thrust_machine", nom: "Hip Thrust (machine)", groupe: "ischios-fessiers", equipementRequis: ["glute_drive"], seriesDefaut: 3, repsDefaut: 12 },
    { id: "souleve_de_terre_halteres", nom: "Soulevé de terre haltères", groupe: "ischios-fessiers", equipementRequis: ["halteres_reglables"], seriesDefaut: 4, repsDefaut: 8 },

    // --- MOLLETS ---
    { id: "mollets_debout_poids_corps", nom: "Mollets debout (poids du corps)", groupe: "mollets", equipementRequis: ["aucun"], seriesDefaut: 4, repsDefaut: 20 },

    // --- ABDOS ---
    { id: "gainage_planche", nom: "Gainage planche", groupe: "abdos", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 45 },
    { id: "crunchs", nom: "Crunchs", groupe: "abdos", equipementRequis: ["aucun"], seriesDefaut: 3, repsDefaut: 20 }
];