// Service worker: maakt de reisgids volledig offline bruikbaar.
var CACHE = 'madeira-v25';
var TILES = 'madeira-tiles';
var MAX_TILES = 4000;
var trimming = false;
function trimTiles(c) {
  if (trimming) { return; }
  trimming = true;
  c.keys().then(function (keys) {
    var extra = keys.length - MAX_TILES;
    return Promise.all(keys.slice(0, Math.max(0, extra)).map(function (k) { return c.delete(k); }));
  }).then(function () { trimming = false; }, function () { trimming = false; });
}
var FILES = ['./', 'index.html', 'style.css', 'app.js', 'maps.js', 'data/kaart.json', 'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css', 'vendor/leaflet/images/layers.png', 'vendor/leaflet/images/layers-2x.png', 'vendor/leaflet/images/marker-icon.png', 'vendor/leaflet/images/marker-icon-2x.png', 'vendor/leaflet/images/marker-shadow.png', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest', 'Madeira_reisgids_17-23_december_2026.pdf',
  'gpx/fanal.gpx', 'gpx/levadadorei.gpx', 'gpx/pontadesaolourenco.gpx', 'gpx/pr-1-tot-pedra-rija.gpx', 'gpx/uitbreiding-pico-do-furado.gpx', 'gpx/uitbreiding-caldeirao-do-inferno.gpx', 'gpx/pr-13.gpx', 'gpx/pr-15.gpx', 'gpx/pr-5.gpx', 'gpx/pr-6-2.gpx', 'gpx/pr-6-3.gpx', 'gpx/queimadascaldeiraoverde.gpx', 'gpx/rabacal25fontesrisco.gpx', 'gpx/veredadopicoruivo.gpx', 'gpx/veredadosbalcoes.gpx'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE && k !== TILES; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Eigen bestanden: netwerk eerst (altijd de nieuwste versie), cache als terugval.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') { return; }
  var url = new URL(req.url);
  // Kaarttegels: cache-first, zodat bekeken kaartdelen offline beschikbaar blijven.
  if (/(^|\.)tile\.(opentopomap|openstreetmap)\.org$/.test(url.hostname)) {
    e.respondWith(caches.open(TILES).then(function (c) {
      return c.match(req).then(function (hit) {
        if (hit) { return hit; }
        return fetch(req).then(function (res) {
          if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trimTiles(c); }
          return res;
        }).catch(function () { return new Response('', { status: 504 }); });
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) { return; }
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
  }));
});
