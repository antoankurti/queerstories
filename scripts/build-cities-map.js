const fs = require('fs');

const raw = fs.readFileSync('data/cities.json', 'utf8');
const cities = JSON.parse(raw);


const features = cities.map(ville => {
    return {
    type: 'Feature',
    geometry: {
        type: 'Point',
        coordinates: [ville.lng, ville.lat]
    },
    properties: {
        id: ville.id,
        name: ville.name,
        status: ville.status,
        year: ville.year,
        cover: ville.cover
    }
};
});

const geojson = {
    type: 'FeatureCollection',
    features: features
};

fs.writeFileSync('data/cities-map.geojson', JSON.stringify(geojson, null, 2), 'utf8');