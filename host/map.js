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


window.resetMap = function () {
    for (let pin of mapPins) {
        map.removeLayer(pin);
    }
}

window.addMarker = function (latlng, text) {
    let pin = L.marker(latlng);
    pin.bindPopup(text);
    map.addLayer(pin);
    pin.setZIndexOffset(1000);
    mapPins.push(pin);
}
