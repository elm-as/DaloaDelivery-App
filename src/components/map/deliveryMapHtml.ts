import { MAPBOX_PUBLIC_TOKEN } from '@daloa/config';

export interface MapDriverMarker {
  id: string;
  name: string;
  vehicle: string;
  rating: number;
  lat: number;
  lng: number;
}

export interface MapOrderMarker {
  id: string;
  netPrice: number;
  pickup: string;
  dropoff: string;
  lat: number;
  lng: number;
}

/** Centre de Daloa — le même repli que la carte web quand aucun point n'est connu. */
export const DALOA_CENTER = { lat: 6.8774, lng: -6.4502 };

const TILE_STREET = MAPBOX_PUBLIC_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_TOKEN}`
  : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

const TILE_SATELLITE = MAPBOX_PUBLIC_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_PUBLIC_TOKEN}`
  : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/**
 * Carte des courses, en Leaflet — la même bibliothèque, les mêmes tuiles et les
 * mêmes marqueurs que `DeliveryMap.tsx` côté web.
 *
 * React Native n'a pas de moteur cartographique natif dans ce projet ; plutôt que
 * d'introduire un rendu différent de celui du web (donc un deuxième comportement
 * à maintenir), on embarque la carte web telle quelle : WebView sur mobile,
 * iframe sur navigateur.
 */
export function buildDeliveryMapHtml(
  drivers: MapDriverMarker[],
  orders: MapOrderMarker[]
): string {
  const payload = JSON.stringify({
    drivers,
    orders,
    center: DALOA_CENTER,
    tileStreet: TILE_STREET,
    tileSatellite: TILE_SATELLITE,
    attribution: MAPBOX_PUBLIC_TOKEN ? '&copy; Mapbox' : '&copy; CARTO',
  }).replace(/</g, '\u003c');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" />
<style>
  /* Inter, la police du projet. La pile systeme ne sert que de repli si les
     Google Fonts ne repondent pas (mode hors ligne du serveur de dev). */
  html, body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #F1F5F9; }
  #layers {
    position: absolute; top: 12px; right: 12px; z-index: 1000;
    display: flex; align-items: center; gap: 6px;
    border: 1px solid #E2E8F0; border-radius: 12px;
    background: rgba(255, 255, 255, 0.95);
    padding: 7px 12px; font-size: 12px; font-weight: 800;
    color: #0F172A; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    cursor: pointer;
  }
  #layers:active { transform: scale(0.95); }
  .leaflet-popup-content { margin: 10px 12px; }
  .pop-title { font-weight: 800; color: #0F172A; font-size: 13px; }
  .pop-sub { color: #475569; font-size: 11px; margin-top: 2px; }
</style>
</head>
<body>
<div id="map"></div>
<button id="layers" type="button">&#128752; Satellite</button>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function () {
  var D = ${payload};

  var map = L.map('map', { zoomControl: false }).setView([D.center.lat, D.center.lng], 13);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  var mode = 'street';
  var tiles = L.tileLayer(D.tileStreet, { attribution: D.attribution, subdomains: 'abcd', maxZoom: 20 }).addTo(map);

  var btn = document.getElementById('layers');
  btn.addEventListener('click', function () {
    mode = mode === 'street' ? 'satellite' : 'street';
    map.removeLayer(tiles);
    tiles = L.tileLayer(mode === 'street' ? D.tileStreet : D.tileSatellite, {
      attribution: D.attribution, subdomains: 'abcd', maxZoom: 20
    }).addTo(map);
    btn.innerHTML = mode === 'street' ? '&#128752; Satellite' : '&#128506;&#65039; Plan HD';
  });

  var orderIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
  });

  var points = [];

  D.drivers.forEach(function (d) {
    if (isNaN(d.lat) || isNaN(d.lng)) return;
    points.push([d.lat, d.lng]);
    L.marker([d.lat, d.lng]).addTo(map).bindPopup(
      '<div class="pop-title">' + d.name + '</div>' +
      '<div class="pop-sub">' + d.vehicle + '</div>' +
      '<div class="pop-sub">&#9733; ' + d.rating.toFixed(1) + '</div>'
    );
  });

  D.orders.forEach(function (o) {
    if (isNaN(o.lat) || isNaN(o.lng)) return;
    points.push([o.lat, o.lng]);
    L.marker([o.lat, o.lng], { icon: orderIcon }).addTo(map).bindPopup(
      '<div class="pop-title">Course ' + o.netPrice + ' FCFA net</div>' +
      '<div class="pop-sub">De : ' + o.pickup + '</div>' +
      '<div class="pop-sub">&#192; : ' + o.dropoff + '</div>'
    );
  });

  if (points.length > 0) {
    var bounds = L.latLngBounds(points);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }

  setTimeout(function () { map.invalidateSize(); }, 250);
})();
</script>
</body>
</html>`;
}
