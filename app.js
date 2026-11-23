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
