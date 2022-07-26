let map = {}, mapOSM = {};

const line_vectors = new Set();
const delete_vectors = new Set();

function initMap() {
    document.querySelector('#map').innerHTML = '';

    map = new OpenLayers.Map("map",
    {
        zoomControl: !1,
        layerControl: !1,
        contextmenu: !0,
        worldCopyJump: !0
    });

    map.getControlsByClass('OpenLayers.Control.Navigation')
    .forEach(_ => _.disableZoomWheel());

    mapOSM = new OpenLayers.Layer.OSM();
    map.addLayer(mapOSM);
}

async function clearMap() {
    line_vectors.forEach(_ => setTimeout(async () => _.destroy()));
    line_vectors.clear();

    return initMap();

    line_vectors.forEach(_ => delete_vectors.add(_));
    line_vectors.clear();
    console.time('map clear');
    
    let i = 0;
    delete_vectors.forEach(async (vector) => {
        vector.destroy();
        
        if (delete_vectors.size === ++i) {
            console.timeEnd('map clear');

            delete_vectors.clear();
        }
    })

    return true;
}

function getLonLat(lon, lat) {
    return new OpenLayers.LonLat(lon, lat)
            .transform(
                new OpenLayers.Projection("EPSG:4326"), // переобразование в WGS 1984
                new OpenLayers.Projection("EPSG:900913") // переобразование проекции
            )
}

async function setMapCenter(coord) {
    const [lat, lon] = coord[0];

    return map.setCenter(getLonLat(lon, lat), 18);
}

async function showMapData(coords) {
    try {
        if (!Array.isArray(coords) || coords.length === 0) {
            return;
        }
        
        await clearMap();
        await setMapCenter(coords[0]);

        for (let i = 0; i < coords.length; i++) {
            line_vectors.add(drawLines(coords[i]));
        }

        map.addLayers([...line_vectors]);
    } catch (err) {
        console.error(err);
    }
}

function checkCoord(coord) {
    if (coord.length % 2 == 1) {
        coord.push(coord[0]);
    }

    return coord;
}

function formatCoord(coord) {
    coord = checkCoord(coord);

    const points = new Set();

    for (const _ of coord) {
        points.add(new OpenLayers.Geometry.Point(_[1], _[0]));
    }

    coord = [...points];

    return coord;
}

function drawLines(coord) {
    coord = formatCoord(coord);

    const Vector = new OpenLayers.Layer.Vector();
    const Features = new Set();

    while (coord.length) {
        Features.add(coord.splice(0, 2));
    }

    const result = new Set();
    
    Features.forEach(feature => {
        result.add(
            new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(feature)
                .transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    new OpenLayers.Projection("EPSG:900913")
                )
            )
        )
    })

    Vector.addFeatures([...result]);

    return Vector;
}
