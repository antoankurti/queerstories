fetch('data/cities.json')
    .then(response => response.json())
    .then(cities => {
        const grid = document.getElementById('cities-grid');
        // Construit le HTML en une seule passe — évite de reconstruire le DOM à chaque itération
        grid.innerHTML = cities.map(city => `
            <section class="image">
                <a href="city.html?ville=${city.id}">
                    <img src="${city.cover}" alt="${city.name}">
                    <p>${city.name}</p>
                </a>
            </section>
        `).join('');
    })
    .catch(() => {
        console.error('Impossible de charger data/cities.json');
    });
