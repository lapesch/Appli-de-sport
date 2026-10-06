const BUTTON_IMAGES = {
    // Images du dashboard
    "parcours": "images/Parcours.jpg",
    "programmes": "images/Programmes.jpg",
    "evaluations": "images/Évaluations.jpg",
    "suivi": "images/Suivi.jpg",
    "graphiques": "images/Graphiques.jpg",
    "glossaire": "images/Glossaire.jpg",
    "materiel": "images/Matériel.jpg",
    "personnel": "images/Personnel.jpg",
    "autre": "images/Autre.jpg",

    // Image de secours
    "default": "images/default.jpg"
};

function applyButtonImages() {
    document.querySelectorAll('[data-img-ref]').forEach(el => {
        const ref = el.getAttribute('data-img-ref');
        const imgUrl = BUTTON_IMAGES[ref] || BUTTON_IMAGES['default'];
        if (imgUrl) {
            el.style.setProperty('--btn-bg', `url('${imgUrl}')`);
        }
    });
}

document.addEventListener("DOMContentLoaded", applyButtonImages);
