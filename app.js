(function () {
  'use strict';

  // Testfunctie: simuleer een datum met ?datum=JJJJ-MM-DD (bijv. ?datum=2026-12-23).
  function simDate() {
    var m = /[?&]datum=(\d{4})-(\d{2})-(\d{2})/.exec(location.search);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date();
  }

  // 1. Checklist: bewaar vinkjes lokaal op dit apparaat.
  var PREFIX = 'madeira-2026-';
  var boxes = document.querySelectorAll('input[data-save]');
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  boxes.forEach(function (box) {
    var key = PREFIX + box.getAttribute('data-save');
    box.checked = load(key) === '1';
    box.addEventListener('change', function () { store(key, box.checked ? '1' : '0'); });
  });
  var reset = document.getElementById('reset');
  var status = document.getElementById('reset-status');
  if (reset) {
    reset.addEventListener('click', function () {
      boxes.forEach(function (box) { box.checked = false; store(PREFIX + box.getAttribute('data-save'), '0'); });
      if (status) { status.textContent = 'Alle vinkjes zijn gewist.'; }
    });
  }

  // 2. "Vandaag"-melding tijdens de reis.
  var d = simDate();
  var today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  var day = document.querySelector('.day[data-date="' + today + '"]');
  var banner = document.getElementById('vandaag');
  if (day && banner) {
    day.classList.add('is-today');
    var title = day.querySelector('h2').textContent;
    banner.innerHTML = 'Vandaag op het programma: <a href="#' + day.id + '"></a>';
    banner.querySelector('a').textContent = title;
    banner.hidden = false;
  }

  // 2b. Offline: service worker registreren en verbindingsstatus tonen.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function () {
      var ready = document.getElementById('offline-ready');
      if (ready) { ready.hidden = false; }
    }).catch(function () {});
  }
  var off = document.getElementById('offline-status');
  function updateOnline() {
    if (!off) { return; }
    off.hidden = navigator.onLine;
    off.textContent = navigator.onLine ? '' : 'Je bent offline. De gids en GPX-bestanden werken gewoon; kaartlinks hebben internet nodig.';
  }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  // 3. Actieve dag + actieve tab markeren.
  var dayLinks = Array.prototype.slice.call(document.querySelectorAll('.daynav a'));
  var tabLinks = Array.prototype.slice.call(document.querySelectorAll('.tabbar a'));
  var tabDagen = document.getElementById('tab-dagen');
  if (day && tabDagen) { tabDagen.setAttribute('href', '#' + day.id); }
  var sections = ['overzicht', 'dag17', 'dag18', 'dag19', 'dag20', 'dag21', 'dag22', 'dag23', 'checklist', 'extra']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  function groupOf(id) {
    if (/^dag/.test(id)) { return 'dagen'; }
    if (id === 'checklist' || id === 'extra') { return id; }
    return 'top';
  }
  function update() {
    var line = window.innerHeight * 0.35;
    var current = 'top';
    sections.forEach(function (sec) { if (sec.getBoundingClientRect().top <= line) { current = sec.id; } });
    dayLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current) { a.setAttribute('aria-current', 'true'); } else { a.removeAttribute('aria-current'); }
    });
    var g = groupOf(current);
    tabLinks.forEach(function (a) {
      if (a.getAttribute('data-tab') === g) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; update(); }); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();

  // 3c. Licht/donker-schakelaar (keuze wordt op dit apparaat onthouden)
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() { var t = root.getAttribute('data-theme'); return t ? t === 'dark' : sysDark.matches; }
  function syncTheme() {
    if (toggle) { toggle.setAttribute('aria-pressed', String(isDark())); }
    if (meta) { meta.setAttribute('content', isDark() ? '#17332b' : '#1d4d3c'); }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('madeira-theme', next); } catch (e) {}
      syncTheme();
    });
  }
  if (sysDark.addEventListener) { sysDark.addEventListener('change', syncTheme); }
  syncTheme();

  // 3c. Weer per dag. Ligt de dag binnen 16 dagen, dan halen we de verwachting op bij
  //     Open-Meteo (gratis, zonder sleutel). Anders blijft het normaal voor de tijd van het
  //     jaar staan. De laatste verwachting wordt bewaard, zodat hij ook offline zichtbaar is.
  var WX_KEY = 'madeira-weer', WX_MAXAGE = 3 * 3600 * 1000;
  var WX_CODES = {
    0: 'Onbewolkt', 1: 'Overwegend helder', 2: 'Halfbewolkt', 3: 'Bewolkt', 45: 'Mist', 48: 'Mist met rijp',
    51: 'Lichte motregen', 53: 'Motregen', 55: 'Dichte motregen', 56: 'IJzel', 57: 'IJzel',
    61: 'Lichte regen', 63: 'Regen', 65: 'Zware regen', 66: 'IJzel', 67: 'IJzel',
    71: 'Lichte sneeuw', 73: 'Sneeuw', 75: 'Zware sneeuw', 77: 'Sneeuwkorrels',
    80: 'Lichte buien', 81: 'Buien', 82: 'Zware buien', 85: 'Sneeuwbuien', 86: 'Zware sneeuwbuien',
    95: 'Onweer', 96: 'Onweer met hagel', 99: 'Onweer met hagel'
  };
  var wxEls = Array.prototype.slice.call(document.querySelectorAll('[data-weer]'));
  var wxToday = new Date(); wxToday.setHours(0, 0, 0, 0);
  function wxDays(iso) { var p = iso.split('-'); return Math.round((new Date(+p[0], +p[1] - 1, +p[2]) - wxToday) / 86400000); }
  function wxTime(t) { return new Date(t).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  function wxRender(cache) {
    wxEls.forEach(function (el) {
      var day = cache.days[el.getAttribute('data-weer')];
      if (!day || day.date !== el.getAttribute('data-date')) { return; }
      var dd = el.querySelector('dd');
      var main = document.createElement('span'); main.className = 'wx';
      main.textContent = 'Verwachting: ' + (WX_CODES[day.code] || 'Wisselend') + ', ' + Math.round(day.tmin) + '–' + Math.round(day.tmax) + ' °C, ' +
        (day.pp == null ? '' : day.pp + '% kans op regen, ') + 'windstoten tot ' + Math.round(day.gust) + ' km/u.';
      var warn = [];
      if (day.code >= 95) { warn.push('Onweer verwacht: niet de bergen in.'); }
      if (day.gust >= 60) { warn.push('Harde windstoten: vermijd bergkammen en kliffen.'); }
      if (day.tmin <= 1) { warn.push('Kans op vorst en gladde paden.'); }
      var note = document.createElement('span'); note.className = 'wx-note';
      note.textContent = 'Open-Meteo, bijgewerkt ' + wxTime(cache.t) + '. Check op de dag zelf ook de waarschuwingen van IPMA.';
      dd.textContent = '';
      dd.appendChild(main);
      if (warn.length) { var w = document.createElement('span'); w.className = 'wx-warn'; w.textContent = warn.join(' '); dd.appendChild(w); }
      dd.appendChild(note);
    });
  }
  // Voorbije dagen: de zin "verschijnt hier vanaf …" klopt dan niet meer.
  wxEls.forEach(function (el) {
    if (wxDays(el.getAttribute('data-date')) < 0) {
      var n = el.querySelector('.wx-note'); if (n) { n.textContent = n.textContent.replace(/ De weersverwachting.*$/, ''); }
    }
  });
  var wxDue = wxEls.filter(function (el) { var n = wxDays(el.getAttribute('data-date')); return n >= 0 && n <= 15; });
  if (wxDue.length) {
    var wxCache = null;
    try { wxCache = JSON.parse(localStorage.getItem(WX_KEY)); } catch (e) {}
    if (wxCache && wxCache.days) { wxRender(wxCache); }
    if (!(wxCache && Date.now() - wxCache.t < WX_MAXAGE) && navigator.onLine !== false) {
      var lats = wxDue.map(function (el) { return el.getAttribute('data-lat'); }).join(',');
      var lons = wxDue.map(function (el) { return el.getAttribute('data-lon'); }).join(',');
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lats + '&longitude=' + lons +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max' +
        '&timezone=Atlantic%2FMadeira&forecast_days=16')
        .then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
        .then(function (json) {
          var list = Array.isArray(json) ? json : [json];
          var cache = { t: Date.now(), days: {} };
          wxDue.forEach(function (el, i) {
            var d = list[i] && list[i].daily; if (!d) { return; }
            var k = d.time.indexOf(el.getAttribute('data-date')); if (k < 0) { return; }
            cache.days[el.getAttribute('data-weer')] = {
              date: d.time[k], code: d.weather_code[k], tmax: d.temperature_2m_max[k], tmin: d.temperature_2m_min[k],
              pp: d.precipitation_probability_max[k], gust: d.wind_gusts_10m_max[k]
            };
          });
          try { localStorage.setItem(WX_KEY, JSON.stringify(cache)); } catch (e) {}
          wxRender(cache);
        })
        .catch(function () {});
    }
  }

  // 4. Betrouwbaar springen naar een onderdeel. Kaarten die onderweg laden maken de
  //    pagina langer; daarom controleren we na het scrollen de positie en corrigeren die.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function padTop() { return parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0; }
  function jumpTo(target) {
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    var tries = 0, timer = null;
    function settle() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var off = target.getBoundingClientRect().top - padTop();
        if (Math.abs(off) > 6 && tries < 5) {
          tries++;
          target.scrollIntoView({ behavior: 'auto', block: 'start' });
          settle();
        } else {
          window.removeEventListener('scroll', settle);
          if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
          target.focus({ preventScroll: true });
        }
      }, 180);
    }
    window.addEventListener('scroll', settle, { passive: true });
    settle();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    var id = a.getAttribute('href').slice(1);
    var target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) { return; }
    e.preventDefault();
    if (location.hash !== '#' + id) { history.pushState(null, '', '#' + id); }
    if (id === 'top') { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    jumpTo(target);
  });
})();
