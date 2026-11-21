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
    off.textContent = navigator.onLine ? '' : 'Je bent offline. De gids werkt gewoon; kaart- en GPX-links hebben internet nodig.';
  }
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', updateOnline);
  updateOnline();

  // 3. Actieve sectie markeren in de navigatie.
  var links = Array.prototype.slice.call(document.querySelectorAll('.daynav a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    var current = null;
    var setActive = function (id) {
      if (id === current) { return; }
      current = id;
      links.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) {
          a.setAttribute('aria-current', 'true');
          var nav = a.closest('ul');
          var left = a.offsetLeft - nav.clientWidth / 2 + a.offsetWidth / 2;
          nav.scrollTo({ left: left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        } else {
          a.removeAttribute('aria-current');
        }
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { setActive(e.target.id); } });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
