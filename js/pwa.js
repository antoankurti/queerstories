// Affiche un hint d'installation pour les utilisateurs iOS (Safari uniquement)
// Android reçoit la bannière native du navigateur grâce au manifest.json

const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandalone = window.navigator.standalone === true;
const isDismissed = localStorage.getItem('pwa-hint-dismissed');

if (isIos && !isInStandalone && !isDismissed) {
    setTimeout(() => {
        const hint = document.getElementById('pwa-hint');
        if (hint) hint.classList.add('visible');
    }, 3000);
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#pwa-hint-close')) {
        const hint = document.getElementById('pwa-hint');
        if (hint) hint.classList.remove('visible');
        localStorage.setItem('pwa-hint-dismissed', '1');
    }
});
