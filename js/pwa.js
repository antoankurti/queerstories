// ─── QR CODE DESKTOP ────────────────────────────────────────────────────────
// Génère un QR code pointant vers l'URL courante dans le popup desktop.
// qrcode.js est chargé depuis CDN (pas d'install nécessaire).

const desktopHint   = document.getElementById('desktop-hint');
const desktopClose  = document.getElementById('desktop-hint-close');
const desktopQrEl   = document.getElementById('desktop-hint-qr');

// Cache la popup si déjà fermée
if (desktopHint && localStorage.getItem('desktop-hint-dismissed')) {
    desktopHint.style.display = 'none';
}

// Génère le QR code une fois la lib chargée
if (desktopHint && desktopQrEl && !localStorage.getItem('desktop-hint-dismissed')) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.onload = () => {
        new QRCode(desktopQrEl, {
            text: window.location.href,
            width:  120,
            height: 120,
            colorDark:  '#14161a',   // --color-text
            colorLight: '#fafafa',   // --color-bg
        });
    };
    document.head.appendChild(script);
}

// Fermeture
if (desktopClose) {
    desktopClose.addEventListener('click', () => {
        if (desktopHint) desktopHint.style.display = 'none';
        localStorage.setItem('desktop-hint-dismissed', '1');
    });
}

// ─── HINT PWA iOS ────────────────────────────────────────────────────────────
// Android reçoit la bannière native du navigateur grâce au manifest.json

const isIos          = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandalone = window.navigator.standalone === true;
const isDismissed    = localStorage.getItem('pwa-hint-dismissed');

if (isIos && !isInStandalone && !isDismissed) {
    setTimeout(() => {
        const hint = document.getElementById('pwa-hint');
        if (hint) hint.classList.add('visible');

        const shareBtn = document.getElementById('pwa-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                alert('Tap the Share button in Safari (the box with an arrow), then choose "Add to Home Screen".');
            });
        }

        const closeBtn = document.getElementById('pwa-hint-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (hint) hint.classList.remove('visible');
                localStorage.setItem('pwa-hint-dismissed', '1');
            });
        }
    }, 200);
}
