/* Interactieve routekaarten per dag (Leaflet + lokale GPX-bestanden). */
(function () {
  'use strict';
  if (!window.L) { return; }

  var ROUTES = {
    dag17: { tracks: [{ src: 'gpx/pontadesaolourenco.gpx', name: 'PR8 Ponta de São Lourenço' }],
             extras: [{ src: 'gpx/uitbreiding-pico-do-furado.gpx', name: 'Uitzichtpunt Pico do Furado' }] },
    dag18: { tracks: [{ src: 'gpx/pr-1-tot-pedra-rija.gpx', name: 'PR1 Areeiro → Pedra Rija' },
                      { src: 'gpx/veredadopicoruivo.gpx', name: 'PR1.2 naar Pico Ruivo' }],
             note: 'Het PR1-stuk is afgeknipt op 1,2 km (Pedra Rija); het eindpunt is bij benadering. Loop niet verder dan de afsluiting en volg de borden.' },
    dag19: { tracks: [{ src: 'gpx/queimadascaldeiraoverde.gpx', name: 'PR9 Caldeirão Verde' }],
             extras: [{ src: 'gpx/uitbreiding-caldeirao-do-inferno.gpx', name: 'Caldeirão do Inferno' }] },
    dag20: { tracks: [{ src: 'gpx/veredadosbalcoes.gpx', name: 'PR11 Balcões' },
                      { src: 'gpx/levadadorei.gpx', name: 'PR18 Levada do Rei' }] },
    dag21: { tracks: [{ src: 'gpx/rabacal25fontesrisco.gpx', name: '25 Fontes + Risco' }],
             extras: [{ src: 'gpx/pr-6-2.gpx', name: 'PR6.2 Levada do Alecrim' },
                      { src: 'gpx/pr-6-3.gpx', name: 'PR6.3 Lagoa do Vento' }] },
    dag22: { tracks: [{ src: 'gpx/fanal.gpx', name: 'Fanal-rondwandeling' }],
             extras: [{ src: 'gpx/pr-13.gpx', name: 'PR13 Vereda do Fanal (deel)' }] },
    dag23: { tracks: [] }
  };
  var EXT_COLORS = ['#c2410c', '#0f766e'];
  var DRIVE_COLOR = '#334155';
  var DRIVE_STYLE = {
    go: { color: DRIVE_COLOR, weight: 5, opacity: 0.95, dash: '10 7', cap: 'butt' },
    back: { color: '#6d28d9', weight: 5, opacity: 0.95, dash: '2 8', cap: 'round' },
    alt: { color: DRIVE_COLOR, weight: 4, opacity: 0.6, dash: '4 10', cap: 'butt' }
  };
  var DATA = fetch('data/kaart.json?v=23').then(function (r) { return r.json(); }).catch(function () { return null; });
  var built = {};
  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
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
    var driveGroup = L.featureGroup().addTo(map);
    var walksDone;
    var group = L.featureGroup().addTo(map);
    var sightGroup = L.featureGroup().addTo(map);
    L.control.layers(layers, { 'Wandelroutes': group, 'Autoritten': driveGroup, 'Bezienswaardigheden': sightGroup }, { position: 'topright' }).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    map.attributionControl.setPrefix(false);
    var loaded = 0;
    var sightMarkers = {};
    var resolveReady;
    var ready = new Promise(function (res) { resolveReady = res; });

    var list = cfg.tracks.map(function (t, i) { return { t: t, color: COLORS[i % COLORS.length] }; });
    (cfg.extras || []).forEach(function (t, i) { list.push({ t: t, ext: i + 1, color: EXT_COLORS[i % EXT_COLORS.length] }); });
    list.forEach(function (item) {
      var t = item.t, color = item.color, ext = item.ext;
      var li = document.createElement('li');
      li.innerHTML = (ext ? '<span class="extnum" style="--c:' + color + '" aria-hidden="true">' + ext + '</span>' : '') +
        '<span class="swatch' + (ext ? ' dashed' : '') + '" style="--c:' + color + '" aria-hidden="true"></span><span class="lname"></span> <span class="lkm muted"></span>';
      li.querySelector('.lname').textContent = ext ? 'Uitbreiding ' + ext + ': ' + t.name : t.name;
      legend.appendChild(li);

      fetch(t.src).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.text(); }).then(function (txt) {
        var segs = parseGpx(txt);
        if (!segs.length) { throw new Error('leeg'); }
        L.polyline(segs, { color: '#fff', weight: 8, opacity: 0.85, interactive: false }).addTo(group);
        L.polyline(segs, { color: color, weight: 4.5, opacity: 0.95, dashArray: ext ? '10 8' : null })
          .bindTooltip(ext ? 'Uitbreiding ' + ext + ': ' + t.name : t.name, { sticky: true }).addTo(group);
        if (ext) {
          var flatPts = [].concat.apply([], segs);
          L.marker(flatPts[Math.floor(flatPts.length / 2)], {
            keyboard: false, title: 'Uitbreiding ' + ext + ': ' + t.name,
            icon: L.divIcon({ className: 'extmark', html: '<span class="extnum" style="--c:' + color + '">' + ext + '</span>', iconSize: [28, 28], iconAnchor: [14, 14] })
          }).addTo(group);
        }
        var first = segs[0][0], lastSeg = segs[segs.length - 1], last = lastSeg[lastSeg.length - 1];
        if (!ext) {
          L.circleMarker(first, { radius: 7, color: '#fff', weight: 3, fillColor: '#15803d', fillOpacity: 1 })
            .bindTooltip('Start: ' + t.name).addTo(group);
        }
        if (!ext && haversine(first, last) > 0.15) {
          L.circleMarker(last, { radius: 7, color: '#fff', weight: 3, fillColor: '#111', fillOpacity: 1 })
            .bindTooltip('Einde: ' + t.name).addTo(group);
        }
        li.querySelector('.lkm').textContent = '· ' + km(segs) + (ext ? ' enkele reis' : '') + ' volgens GPX';
      }).catch(function () {
        li.querySelector('.lkm').textContent = '· route kon niet worden geladen';
      }).then(function () {
        loaded++;
        if (loaded === list.length) { walksDone(); }
      });
    });

    // Autoritten en bezienswaardigheden uit data/kaart.json
    var dataDone = DATA.then(function (data) {
      if (!data) { return; }
      (data.days[id] || []).forEach(function (d) {
        var kind = d.alt ? 'alt' : (/^Terugrit/.test(d.label) ? 'back' : 'go');
        var st = DRIVE_STYLE[kind];
        L.polyline(d.line, { color: '#fff', weight: kind === 'alt' ? 7 : 9, opacity: kind === 'alt' ? 0.6 : 0.9, interactive: false }).addTo(driveGroup);
        L.polyline(d.line, { color: st.color, weight: st.weight, opacity: st.opacity, dashArray: st.dash, lineCap: st.cap })
          .bindTooltip((d.alt ? 'Optie – ' : 'Autorit – ') + d.label + ': ca. ' + d.km.toString().replace('.', ',') + ' km, ' + d.min + ' min', { sticky: true }).addTo(driveGroup);
        var li = document.createElement('li');
        li.innerHTML = '<span class="swatch drive ' + kind + '" aria-hidden="true"></span><span class="lname"></span> <span class="lkm muted"></span>';
        li.querySelector('.lname').textContent = (d.alt ? 'Optie: ' : 'Autorit: ') + d.label.charAt(0).toLowerCase() + d.label.slice(1);
        li.querySelector('.lkm').textContent = '· ca. ' + d.km.toString().replace('.', ',') + ' km, ' + d.min + ' min';
        legend.appendChild(li);
      });
      if (data.routeNotes && data.routeNotes[id]) {
        var rn = document.createElement('p');
        rn.className = 'mapnote routenote';
        rn.innerHTML = '<strong>Heen en terug:</strong> ';
        rn.appendChild(document.createTextNode(data.routeNotes[id]));
        var hint = fig.querySelector('.maphint');
        hint.parentNode.insertBefore(rn, hint);
      }
      var usesBase = (data.days[id] || []).some(function (d) { return d.stops.indexOf('ribeirabrava') !== -1; });
      if (usesBase && data.places.ribeirabrava) {
        L.marker(data.places.ribeirabrava.ll, {
          title: 'Ribeira Brava (accommodatie)', keyboard: false,
          icon: L.divIcon({ className: 'extmark', html: '<span class="placepin airport home" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7v9H15v-6H9v6H3z"/></svg></span>', iconSize: [30, 30], iconAnchor: [15, 15] })
        }).bindTooltip('Ribeira Brava (accommodatie)').addTo(driveGroup);
      }
      if ((id === 'dag17' || id === 'dag23') && data.places.airport) {
        L.marker(data.places.airport.ll, {
          title: 'Luchthaven (autoverhuur)', keyboard: false,
          icon: L.divIcon({ className: 'extmark', html: '<span class="placepin airport" aria-hidden="true">✈</span>', iconSize: [30, 30], iconAnchor: [15, 15] })
        }).bindTooltip('Luchthaven (autoverhuur)').addTo(driveGroup);
      }
      var keys = (data.sights && data.sights[id]) || [];
      keys.forEach(function (key) {
        var pl = data.places[key]; if (!pl) { return; }
        var item = document.querySelector('#' + id + ' [data-stop="' + key + '"]');
        var desc = item ? (item.querySelector('.stop-name + p') || {}).textContent || '' : '';
        var link = item ? item.querySelector('a.ext') : null;
        var html = '<strong></strong><p></p>' + (link ? '<a class="ext" target="_blank" rel="noopener">Open in Google Maps</a>' : '');
        var box = document.createElement('div'); box.className = 'popup'; box.innerHTML = html;
        box.querySelector('strong').textContent = pl.name;
        box.querySelector('p').textContent = desc;
        if (link) { box.querySelector('a').href = link.href; }
        sightMarkers[key] = L.marker(pl.ll, {
          title: pl.name, keyboard: false, riseOnHover: true,
          icon: L.divIcon({ className: 'extmark', html: '<span class="placepin">' + PIN + '</span>', iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -14] })
        }).bindPopup(box, { maxWidth: 210, autoPanPaddingTopLeft: L.point(64, 24), autoPanPaddingBottomRight: L.point(24, 40) }).bindTooltip(pl.name, { direction: 'top', offset: [0, -14] }).addTo(sightGroup);
      });
      if (keys.length) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="placepin small" aria-hidden="true">' + PIN + '</span><span class="lname">Bezienswaardigheden (zie Hierna nog zien)</span>';
        legend.appendChild(li);
      }
    });

    var walkReady = list.length ? new Promise(function (res) { walksDone = res; }) : Promise.resolve();
    Promise.all([walkReady, dataDone]).then(function () { fitAll(); resolveReady(); });

    if (cfg.note) {
      var n = document.createElement('p');
      n.className = 'mapnote';
      n.textContent = cfg.note;
      legend.parentNode.insertBefore(n, legend.nextSibling);
    }

    var FIT = { paddingTopLeft: [28, 28], paddingBottomRight: [28, 56] };
    function fit() {
      if (group.getLayers().length) { map.fitBounds(group.getBounds(), FIT); }
    }
    function fitAll() {
      var b = L.latLngBounds([]);
      [group, driveGroup, sightGroup].forEach(function (g) { if (map.hasLayer(g) && g.getLayers().length) { b.extend(g.getBounds()); } });
      if (b.isValid()) { map.fitBounds(b, FIT); } else { fit(); }
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
      fsBtn.querySelector('span').textContent = on ? 'Verkleinen' : 'Groot scherm';
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

    var fitBtn = fig.querySelector('[data-act="fit"]');
    if (fitBtn) { fitBtn.addEventListener('click', fit); }
    fig.querySelector('[data-act="all"]').addEventListener('click', fitAll);

    return {
      showStop: function (key) {
        return ready.then(function () {
          var m = sightMarkers[key]; if (!m) { return; }
          if (!map.hasLayer(sightGroup)) { map.addLayer(sightGroup); }
          fig.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
          setTimeout(function () { map.invalidateSize(); map.setView(m.getLatLng(), 14, { animate: false }); map.panBy([0, -70], { animate: false }); m.openPopup(); }, 450);
        });
      }
    };
  }

  function ensure(fig) {
    var id = fig.getAttribute('data-day');
    if (!built[id]) { built[id] = build(fig); }
    return built[id];
  }

  // Knop "Toon op kaart" bij iedere bezienswaardigheid
  document.querySelectorAll('[data-stop]').forEach(function (item) {
    var day = item.closest('.day'); if (!day) { return; }
    var fig = day.querySelector('.mapbox'); if (!fig) { return; }
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'showmap';
    btn.innerHTML = PIN + '<span>Toon op routekaart</span>';
    var name = item.querySelector('.stop-name');
    btn.setAttribute('aria-label', 'Toon ' + (name ? name.firstChild.textContent.trim() : '') + ' op de routekaart');
    btn.addEventListener('click', function () { ensure(fig).showStop(item.getAttribute('data-stop')); });
    item.appendChild(btn);
  });

  var figs = document.querySelectorAll('.mapbox');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); ensure(e.target); }
      });
    }, { rootMargin: '400px 0px' });
    figs.forEach(function (f) { io.observe(f); });
  } else {
    figs.forEach(ensure);
  }
})();
