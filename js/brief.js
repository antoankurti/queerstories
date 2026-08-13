(async function () {
    const [briefRes, projectRes] = await Promise.all([
        fetch('data/brief.json'),
        fetch('data/project.json')
    ]);
    const data = await briefRes.json();
    const project = await projectRes.json();

    const siteUrl = project.url || 'https://www.votre-site.com';

    // Langue : paramètre URL > localStorage > 'en'
    const params = new URLSearchParams(window.location.search);
    let lang = params.get('lang') || localStorage.getItem('brief-lang') || 'en';
    if (!data.languages.find(l => l.code === lang)) lang = 'en';

    function t(obj) {
        return obj[lang] || obj['en'];
    }

    // Génère le QR une seule fois — canvas converti en data URL pour garantir l'impression
    function generateQR() {
        const container = document.getElementById('brief-qr');
        if (!container || typeof QRCode === 'undefined') return;
        container.innerHTML = '';

        const tempDiv = document.createElement('div');
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        document.body.appendChild(tempDiv);

        new QRCode(tempDiv, {
            text: siteUrl,
            width: 72,
            height: 72,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.M
        });

        // Attend le rendu canvas puis convertit en image inline
        setTimeout(() => {
            const canvas = tempDiv.querySelector('canvas');
            if (canvas) {
                const img = document.createElement('img');
                img.src = canvas.toDataURL('image/png');
                img.width = 72;
                img.height = 72;
                img.alt = siteUrl;
                container.appendChild(img);
            }
            document.body.removeChild(tempDiv);
        }, 100);
    }

    function render() {
        document.documentElement.lang = lang;
        localStorage.setItem('brief-lang', lang);

        // Liste de mots
        const wordList = `<div class="brief-word-list">
            <p>QUEER — GAY — LESBIAN — BISEXUAL — TRANS — NON-BINARY — PANSEXUAL — INTERSEX — ASEXUAL — FTM — DRAG</p>
            <p>HIV — AIDS — PrEP — UNDETECTABLE — UNTRANSMETTABLE — DRUGS — SEX WORK — ESCORT — CRUISING — KINK — HANDICAP</p>
            <p>COMMUNITY — CHOSEN FAMILY — RELIGION — POLITICS — MEMORY — VISIBILITY — DISCRETION — BODY — DESIRE — SHAME — PRIDE — JOY — FUTURE — LOVE</p>
        </div>`;

        // Titre traduit
        const title = `<article><h1>${t(data.projectTitle)}</h1></article>`;

        // Liens de langue
        const sortedLangs = [...data.languages].sort((a, b) => a.label.localeCompare(b.label));
        const switcher = `<nav class="brief-lang-switcher" aria-label="Language">${
            sortedLangs.map(l =>
                `<a class="brief-lang-link${l.code === lang ? ' active' : ''}" data-lang="${l.code}">${l.label}</a>`
            ).join('')
        }</nav>`;

        // Sections introductives
        const sections = data.sections.map(s => `
            <article>
                <h2>${t(s.title)}</h2>
                <p>${t(s.body)}</p>
            </article>
        `).join('');

        // Séparateur
        const separator = `<div class="brief-separator"></div>`;

        // Thèmes
        const themes = data.themes.map(th => `
            <article>
                <h2>${t(th.title)}</h2>
                <p>${t(th.questions).join('<br>')}</p>
            </article>
        `).join('');

        // Bouton impression
        const printLabel = { en: 'Print / PDF', fr: 'Imprimer / PDF', pt: 'Imprimir / PDF' };
        const printBtn = `<article><button class="brief-print-btn" onclick="window.print()">${printLabel[lang] || 'Print / PDF'}</button></article>`;

        document.getElementById('brief-content').innerHTML =
            wordList + title + switcher + sections + separator + themes + printBtn;

        document.querySelectorAll('.brief-lang-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                lang = link.dataset.lang;
                render();
            });
        });
    }

    render();

    // QR généré après chargement complet de la page
    if (document.readyState === 'complete') {
        generateQR();
    } else {
        window.addEventListener('load', generateQR);
    }
})();
