const map = L.map('map').setView([44.0, -76.5], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);


const MOCK_DATA = [
    {
        name: "Name",
        address: "Address",
        city: "Kingston",
        lat: 44.231298,
        lng: -76.481283,
        notes: "Sushi",
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