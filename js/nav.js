fetch('data/nav.json')
    .then(response => response.json())
    .then(menu => {
        const headerNav = document.querySelector('header nav');
        menu.header.filter(lien => lien.visible !== false).forEach(lien => {
            const a = document.createElement('a');
            a.href = lien.href;
            a.textContent = lien.label;
            headerNav.appendChild(a);
            if (window.location.pathname.endsWith(lien.href)) {
                a.classList.add('active');
            }
        });

        const footer = document.querySelector('footer');
        if (footer) {
            const hr = document.createElement('div');
            hr.classList.add('hr');
            const p = document.createElement('p');
            p.textContent = menu.copyright;
            footer.appendChild(hr);
            footer.appendChild(p);
        }
    })
    .catch(() => {
        console.error('Impossible de charger data/nav.json');
    });
