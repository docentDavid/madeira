// Service worker: maakt de reisgids volledig offline bruikbaar.
var CACHE = 'madeira-v2';
var FILES = ['./', 'index.html', 'style.css', 'app.js', 'icon.svg', 'manifest.webmanifest', 'Madeira_reisgids_17-23_december_2026.pdf',
  'gpx/fanal.gpx', 'gpx/levadadorei.gpx', 'gpx/pontadesaolourenco.gpx', 'gpx/pr-13.gpx', 'gpx/pr-15.gpx', 'gpx/pr-5.gpx', 'gpx/pr-6-2.gpx', 'gpx/pr-6-3.gpx', 'gpx/queimadascaldeiraoverde.gpx', 'gpx/rabacal25fontesrisco.gpx', 'gpx/veredadopicoruivo.gpx', 'gpx/veredadosbalcoes.gpx'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// Eigen bestanden: netwerk eerst (altijd de nieuwste versie), cache als terugval.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) { return; }
  e.respondWith(fetch(req).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
  }));
});
