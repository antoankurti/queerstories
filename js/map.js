function initMap() {
    const map = new maplibregl.Map({
        container: 'map-container',
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [-46.657, -23.562],
        zoom: 8,
        attributionControl: { compact: true }
    });

    // ROTATION — désactivée (pinch-zoom mobile ne doit pas tourner la carte)
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();

    fetch('./data/cities-map.geojson')
        .then(response => response.json())
        .then(data => {
            const bounds = new maplibregl.LngLatBounds();
            data.features.forEach(f => bounds.extend(f.geometry.coordinates));
            map.fitBounds(bounds, {
                padding: { top: 40, bottom: 180, left: 20, right: 60 },
                // maxZoom: 4,
                duration: 6000
            });
        });

    map.on('load', () => {
        map.resize();

        // console.table(map.getStyle().layers.map(l => ({ id: l.id, type: l.type })));

        // COULEURS CSS
        const css = getComputedStyle(document.documentElement);
        const colorBg        = css.getPropertyValue('--color-bg').trim();
        const colorBgDark    = css.getPropertyValue('--color-bg-dark').trim();
        const colorPrimary   = css.getPropertyValue('--color-primary').trim();
        const colorSecondary = css.getPropertyValue('--color-secondary').trim();
        const colorPop       = css.getPropertyValue('--color-pop').trim();
        const colorAction    = css.getPropertyValue('--color-action').trim();

        // WATER
        map.setPaintProperty('water', 'fill-color', colorBg);
        map.setPaintProperty('water', 'fill-opacity', 0.75);

        ['water_name_point_label', 'water_name_line_label'].forEach(id => {
            map.setPaintProperty(id, 'text-color', colorSecondary);
        });

        // GROUND
        map.setPaintProperty('background', 'background-color', colorSecondary);
        map.setPaintProperty('background', 'background-opacity', 0.2);

        map.setPaintProperty('park', 'fill-color', colorSecondary);
        map.setPaintProperty('park', 'fill-opacity', 0.05);
        map.setLayoutProperty('park', 'visibility', 'none');

        map.setPaintProperty('building', 'fill-opacity', 0);
        map.setPaintProperty('landcover_wood', 'fill-opacity', 0);
        map.setPaintProperty('landuse_residential', 'fill-opacity', 0);

        // BORDERS
        ['boundary_2', 'boundary_3'].forEach(id => {
            map.setPaintProperty(id, 'line-color', colorSecondary);
            map.setPaintProperty(id, 'line-opacity', 0.5);
            map.setLayoutProperty(id, 'visibility', 'visible');
        });

        map.setPaintProperty('boundary_disputed', 'line-color', colorPop);

        // LABELS
        ['label_city_capital', 'label_country_3', 'label_country_2', 'label_country_1'].forEach(id => {
            map.setPaintProperty(id, 'text-color', colorBgDark);
            map.setPaintProperty(id, 'text-opacity', 0.18);
        });

        ['label_other', 'label_village', 'label_town', 'label_state', 'label_city'].forEach(id => {
            map.setPaintProperty(id, 'text-color', colorBgDark);
            map.setPaintProperty(id, 'text-opacity', 0.13);
        });

        // ROADS
        [
            'tunnel_motorway_casing',
            'tunnel_motorway_inner',
            'aeroway-taxiway',
            'aeroway-runway-casing',
            'aeroway-runway',
            'road_pier',
            'highway_path',
            'highway_minor',
            'highway_major_casing',
            'highway_major_inner',
            'highway_major_subtle',
            'highway_motorway_casing',
            'highway_motorway_inner',
            'highway_motorway_subtle',
            'railway_transit',
            'railway_transit_dashline',
            'railway_service',
            'railway_service_dashline',
            'railway',
            'railway_dashline',
            'highway_motorway_bridge_casing',
            'highway_motorway_bridge_inner'
        ].forEach(id => {
            map.setPaintProperty(id, 'line-color', colorBgDark);
            map.setPaintProperty(id, 'line-width', 0.2);
            map.setPaintProperty(id, 'line-opacity', 0.15);
            map.setLayoutProperty(id, 'visibility', 'visible');
        });

        // GEOJSON SOURCE
        map.addSource('villes', {
            type: 'geojson',
            data: './data/cities-map.geojson'
        });

        // LAYER — POINTS
        map.addLayer({
            id: 'villes-points',
            type: 'circle',
            source: 'villes',
            paint: {
                'circle-color': ['match', ['get', 'status'],
                    'visited',   colorPrimary,
                    'confirmed', colorBg,
                    colorAction
                ],
                'circle-radius': ['match', ['get', 'status'],
                    'confirmed', 2,
                    5
                ],
                'circle-stroke-color': ['match', ['get', 'status'],
                    'confirmed', colorPrimary,
                    'rgba(0,0,0,0)'
                ],
                'circle-stroke-width': 3,
            }
        });

        // LAYER — LABELS
        map.addLayer({
            id: 'ville-labels',
            type: 'symbol',
            source: 'villes',
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['literal', ['Noto Sans Regular']],
                'text-offset': [0.8, 0],
                'text-anchor': 'left',
                'text-size': 10
            },
            paint: {
                'text-color': ['match', ['get', 'status'],
                    'wishlist', colorAction,
                    colorPrimary
                ]
            }
        });

        // LAYER — ZONE DE CLIC INVISIBLE (agrandit la surface tactile mobile)
        map.addLayer({
            id: 'villes-hit',
            type: 'circle',
            source: 'villes',
            paint: {
                'circle-radius': 10,
                'circle-opacity': 0,
                'circle-stroke-width': 0
            }
        });

        // POPUP AU CLICK — zone hit + labels
        const openPopup = (e) => {
            const props = e.features[0].properties;
            new maplibregl.Popup()
                .setLngLat(e.lngLat)
                .addTo(map)
                .setHTML(createPopupHTML(props, {
                    primary: colorPrimary,
                    bg: colorBg,
                    action: colorAction
                }));
        };

        map.on('click', 'villes-hit', openPopup);
        map.on('click', 'ville-labels', openPopup);

        // CURSEUR
        ['villes-hit', 'ville-labels'].forEach(id => {
            map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
            map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
        });

        // LÉGENDE — SVG inline pour correspondre exactement aux cercles MapLibre
        const legend = document.createElement('div');
        legend.id = 'map-legend';
        legend.innerHTML = `
            <div class="legend-item">
                <svg width="10" height="10" viewBox="0 0 10 10" style="display:block;flex-shrink:0"><circle cx="5" cy="5" r="5" fill="${colorPrimary}"/></svg>
                Visited
            </div>
            <div class="legend-item">
                <svg width="10" height="10" viewBox="0 0 10 10" style="display:block;flex-shrink:0"><circle cx="5" cy="5" r="3.2" fill="${colorBg}" stroke="${colorPrimary}" stroke-width="3"/></svg>
                Next stop
            </div>
            <div class="legend-item">
                <svg width="10" height="10" viewBox="0 0 10 10" style="display:block;flex-shrink:0"><circle cx="5" cy="5" r="5" fill="${colorAction}"/></svg>
                Wishlist
            </div>
        `;
        document.getElementById('map-container').appendChild(legend);

    });
}

// --------------------------------------------------
window.addEventListener('load', initMap);
