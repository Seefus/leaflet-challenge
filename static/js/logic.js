// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    
    createFeatures(data.features);
  });
  
  function createFeatures(earthquakeData) {

    // Define a function to determine the marker size based on magnitude
    function markerSize(mag) {
        return mag * 4;  
    }

    // determine the color based on depth
    function markerColor(depth) {
        return depth > 90 ? 'red' :
               depth > 70 ? 'orange' :
               depth > 50 ? 'yellow' :
               depth > 30 ? 'green' :
               depth > 10 ? 'blue' :
                            'purple'; 
    }

    
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer with circle markers
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),  // Depth is the 3rd coordinate
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: onEachFeature
    });

    
    createMap(earthquakes);
}
  
  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -94.71
      ],
      zoom: 4.1,
      layers: [street, earthquakes]
    });
  

  // Set up the legend.
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let depthGrades = [0, 10, 30, 50, 70, 90];
    let colors = ['purple', 'blue', 'green', 'yellow', 'orange', 'red'];

    div.innerHTML = '<h4>Depth (km)</h4>';
    
    for (let i = 0; i < depthGrades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            depthGrades[i] + (depthGrades[i + 1] ? '&ndash;' + depthGrades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Adding the legend to the map
legend.addTo(myMap);
}
