const DEFAULT_CITY = {
    name: "Kingston",
    lat: 44.231298,
    lng: -76.481283,
    zoom: 8,
};

const map = L.map('map').setView([DEFAULT_CITY.lat, DEFAULT_CITY.lng], DEFAULT_CITY.zoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);


const MOCK_DATA = [
    {
        name: "Name",
        address: "Address",
        city: "Kingston",
        lat: 44.231298,
        lng: -76.481283,
        notes: "Other",
        visited_on: "2025-01-15",
    }
];

function plotRestaurants(places) {
    places.forEach(p => {
        L.marker([p.lat, p.lng])
            .addTo(map)
            .bindPopup(`
                <div class="popup">
                    <h3>${p.name}</h3>
                    ${p.address}, ${p.city}<br/>
                    ${p.notes ? `${p.notes}` : ''}
                </div>
            `);
    });

    if (places.length > 0) {
        map.fitBounds(places.map(p => [p.lat, p.lng]), { padding: [40, 40] });
    }
}


fetch('/api/restaurants')
    .then(r => r.json())
    .then(data => plotRestaurants(data))
    .catch(() => {
        console.warn('API not available, using mock data');
        plotRestaurants(MOCK_DATA);
    });