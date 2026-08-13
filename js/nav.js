fetch('data/nav.json')
    .then(response => response.json())
    .then(menu => {
        const onBrief = window.location.pathname.endsWith('brief.html');

        // Sur brief.html : header masqué (document standalone, pas une page de l'app)
        if (onBrief) {
            const header = document.querySelector('header');
            if (header) header.style.display = 'none';
        }

        const headerNav = document.querySelector('header nav');
        menu.header.filter(lien => lien.visible !== false).forEach(lien => {
            const a = document.createElement('a');
            a.href = lien.href;
            a.textContent = lien.label;
            headerNav.appendChild(a);
            const isCurrent = window.location.pathname.endsWith(lien.href);
            if (isCurrent) {
                a.classList.add('active');
            }
        });

        const footer = document.querySelector('footer');
        if (footer) {
            const hr = document.createElement('div');
            hr.classList.add('hr');
            const p = document.createElement('p');
            p.textContent = menu.copyright;

            // Lien secret vers brief — absent sur brief.html lui-même
            if (!onBrief) {
                const secretLink = document.createElement('a');
                secretLink.href = 'brief.html';
                secretLink.target = '_blank';
                secretLink.rel = 'noopener';
                secretLink.classList.add('secret-link');
                secretLink.setAttribute('aria-hidden', 'true');
                secretLink.setAttribute('tabindex', '-1');
                p.appendChild(secretLink);
            }

            footer.appendChild(hr);
            footer.appendChild(p);
        }
    })
    .catch(() => {
        console.error('Impossible de charger data/nav.json');
    });
