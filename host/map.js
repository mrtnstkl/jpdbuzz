// We’ll add a OSM tile layer to our map
var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib
});


// initialize the map on the "map" div with a given center and zoom
var map = L.map('map').setView([50, 10], 3).addLayer(osm);

var mapPins = [];
var hostPin = null;
var hostPinCoordinate = null;

var userSubmissions = new Map;

const hostPinIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

map.on('click', e => {
    if (hostPin) {
        map.removeLayer(hostPin);
    }
    hostPin = L.marker(e.latlng, { icon: hostPinIcon });
    map.addLayer(hostPin);
    hostPin.setZIndexOffset(1000);

    hostPinCoordinate = { lat: e.latlng.lat, lng: ((e.latlng.lng + 180) % 360) - 180 };
    calculateDistances();
});

function calculateDistances() {

    // source: https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
    const distanceInKmBetweenEarthCoordinates = (lat1, lon1, lat2, lon2) => {
        const degreesToRadians = degrees => { return degrees * Math.PI / 180; }
        var earthRadiusKm = 6371;
        var dLat = degreesToRadians(lat2 - lat1);
        var dLon = degreesToRadians(lon2 - lon1);
        lat1 = degreesToRadians(lat1);
        lat2 = degreesToRadians(lat2);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }

    const subList = document.getElementById('submissions-list');
    subList.innerHTML = "";
    console.log(userSubmissions);
    for (let [user, coord] of userSubmissions) {
        console.log(user, coord);
        if(hostPinCoordinate) {
            const distance = distanceInKmBetweenEarthCoordinates(hostPinCoordinate.lat, hostPinCoordinate.lng, coord.lat, coord.lng);
            subList.innerHTML += `<li> ${user}: ${distance > 1 ? distance.toFixed(2) + " km" : (distance * 1000).toFixed(0) + " m"} </li>`;
        } else {
            subList.innerHTML += `<li> ${user} </li>`;
        }
    }
}

window.resetMap = function () {
    userSubmissions.clear();
    for (let pin of mapPins) {
        map.removeLayer(pin);
    }
}

window.addMarker = function (latlng, user) {
    userSubmissions.set(user, latlng);
    let pin = L.marker(latlng);
    pin.bindPopup(user);
    map.addLayer(pin);
    pin.setZIndexOffset(1000);
    mapPins.push(pin);
    calculateDistances();
}
