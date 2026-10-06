// theme.js - À inclure sur TOUTES les pages
function appliquerThemeGlobal() {
    try {
        const userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
        if (userAnswers.currentTheme === "light") {
            document.body.classList.add("theme-light");
        } else {
            document.body.classList.remove("theme-light");
        }
    } catch (e) {
        console.error("Erreur lors de l'application du thème :", e);
    }
}

// S'exécute dès que la page a fini de charger son HTML
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", appliquerThemeGlobal);
} else {
    appliquerThemeGlobal();
}
