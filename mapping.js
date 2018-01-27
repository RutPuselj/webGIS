var myData = jsonData;
// Create variable to hold map element, give initial settings to map
var map = L.map('map', {
    center: [44.4738, 16.4689],
    zoom: 7
});
// Add OpenStreetMap tile layer to map element
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);
// Add JSON to map
var cafes = L.geoJson(myData, {
    onEachFeature: function (feature, layer) {
        layer.bindPopup(feature.properties.f2);
    }
});

var pointA = new L.LatLng(28.635308, 77.22496);
var pointB = new L.LatLng(48.984461, 97.70641);
var pointList = [pointA, pointB];

var firstpolyline = new L.Polyline(pointList, {
    color: 'red',
    weight: 3,
    opacity: 1,
    smoothFactor: 1
});

$('#NekiNaslov').text('dkjkasjdkasjdkasjd');
var overlayMaps = {
    "Cafes": cafes,
    "Lines": firstpolyline
};
L.control.layers(null, overlayMaps).addTo(map);