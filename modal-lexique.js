// Cache en mémoire pour éviter de recharger le fichier HTML à chaque clic
let docLexiqueCache = null;

/**
 * Charge la fiche d'un exercice et l'affiche dans la modale.
 * @param {string} idExercice - L'identifiant de la fiche (ex: 'rowing-unilateral' ou 'rowing_unilateral')
 */
async function ouvrirExplicationExercice(idExercice) {
    const contentBox = document.getElementById('modal-explication-content');
    const modal = document.getElementById('modal-explication');

    if (!contentBox || !modal) {
        console.error("Éléments HTML de la modale introuvables.");
        return;
    }

    contentBox.innerHTML = "<p style='color:#94a3b8; text-align:center;'>Chargement de la fiche...</p>";
    modal.classList.add('active');

    try {
        if (!docLexiqueCache) {
            const reponse = await fetch('lexique_exercices.html');
            if (!reponse.ok) throw new Error("Fichier lexique introuvable");
            const htmlTexte = await reponse.text();
            const parser = new DOMParser();
            docLexiqueCache = parser.parseFromString(htmlTexte, 'text/html');
        }

        const idFormatte = idExercice.replace(/_/g, '-');
        const fiche = docLexiqueCache.querySelector(`#sheet-${idExercice}`) || 
                      docLexiqueCache.querySelector(`#sheet-${idFormatte}`);

        if (!fiche) {
            contentBox.innerHTML = `
                <h3 style="color:#ef4444; margin-bottom:10px;">Fiche non trouvée</h3>
                <p style="color:#94a3b8;">La fiche d'explication pour cet exercice n'est pas encore disponible.</p>
            `;
            return;
        }

        const titre = fiche.querySelector('h2')?.outerHTML || `<h3>${idExercice}</h3>`;
        const blocsH3 = Array.from(fiche.querySelectorAll('h3'));
        
        const blocExecution = blocsH3.find(h => h.textContent.includes('Exécution'))?.parentElement;
        const blocMuscles = blocsH3.find(h => h.textContent.includes('Muscles'))?.parentElement;

        let htmlFinal = `<div style="border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px;">${titre}</div>`;

        if (blocExecution) htmlFinal += blocExecution.outerHTML;
        if (blocMuscles) htmlFinal += blocMuscles.outerHTML;

        if (!blocExecution && !blocMuscles) {
            htmlFinal += fiche.innerHTML;
        }

        contentBox.innerHTML = htmlFinal;

    } catch (erreur) {
        console.error("Erreur lors de la récupération du lexique :", erreur);
        contentBox.innerHTML = "<p style='color:#ef4444;'>Impossible de charger la fiche d'explication.</p>";
    }
}

function fermerModalExplication(event) {
    if (event.target.id === 'modal-explication') {
        document.getElementById('modal-explication').classList.remove('active');
    }
}

function fermerModalExplicationDirect() {
    document.getElementById('modal-explication').classList.remove('active');
}