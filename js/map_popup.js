function createPopupHTML(props, colors) {
    // selon props.status, retourne un HTML différent

    if (props.status === "visited") {
        return(`
            <div style="background:${colors.primary}; display:inline-block; overflow:hidden; line-height:0;">
            <img src="${props.cover}" class="popup-cover" />
            </div>        
            <h3>${props.name}</h3>
            <span>${props.year}</span>
            <a href="city.html?ville=${props.id}">Immerse into ${props.name} →</a>
            `);
        }
        
        else if (props.status === "confirmed") {
        return(`
            <h3>We are heading to ${props.name}.</h3>
            <p>The project is looking for queer people willing to share their experience of this city — in whatever form feels right.</p>
            <a href="your-story.html">Share your story →</a>
            `);
        }

        else if (props.status === "wishlist") {
        return(`
            <h3>${props.name} is next on the map.</h3>
            <p>To get there, the project needs access and support — a residency, a co-production, or an introduction to the community.</p>
            <a href="work.html">Make it happen →</a>
            `);
        }

        return null;
}