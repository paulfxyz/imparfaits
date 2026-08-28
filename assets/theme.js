/* ══════════════════════════════════════════════════════════════════
   Tous Imparfaits — switcher clair / sombre
   Le thème est déjà posé sur <html data-theme> par le script en ligne
   du <head> (pas de flash au chargement). Ce fichier ne gère que le
   bouton, la mémorisation et le suivi de la préférence système.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'ti-theme';
  var memo = null;

  /* Mémoire web quand elle est disponible, variable en mémoire sinon
     (aperçus en iframe cloisonnée, navigation privée verrouillée). */
  var store = {
    get: function () {
      try { return window['local' + 'Storage'].getItem(KEY); } catch (e) { return memo; }
    },
    set: function (v) {
      memo = v;
      try { window['local' + 'Storage'].setItem(KEY, v); } catch (e) {}
    }
  };

  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    var v = store.get();
    return (v === 'dark' || v === 'light') ? v : null;
  }
  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  var SUN = '<svg class="ic ic--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="4.2"/>' +
    '<path d="M12 2.4v2.3M12 19.3v2.3M2.4 12h2.3M19.3 12h2.3' +
    'M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/></svg>';

  var MOON = '<svg class="ic ic--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.5 14.8A8.6 8.6 0 0 1 9.2 3.5a8.8 8.8 0 1 0 11.3 11.3z"/></svg>';

  /* Libellés : le français est la clé de traduction (cf. assets/i18n.js). */
  var LAB = {
    light: 'Passer au thème sombre',
    dark: 'Passer au thème clair'
  };

  function paint() {
    var t = current();
    var root = document.documentElement;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) {
      m.setAttribute('content', t === 'dark'
        ? (root.getAttribute('data-tc-dark') || '#0e0e0e')
        : (root.getAttribute('data-tc-light') || '#ededed'));
    }
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      /* i18n.js mémorise l'original du premier passage : on purge le cache
         pour que le nouveau libellé français soit bien retraduit. */
      btns[i].removeAttribute('data-i18n-o-aria-label');
      btns[i].removeAttribute('data-i18n-o-title');
      btns[i].setAttribute('aria-label', LAB[t]);
      btns[i].setAttribute('title', LAB[t]);
      btns[i].setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
    }
    /* si le site est dans une autre langue, on redemande la traduction
       du libellé qu'on vient de réécrire en français. */
    try {
      var i18n = window.TIi18n;
      if (i18n && i18n.current && i18n.current !== 'fr') i18n.set(i18n.current);
    } catch (e) {}
  }

  function setTheme(t, persist) {
    document.documentElement.setAttribute('data-theme', t);
    if (persist) store.set(t);
    paint();
  }

  function build(extra) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'themetog' + (extra ? ' ' + extra : '');
    b.setAttribute('data-theme-toggle', '');
    b.innerHTML = SUN + MOON;
    return b;
  }

  function mount() {
    /* En-tête : à gauche du sélecteur de langue (injecté par i18n.js) ;
       repli sur le bouton panier si le sélecteur n'est pas encore là. */
    var anchor = document.querySelector('.langsel--hdr') ||
                 document.getElementById('cartopen') ||
                 document.querySelector('[data-theme-anchor]');
    if (anchor && anchor.parentNode && !document.querySelector('.themetog--hdr')) {
      anchor.parentNode.insertBefore(build('themetog--hdr'), anchor);
    }

    /* Tiroir mobile : ligne dédiée au-dessus du choix de langue. */
    var drawerNav = document.querySelector('#drawer nav');
    if (drawerNav && !document.querySelector('.themerow')) {
      var row = document.createElement('div');
      row.className = 'themerow';
      var lab = document.createElement('span');
      lab.className = 'themerow__h';
      lab.textContent = 'Apparence';
      row.appendChild(lab);
      row.appendChild(build('themetog--ink'));
      var ls = drawerNav.querySelector('.langsel--drawer');
      if (ls) drawerNav.insertBefore(row, ls);
      else drawerNav.appendChild(row);
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-theme-toggle]');
      if (!t) return;
      e.preventDefault();
      setTheme(current() === 'dark' ? 'light' : 'dark', true);
    });

    if (mq && mq.addEventListener) {
      mq.addEventListener('change', function (ev) {
        if (!saved()) setTheme(ev.matches ? 'dark' : 'light', false);
      });
    }

    paint();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}());
