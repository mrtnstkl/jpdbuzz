// We’ll add a OSM tile layer to our map
var osmUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
var osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib
});


// initialize the map on the "map" div with a given center and zoom
var map = L.map('map').setView([50, 10], 3).addLayer(osm);

var mapPin = null;

map.on('click', e => {
    if (window.buzzerLocked) {
        return;
    }
    if (mapPin) {
        map.removeLayer(mapPin);
    }
    mapPin = L.marker(e.latlng);
    map.addLayer(mapPin);
    mapPin.setZIndexOffset(1000);

    window.pinCoordinate = { lat: e.latlng.lat, lng: ((e.latlng.lng + 180) % 360) - 180 };
    console.log(window.pinCoordinate);
});

window.resetMap = function () {
    window.pinCoordinate = null;
    if (mapPin) {
        map.removeLayer(mapPin);
    }
}