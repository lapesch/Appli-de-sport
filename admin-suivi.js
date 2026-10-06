// Données simulées (En prod, cela viendrait de ta DB)
let listeMembres = [
    { id: 1, nom: "Tato", prenom: "Arthur", email: "arthur@gym.com" },
    { id: 2, nom: "Grayson", prenom: "Dick", email: "nightwing@bludhaven.com" }
];

function showSection(id) {
    document.querySelectorAll('.admin-panel').forEach(p => p.style.display = 'none');
    document.getElementById('section-' + id).style.display = 'block';
}

function afficherMembres() {
    const container = document.getElementById("members-list");
    container.innerHTML = "";
    listeMembres.forEach(m => {
        const card = document.createElement("div");
        card.style = "padding: 15px; background: var(--box-bg); border-radius: 8px; display: flex; justify-content: space-between; align-items: center;";
        card.innerHTML = `
            <span>${m.nom} ${m.prenom}</span>
            <button onclick="impersonner(${m.id})" style="background: #5865F2; border: none; padding: 8px 12px; border-radius: 6px; color: white; cursor: pointer;">👁️ Infiltrer</button>
        `;
        container.appendChild(card);
    });
}

function impersonner(id) {
    sessionStorage.setItem("adminImpersonatingId", id);
    window.location.href = "dashboard.html";
}
// Pour récupérer les infos de manière asynchrone (compatible Cloud)
async function initialiserMaPage() {
    const userId = "Arthur"; // Plus tard, ce sera l'ID de session de la personne connectée
    const profil = await loadUserData(userId);
    
    // Ton code pour afficher les données...
    document.getElementById("nom-joueur").innerText = profil.prenom || "Inconnu";
}

// Pour sauvegarder
async function validerFormulaire() {
    const userId = "Arthur";
    const nouvellesInfos = {
        prenom: "Arthur",
        poids: 80,
        age: 21
    };
    
    await saveUserData(userId, nouvellesInfos);
    alert("Enregistré !");
}



// Initialisation
document.addEventListener("DOMContentLoaded", afficherMembres);
document.getElementById("btn-back").onclick = () => window.location.href = "dashboard.html";
