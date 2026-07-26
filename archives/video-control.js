// Surveille chaque vidéo et gère play/pause + volume selon la visibilité
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        const ratio = entry.intersectionRatio; // 0 = hors écran, 1 = plein écran

        if (ratio === 0) {
            video.pause();
            video.volume = 0;
        } else {
            video.volume = ratio;
            video.play();
        }
    });
}, {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    // on surveille à chaque 10% de visibilité
});

// Applique l'observer à toutes les vidéos de la page
document.querySelectorAll('video').forEach(video => {
    video.muted = false;
    observer.observe(video);
});