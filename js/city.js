// Lit l'URL pour savoir quelle ville afficher
// ex: city.html?ville=sao_paulo_2020
const params = new URLSearchParams(window.location.search);
const villeId = params.get('ville');

// Cache pour éviter de recharger le même fichier texte plusieurs fois
const textCache = {};

// Débloque le son iOS au premier toucher — invisible, aucune interruption
document.addEventListener('touchstart', () => {
    document.querySelectorAll('video').forEach(v => {
        if (v.closest('.parallax-video')) return;
        v.muted = false;
    });
}, { once: true });

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
        if (block.startsWith('<h1>') || block.startsWith('<h2>') || block.startsWith('<h3>')) return block;
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
    const [cityResponse, projectResponse] = await Promise.all([
        fetch(`data/${villeId}.json`),
        fetch(`data/project.json`)
    ]);
    const city = await cityResponse.json();
    const project = await projectResponse.json();

    // Titre du projet dans la langue de la ville (fallback: anglais)
    const projectTitle = project.title[city.lang] || project.title['en'];

    // Met à jour le titre et les meta SEO
    const pageTitle = `${city.name} — I knew you existed`;
    const pageDesc = `Queer stories from ${city.name}, ${city.year} — video, photo and text testimonies.`;
    const pageUrl = `https://VOTRE-DOMAINE.com/city.html?ville=${villeId}`;
    const pageImage = city.cover ? `https://VOTRE-DOMAINE.com/${city.media}${city.cover}` : `https://VOTRE-DOMAINE.com/media/og-cover.jpg`;

    document.title = pageTitle;
    document.querySelector('meta[name="description"]').setAttribute('content', pageDesc);
    document.querySelector('meta[property="og:title"]').setAttribute('content', pageTitle);
    document.querySelector('meta[property="og:description"]').setAttribute('content', pageDesc);
    document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl);
    document.querySelector('meta[property="og:image"]').setAttribute('content', pageImage);
    document.querySelector('meta[name="twitter:title"]').setAttribute('content', pageTitle);
    document.querySelector('meta[name="twitter:description"]').setAttribute('content', pageDesc);
    document.querySelector('meta[name="twitter:image"]').setAttribute('content', pageImage);

    // Récupère le conteneur principal
    const main = document.getElementById('city-content');

    // Traite chaque élément dans l'ordre — await garantit l'ordre même pour les textes
    for (const item of city.content) {

        if (item.type === 'image') {
            const spanClass = item.span ? ` grid-span-${item.span}` : '';
            main.insertAdjacentHTML('beforeend', `<img src="${city.media}${item.src}" alt="" loading="lazy" class="${spanClass.trim()}">`);
        }

        else if (item.type === 'video') {
            main.insertAdjacentHTML('beforeend', `<video data-src="${city.media}${item.src}" loop playsinline muted preload="metadata" disablepictureinpicture></video>`);
        }

        else if (item.type === 'parallax') {
            main.insertAdjacentHTML('beforeend', `
                <div class="parallax">
                    <div class="parallax-bg" style="background-image: url('${city.media}${item.src}')"></div>
                    <h1>${item.text || city.name}</h1>
                </div>`);
        }

        else if (item.type === 'parallax-video') {
            main.insertAdjacentHTML('beforeend', `
                <div class="parallax-video">
                    <video data-src="${city.media}${item.src}" loop playsinline muted preload="none" disablepictureinpicture></video>
                    <div class="text-overlay">
                        <h1>${item.text || projectTitle}</h1>
                    </div>
                </div>`);
        }

        else if (item.type === 'people-list') {
            const markdown = await fetchText(city.texts);
            const section = extractSection(markdown, 'people');
            const noms = section.split('\n')
                .map(n => n.trim())
                .filter(n => n !== '')
                .map(n => `<h3>${n}</h3>`)
                .join('');
            main.insertAdjacentHTML('beforeend', `<div class="people-list">${noms}</div>`);
        }

        else if (item.type === 'text') {
            const markdown = await fetchText(city.texts);
            const section = extractSection(markdown, item.id);
            const html = markdownToHtml(section);
            const cssClass = styleClass(item.style);
            main.insertAdjacentHTML('beforeend', `<div class="${cssClass}">${html}</div>`);
        }
    }

    // Lance le contrôle vidéo après que tout le contenu est chargé
    // Stocke le ratio de visibilité sur chaque vidéo pour pouvoir les comparer
    const ratios = new Map();

    const observer = new IntersectionObserver((entries) => {

        // 1. Lazy load / unload + mise à jour des ratios
        entries.forEach(entry => {
            const video = entry.target;
            const ratio = entry.intersectionRatio;

            if (ratio > 0 && video.dataset.src) {
                // Charge la vidéo au premier passage dans le viewport
                video.dataset.originalSrc = video.dataset.src;
                video.src = video.dataset.src;
                delete video.dataset.src;
            } else if (ratio === 0 && !video.dataset.src && video.dataset.originalSrc) {
                // Libère la RAM quand la vidéo est complètement hors écran
                video.pause();
                video.src = '';
                video.load();
                video.dataset.src = video.dataset.originalSrc;
            }

            ratios.set(video, ratio);
        });

        // 2. Trouver la vidéo la plus visible
        let bestVideo = null;
        let bestRatio = 0;
        ratios.forEach((ratio, video) => {
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestVideo = video;
            }
        });

        // 3. Jouer uniquement la plus visible, mettre les autres en pause
        ratios.forEach((ratio, video) => {
            if (video === bestVideo && bestRatio > 0) {
                video.volume = Math.min(bestRatio * 2, 1);
                video.play().catch(() => {});
            } else {
                video.pause();
                video.volume = 0;
            }
        });

    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] });

    // Observer principal : uniquement les vidéos normales (pas celles en position: fixed)
    document.querySelectorAll('video').forEach(video => {
        if (!video.closest('.parallax-video')) {
            observer.observe(video);
        }
    });

    // Observer séparé pour les sections parallax-video
    // On surveille la DIV (pas la vidéo) car la vidéo est en position: fixed
    document.querySelectorAll('.parallax-video').forEach(section => {
        const pvVideo = section.querySelector('video');
        if (!pvVideo) return;

        const pvObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (pvVideo.dataset.src) {
                        pvVideo.dataset.originalSrc = pvVideo.dataset.src;
                        pvVideo.src = pvVideo.dataset.src;
                        delete pvVideo.dataset.src;
                    }
                    pvVideo.play().catch(() => {});
                } else {
                    pvVideo.pause();
                    if (!pvVideo.dataset.src && pvVideo.dataset.originalSrc) {
                        pvVideo.src = '';
                        pvVideo.load();
                        pvVideo.dataset.src = pvVideo.dataset.originalSrc;
                    }
                }
            });
        });
        pvObserver.observe(section);

    });

    document.addEventListener('visibilitychange', () => {
        document.querySelectorAll('video').forEach(video => {
            if (video.closest('.parallax-video')) return; // géré par pvObserver
            if (video.dataset.src) return; // vidéo déchargée, on ne touche pas
            if (document.hidden) {
                video.pause();
            } else {
                video.play().catch(() => {});
            }
        });
    });
}

