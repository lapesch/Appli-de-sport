/**
 * Gestionnaire de Mascotte et Gamification — Mon Carnet Sportif
 */

document.addEventListener('DOMContentLoaded', () => {
  chargerEtInitialiserMascotte();
});

function chargerEtInitialiserMascotte() {
  const activeProfile = JSON.parse(localStorage.getItem('activeProfile')) || {};
  const userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || {};
  
  // Clés d'historique de mesures.html
  const profileId = activeProfile.id || activeProfile.name || 'default';
  const metricsHistory = JSON.parse(localStorage.getItem(`metrics_history_${profileId}`)) 
                      || JSON.parse(localStorage.getItem('userMetrics')) 
                      || [];

  initialiserMascotte(activeProfile, userAnswers, metricsHistory);
}

function initialiserMascotte(profil, answers, metrics) {
  const textElem = document.getElementById('mascot-text');
  const btnElem = document.getElementById('btn-action-du-jour');
  if (!textElem) return;

  // 1. Recherche des données physiques dans toutes les sources possibles
  let age = answers.age || profil.age;
  let poids = answers.poids || profil.poids || profil.poidsKg;
  let taille = answers.taille || profil.taille || profil.tailleCm;

  // Fallback : recherche dans l'historique généré par mesures.html
  if (Array.isArray(metrics) && metrics.length > 0) {
    const derniereEntree = metrics[metrics.length - 1];
    if (derniereEntree && derniereEntree.values) {
      if (!poids) poids = derniereEntree.values.weight || derniereEntree.values.poids || derniereEntree.values.body_weight;
      if (!taille) taille = derniereEntree.values.height || derniereEntree.values.taille || derniereEntree.values.body_height;
    }
  }

  const elementsManquants = [];
  if (!age) elementsManquants.push('ton âge');
  if (!poids) elementsManquants.push('ton poids');
  if (!taille) elementsManquants.push('ta taille');

  const pageActuelle = window.location.pathname.split('/').pop();

  // --- ÉTAPE 1 : Si des mesures physiques manquent ---
  if (elementsManquants.length > 0) {
    const texteListe = elementsManquants.join(', ');
    textElem.innerHTML = `Il me manque <strong>${texteListe}</strong> ! Enregistre-les pour qu'on puisse adapter ton programme.`;
    
    if (btnElem) {
      btnElem.innerText = "📏 Saisir mes mesures";
      btnElem.onclick = () => {
        if (pageActuelle !== 'mesures.html') {
          window.location.href = 'mesures.html';
        }
      };
    }
    return;
  }

  // --- ÉTAPE 2 : Si le test de niveau n'est pas effectué ---
  // Vérification élargie de toutes les clés de validation possibles
  const testStateStorage = JSON.parse(localStorage.getItem('test_niveau_single_state') || '{}');
  const testFait = profil.testNiveauEffectue || 
                   answers.testNiveauEffectue || 
                   localStorage.getItem('test_niveau_effectue') === 'true' ||
                   localStorage.getItem('test_results') ||
                   testStateStorage.lastCompletedDate;

  if (!testFait) {
    const prenom = answers.prenom || profil.prenom || profil.nom || 'l\'athlète';
    textElem.innerHTML = `Salut <strong>${prenom}</strong> ! Passe ton test de niveau pour débloquer tes entraînements.`;
    
    if (btnElem) {
      btnElem.innerText = "📊 Passer le test de niveau";
      btnElem.onclick = () => {
        if (pageActuelle !== 'tests.html') {
          window.location.href = 'tests.html';
        }
      };
    }
    return;
  }

  // --- ÉTAPE 3 : Profil complet et test validé ---
  const prenom = answers.prenom || profil.prenom || profil.nom || '';
  if (pageActuelle === 'seance.html') {
    textElem.innerHTML = "Ne lâche rien sur tes séries ! Chaque rep compte pour gagner de l'XP !";
  } else if (pageActuelle === 'mes_programmes.html') {
    textElem.innerHTML = "Choisis ton entraînement du jour et fais exploser ton niveau !";
  } else if (pageActuelle === 'tests.html') {
    textElem.innerHTML = "Voici ton espace de tests & évaluations pour suivre tes perfs !";
  } else if (pageActuelle === 'mesures.html') {
    textElem.innerHTML = "Suis l'évolution de tes mensurations et de ton poids ici !";
  } else {
    textElem.innerHTML = `Ravi de te revoir <strong>${prenom}</strong> ! Prêt à accumuler de l'XP aujourd'hui ?`;
  }

  if (btnElem) {
    btnElem.innerText = "🚀 Démarrer l'entraînement";
    btnElem.onclick = () => window.location.href = 'mes_programmes.html';
  }
}

// Fonction de créditement d'XP après une séance
function crediterXpSeance(xpGagnee = 100) {
  let activeProfile = JSON.parse(localStorage.getItem('activeProfile')) || {};

  activeProfile.xpTotal = (activeProfile.xpTotal || 0) + xpGagnee;
  activeProfile.niveau = Math.floor(activeProfile.xpTotal / 500) + 1;

  const aujourdhui = new Date().toISOString().split('T')[0];
  if (activeProfile.derniereSeanceDate !== aujourdhui) {
    activeProfile.streakJours = (activeProfile.streakJours || 0) + 1;
    activeProfile.derniereSeanceDate = aujourdhui;
  }

  localStorage.setItem('activeProfile', JSON.stringify(activeProfile));

  if (typeof sauvegarderDonneesCloud === 'function') {
    sauvegarderDonneesCloud('userMetrics', activeProfile);
  }

  alert(`+${xpGagnee} XP ! Tu es maintenant niveau ${activeProfile.niveau} !`);
}
