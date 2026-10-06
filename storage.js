// storage.js
import { db, auth } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Récupère l'UID de l'utilisateur actuellement authentifié
 */
function obtenirUidConnecte() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

/**
 * Charge les données d'une collection Firestore associées à l'utilisateur connecté
 * @param {string} nomCollection - ex: "userAnswers", "userMaterials" ou "userMetrics"
 * @returns {Promise<Object>} Les données récupérées ou un objet vide
 */
export async function chargerDonneesCloud(nomCollection) {
    const uid = obtenirUidConnecte();
    if (!uid) {
        console.warn("Impossible de charger les données : Aucun utilisateur connecté.");
        return {};
    }

    try {
        const docRef = doc(db, nomCollection, uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return {};
    } catch (error) {
        console.error(`Erreur de chargement Cloud [${nomCollection}] :`, error);
        return {};
    }
}

/**
 * Sauvegarde ou fusionne les données dans Firestore pour l'utilisateur connecté
 * @param {string} nomCollection - ex: "userAnswers", "userMaterials" ou "userMetrics"
 * @param {Object} data - L'objet contenant les modifications
 */
export async function sauvegarderDonneesCloud(nomCollection, data) {
    const uid = obtenirUidConnecte();
    if (!uid) {
        alert("Action impossible : tu n'es pas connecté à ton compte.");
        return;
    }

    try {
        const docRef = doc(db, nomCollection, uid);
        await setDoc(docRef, data, { merge: true });
        console.log(`Données sauvegardées avec succès dans Firestore [${nomCollection}] !`);
    } catch (error) {
        console.error(`Erreur de sauvegarde Cloud [${nomCollection}] :`, error);
        alert("Erreur lors de l'enregistrement dans la base de données.");
    }
}