// Ajuste la taille du texte pour remplir exactement le conteneur
function fitText(overlay) {
    const h1 = overlay.querySelector('h1');
    if (!h1) return;

    // Mesure la largeur de chaque mot à 100px pour trouver le plus large
    const words = h1.textContent.trim().split(/\s+/);
    const span = document.createElement('span');
    span.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;';
    span.style.fontFamily = getComputedStyle(h1).fontFamily;
    span.style.fontWeight = getComputedStyle(h1).fontWeight;
    document.body.appendChild(span);

    let minRatio = Infinity;
    words.forEach(word => {
        span.style.fontSize = '100px';
        span.textContent = word;
        const ratio = overlay.clientWidth / span.offsetWidth;
        if (ratio < minRatio) minRatio = ratio;
    });
    document.body.removeChild(span);

    // Taille idéale : le mot le plus long remplit exactement la largeur
    let fontSize = 100 * minRatio;
    h1.style.fontSize = fontSize + 'px';

    // Si la hauteur déborde quand même, on réduit proportionnellement
    if (h1.scrollHeight > overlay.clientHeight) {
        fontSize *= overlay.clientHeight / h1.scrollHeight;
        h1.style.fontSize = fontSize + 'px';
    }
}

// Parallaxe desktop : translate la vidéo/photo à vitesse réduite pendant le scroll
// Sur mobile, c'est géré en CSS (position: fixed + clip-path) — on ne touche à rien.
function initDesktopParallax() {
    if (window.innerWidth < 768) return;

    const containers = document.querySelectorAll('.parallax-video, .parallax');
    if (!containers.length) return;

    function tick() {
        const vh = window.innerHeight;
        containers.forEach(container => {
            const rect = container.getBoundingClientRect();

            // progress : 0 = élément en bas du viewport, 1 = élément sorti en haut
            const total = vh + rect.height;
            const progress = 1 - (rect.top + rect.height) / total;

            // décalage ±60px — reste dans les ±20% d'espace supplémentaire du CSS
            const shift = (progress - 0.5) * 120;

            const inner = container.classList.contains('parallax-video')
                ? container.querySelector('video')
                : container.querySelector('.parallax-bg');

            if (inner) inner.style.transform = `translateY(${shift}px)`;
        });
    }

    window.addEventListener('scroll', tick, { passive: true });
    tick(); // position initiale
}

buildPage().then(() => {
    document.fonts.ready.then(() => {
        document.querySelectorAll('.parallax-video .text-overlay').forEach(fitText);
    });
    initDesktopParallax();
});

