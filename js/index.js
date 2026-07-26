fetch('data/cities.json')
    .then(response => response.json())
    .then(cities => {
        const grid = document.getElementById('cities-grid');

        cities.forEach(city => {
            grid.innerHTML += `
                <section class="image">
                    <a href="city.html?ville=${city.id}">
                        <img src="${city.cover}" alt="${city.name}">
                        <p>${city.name}</p>
                    </a>
                </section>
            `;
        });
    });