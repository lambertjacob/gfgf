const DEFAULT_CITY = {
    name: "Kingston",
    lat: 44.231298,
    lng: -76.481283,
    zoom: 8,
};

const map = L.map('map').setView([DEFAULT_CITY.lat, DEFAULT_CITY.lng], DEFAULT_CITY.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

const icon = L.divIcon({
    className: '',
    html: `<div style="
        width: 18px; height: 18px;
        background: darkgreen;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12]
});

const MOCK_DATA = [
    {
        name: "Name",
        address: "Address",
        city: "Kingston",
        lat: 44.231298,
        lng: -76.481283,
        notes: "Other",
        visited_on: "2025-01-15",
        rating: "4.7"
    }
];

function renderStars(rating) {
    const numericRating = Number.parseFloat(rating);
    const clampedRating = Number.isFinite(numericRating)
        ? Math.max(0, Math.min(5, numericRating))
        : 0;
    const fillWidth = (clampedRating / 5) * 100;

    return `
        <span style="position: relative; display: inline-block; line-height: 1; vertical-align: middle;">
            <span style="opacity: 0.25;">★★★★★</span>
            <span style="position: absolute; left: 0; top: 0; white-space: nowrap; overflow: hidden; width: ${fillWidth}%;">★★★★★</span>
        </span>
    `;
}

function plotRestaurants(places) {
    places.forEach(p => {
        L.marker([p.lat, p.lng], { icon: icon })
            .addTo(map)
            .bindPopup(`
                <div class="popup">
                    <h3>${p.name}</h3>
                    <h4>${p.address}, ${p.city}</h4>
                    <div class="star-rating">${renderStars(p.rating)} ${p.rating ?? 0}</div>
                    <p>${p.notes ? p.notes : ''}</p>
                    <small>Last visited: ${p.visited_on}</small>
                </div>
            `);
    });

    if (places.length > 0) {
        map.fitBounds(places.map(p => [p.lat, p.lng]), { padding: [40, 40] });
    }
}


fetch('/restaurants_data/restaurants')
    .then(r => r.json())
    .then(data => plotRestaurants(data))
    .catch(() => {
        console.warn('API not available, using mock data');
        plotRestaurants(MOCK_DATA);
    });