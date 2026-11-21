(function () {
  'use strict';

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
  var d = new Date();
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
  var sections = ['overzicht', 'dag17', 'dag18', 'dag19', 'dag20', 'dag21', 'dag22', 'checklist', 'extra']
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
})();
