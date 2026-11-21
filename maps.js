/* Interactieve routekaarten per dag (Leaflet + lokale GPX-bestanden). */
(function () {
  'use strict';
  if (!window.L) { return; }

  var ROUTES = {
    dag17: { tracks: [{ src: 'gpx/pontadesaolourenco.gpx', name: 'PR8 Ponta de São Lourenço' }] },
    dag18: { tracks: [{ src: 'gpx/veredadopicoruivo.gpx', name: 'PR1.2 naar Pico Ruivo' }],
             note: 'Het korte PR1-deel van Pico do Areeiro tot Pedra Rija heeft geen GPX: volg daar de borden.' },
    dag19: { tracks: [{ src: 'gpx/queimadascaldeiraoverde.gpx', name: 'PR9 Caldeirão Verde' }] },
    dag20: { tracks: [{ src: 'gpx/veredadosbalcoes.gpx', name: 'PR11 Balcões' },
                      { src: 'gpx/levadadorei.gpx', name: 'PR18 Levada do Rei' }] },
    dag21: { tracks: [{ src: 'gpx/rabacal25fontesrisco.gpx', name: '25 Fontes + Risco' },
                      { src: 'gpx/pr-6-2.gpx', name: 'PR6.2 Levada do Alecrim', option: true },
                      { src: 'gpx/pr-6-3.gpx', name: 'PR6.3 Lagoa do Vento', option: true }] },
    dag22: { tracks: [{ src: 'gpx/fanal.gpx', name: 'Fanal-rondwandeling' },
                      { src: 'gpx/pr-13.gpx', name: 'PR13 (enkele reis, optie)', option: true }] }
  };
  var COLORS = ['#d62828', '#1d4ed8', '#7c3aed'];
  var touch = window.matchMedia('(pointer: coarse)').matches;

  function haversine(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b[0] - a[0]) * toR, dLon = (b[1] - a[1]) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function parseGpx(text) {
    var doc = new DOMParser().parseFromString(text, 'application/xml');
    var segs = [];
    var segNodes = doc.getElementsByTagName('trkseg');
    if (!segNodes.length) { segNodes = doc.getElementsByTagName('rte'); }
    Array.prototype.forEach.call(segNodes, function (seg) {
      var pts = [];
      Array.prototype.forEach.call(seg.querySelectorAll('trkpt, rtept'), function (p) {
        var lat = parseFloat(p.getAttribute('lat')), lon = parseFloat(p.getAttribute('lon'));
        if (isFinite(lat) && isFinite(lon)) { pts.push([lat, lon]); }
      });
      if (pts.length > 1) { segs.push(pts); }
    });
    return segs;
  }

  function km(segs) {
    var d = 0;
    segs.forEach(function (s) { for (var i = 1; i < s.length; i++) { d += haversine(s[i - 1], s[i]); } });
    return d.toFixed(1).replace('.', ',') + ' km';
  }

  function baseLayers() {
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17, subdomains: 'abc',
      attribution: 'Kaart: © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA), data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    return { 'Topografisch': topo, 'Straatkaart': osm };
  }

  function build(fig) {
    var id = fig.getAttribute('data-day');
    var cfg = ROUTES[id];
    var el = fig.querySelector('.map');
    var legend = fig.querySelector('.legend');
    var status = fig.querySelector('.mapstatus');
    var layers = baseLayers();

    var map = L.map(el, {
      center: [32.75, -16.95], zoom: 10,
      layers: [layers['Topografisch']],
      dragging: !touch, tap: false, scrollWheelZoom: false,
      zoomSnap: 0.5
    });
    L.control.layers(layers, null, { position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    map.attributionControl.setPrefix(false);

    var group = L.featureGroup().addTo(map);
    var loaded = 0;

    cfg.tracks.forEach(function (t, i) {
      var color = COLORS[i % COLORS.length];
      var li = document.createElement('li');
      li.innerHTML = '<span class="swatch' + (t.option ? ' dashed' : '') + '" style="--c:' + color + '" aria-hidden="true"></span><span class="lname"></span> <span class="lkm muted"></span>';
      li.querySelector('.lname').textContent = t.name;
      legend.appendChild(li);

      fetch(t.src).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); }).then(function (txt) {
        var segs = parseGpx(txt);
        if (!segs.length) { throw new Error('leeg'); }
        L.polyline(segs, { color: '#fff', weight: 8, opacity: 0.85, interactive: false }).addTo(group);
        L.polyline(segs, { color: color, weight: 4.5, opacity: 0.95, dashArray: t.option ? '8 8' : null })
          .bindTooltip(t.name, { sticky: true }).addTo(group);
        var first = segs[0][0], lastSeg = segs[segs.length - 1], last = lastSeg[lastSeg.length - 1];
        L.circleMarker(first, { radius: 7, color: '#fff', weight: 3, fillColor: '#15803d', fillOpacity: 1 })
          .bindTooltip('Start: ' + t.name).addTo(group);
        if (haversine(first, last) > 0.15) {
          L.circleMarker(last, { radius: 7, color: '#fff', weight: 3, fillColor: '#111', fillOpacity: 1 })
            .bindTooltip('Einde: ' + t.name).addTo(group);
        }
        li.querySelector('.lkm').textContent = '· ' + km(segs) + ' volgens GPX';
      }).catch(function () {
        li.querySelector('.lkm').textContent = '· route kon niet worden geladen';
      }).then(function () {
        loaded++;
        if (loaded === cfg.tracks.length && group.getLayers().length) { fit(); }
      });
    });

    if (cfg.note) {
      var n = document.createElement('p');
      n.className = 'small muted';
      n.textContent = cfg.note;
      legend.parentNode.insertBefore(n, legend.nextSibling);
    }

    function fit() {
      if (group.getLayers().length) { map.fitBounds(group.getBounds(), { padding: [24, 24] }); }
    }

    // Volledig scherm (werkt ook op iPhone, zonder Fullscreen API)
    var fsBtn = fig.querySelector('[data-act="fs"]');
    var closeBtn = fig.querySelector('.mapclose');
    var isFs = false;
    function setFs(on, fromHistory) {
      if (on === isFs) { return; }
      isFs = on;
      fig.classList.toggle('is-fs', on);
      document.documentElement.classList.toggle('map-open', on);
      fsBtn.setAttribute('aria-pressed', String(on));
      fsBtn.querySelector('span').textContent = on ? 'Verkleinen' : 'Volledig scherm';
      closeBtn.hidden = !on;
      if (on) { map.dragging.enable(); } else if (touch) { map.dragging.disable(); }
      setTimeout(function () { map.invalidateSize(); }, 60);
      if (on) {
        closeBtn.focus();
        if (!fromHistory) { history.pushState({ mapfs: id }, ''); }
      } else {
        fsBtn.focus();
        if (!fromHistory && history.state && history.state.mapfs === id) { history.back(); }
      }
    }
    fsBtn.addEventListener('click', function () { setFs(!isFs); });
    closeBtn.addEventListener('click', function () { setFs(false); });
    fig.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isFs) { setFs(false); } });
    window.addEventListener('popstate', function () { if (isFs) { setFs(false, true); } });

    // Mijn locatie
    var me = null;
    fig.querySelector('[data-act="loc"]').addEventListener('click', function () {
      status.textContent = 'Locatie zoeken…';
      map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true, timeout: 15000 });
    });
    map.on('locationfound', function (e) {
      if (me) { group.removeLayer(me); map.removeLayer(me); }
      me = L.layerGroup([
        L.circle(e.latlng, { radius: e.accuracy, color: '#2563eb', weight: 1, fillOpacity: 0.12, interactive: false }),
        L.circleMarker(e.latlng, { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindTooltip('Jij bent hier')
      ]).addTo(map);
      status.textContent = 'Je locatie staat op de kaart (nauwkeurigheid ca. ' + Math.round(e.accuracy) + ' m).';
    });
    map.on('locationerror', function () {
      status.textContent = 'Locatie niet beschikbaar. Geef toestemming voor locatie of probeer het buiten opnieuw.';
    });

    fig.querySelector('[data-act="fit"]').addEventListener('click', fit);
  }

  var figs = document.querySelectorAll('.mapbox');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); build(e.target); }
      });
    }, { rootMargin: '400px 0px' });
    figs.forEach(function (f) { io.observe(f); });
  } else {
    figs.forEach(build);
  }
})();
