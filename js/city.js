// Lit l'URL pour savoir quelle ville afficher
// ex: city.html?ville=sao_paulo_2020
const params = new URLSearchParams(window.location.search);
const villeId = params.get('ville');

// Cache pour éviter de recharger le même fichier texte plusieurs fois
const textCache = {};

// Charge un fichier texte (avec cache)
function fetchText(src) {
    if (textCache[src]) return Promise.resolve(textCache[src]);
    return fetch(src)
        .then(r => r.text())
        .then(content => {
            textCache[src] = content;
            return content;
        });
}

// Extrait une section du fichier .md par son id (ex: "text_01")
// Les sections sont séparées par === au début d'une ligne
function extractSection(markdown, id) {
    const sections = markdown.split(/^=== /m);
    for (const section of sections) {
        if (section.startsWith(id)) {
            return section.replace(id, '').trim();
        }
    }
    return '';
}

// Convertit le markdown simplifié en HTML
function markdownToHtml(text) {
    // ### → <h3>, ## → <h2>, # → <h1>
    text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // *mot* → <span>mot</span>
    text = text.replace(/\*(.*?)\*/g, '<span>$1</span>');
    // Blocs séparés par ligne vide → <p>
    return text.split('\n\n').map(block => {
        block = block.trim();
        if (block === '') return '';
        if (block.startsWith('<h2>')) return block;
        return `<p>${block}</p>`;
    }).join('');
}

// Mappe le style sur la classe CSS correspondante
function styleClass(style) {
    if (style === 'narrative') return 'text-content';
    if (style === 'quote') return 'drama';
    if (style === 'highlight') return 'drama murder-story';
    return 'text-content';
}

async function buildPage() {
    const response = await fetch(`data/${villeId}.json`);
    const city = await response.json();

    // Met à jour le titre de la page
    document.title = `Queerstories — ${city.name}`;

    // Récupère le conteneur principal
    const main = document.getElementById('city-content');

    // Traite chaque élément dans l'ordre — await garantit l'ordre même pour les textes
    for (const item of city.content) {

        if (item.type === 'image') {
            main.innerHTML += `<img src="${city.media}${item.src}" alt="">`;
        }

        else if (item.type === 'video') {
            main.innerHTML += `<video src="${city.media}${item.src}" loop></video>`;
        }

        else if (item.type === 'parallax') {
            main.innerHTML += `
                <div class="paralax" style="background-image: url('${city.media}${item.src}')">
                    <h1>${city.name}</h1>
                </div>`;
        }

        else if (item.type === 'people-list') {
            const markdown = await fetchText(city.texts);
            const section = extractSection(markdown, 'people');
            const noms = section.split('\n')
                .map(n => n.trim())
                .filter(n => n !== '')
                .map(n => `<h3>${n}</h3>`)
                .join('');
            main.innerHTML += `<div class="peoples-names-list">${noms}</div>`;
        }

        else if (item.type === 'text') {
            const markdown = await fetchText(city.texts);
            const section = extractSection(markdown, item.id);
            const html = markdownToHtml(section);
            const cssClass = styleClass(item.style);
            main.innerHTML += `<div class="${cssClass}">${html}</div>`;
        }
    }

    // Lance le contrôle vidéo après que tout le contenu est chargé
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const ratio = entry.intersectionRatio;
            if (ratio === 0) {
                video.pause();
                video.volume = 0;
            } else {
                video.volume = Math.min(ratio * 2, 1);
                video.play().catch(() => {});
            }
        });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] });

    document.querySelectorAll('video').forEach(video => {
        observer.observe(video);
    });
}

buildPage();
