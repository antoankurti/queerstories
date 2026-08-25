// POPUP WISHLIST
const wishlistPopup = document.createElement('div');
wishlistPopup.id = 'wishlist-popup';
wishlistPopup.innerHTML = `
    <div id="wishlist-popup-inner">
        <button id="wishlist-popup-close">✕</button>
        <h3 id="wishlist-popup-city"></h3>
        <p>To get there, the project needs access and support — a residency, a co-production, or an introduction to the community.</p>
        <a href="work.html">Make it happen →</a>
    </div>
`;
document.body.appendChild(wishlistPopup);

document.getElementById('wishlist-popup-close').addEventListener('click', () => {
    wishlistPopup.classList.remove('visible');
});

function openWishlistPopup(name) {
    document.getElementById('wishlist-popup-city').textContent = name;
    wishlistPopup.classList.add('visible');
}

// GRILLE DES VILLES
fetch('data/cities.json')
    .then(response => response.json())
    .then(cities => {
        const grid = document.getElementById('cities-grid');

        grid.innerHTML = cities.map(city => {
            if (city.status === 'visited') {
                return `
                    <div class="card-wrapper">
                        <section class="image city-visited">
                            <a href="city.html?ville=${city.id}">
                                <img src="${city.cover}" alt="${city.name}">
                            </a>
                        </section>
                        <p>${city.name}</p>
                    </div>`;
            }
            if (city.status === 'confirmed') {
                return `
                    <div class="card-wrapper">
                        <section class="image city-confirmed">
                            <a href="your-story.html">
                                <img src="${city.cover}" alt="${city.name}">
                            </a>
                        </section>
                        <p>${city.name}</p>
                    </div>`;
            }
            if (city.status === 'wishlist') {
                return `
                    <div class="card-wrapper" data-name="${city.name}">
                        <section class="image city-wishlist">
                            <img src="${city.cover}" alt="${city.name}">
                        </section>
                        <p>${city.name}</p>
                    </div>`;
            }
            return '';
        }).join('');

        // CLICK wishlist — ouvre le popup
        grid.querySelectorAll('.card-wrapper[data-name]').forEach(wrapper => {
            wrapper.addEventListener('click', () => openWishlistPopup(wrapper.dataset.name));
        });
    })
    .catch(() => {
        console.error('Impossible de charger data/cities.json');
    });
