/* ══════════════════════════════════════════════════════════════════
   Tous Imparfaits — traduction des pages /offre et /brand
   Français, anglais, japonais. Les dictionnaires vivent dans
   <page>/i18n/<code>.json et sont produits par tools-i18n/extract.py :
     { "units": { "texte français": "<b>HTML</b> traduit" },
       "attrs": { "attribut français": "attribut traduit" } }
   La clé est le texte français normalisé de l'unité ; la valeur est le
   HTML complet de l'unité. Aucune modification du HTML source n'est
   nécessaire : le repérage des unités suit exactement la même règle
   que l'extracteur.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var VER = '3';
  var KEY = 'ti-lang';

  var LANGS = [
    { code: 'fr', short: 'FR', label: 'Français', full: 'Français' },
    { code: 'en', short: 'EN', label: 'English', full: 'English' },
    { code: 'ja', short: '日本語', label: '日本語', full: '日本語' }
  ];

  var INLINE = {
    A: 1, B: 1, I: 1, EM: 1, STRONG: 1, SPAN: 1, BR: 1, SMALL: 1, SUP: 1,
    SUB: 1, U: 1, S: 1, MARK: 1, ABBR: 1, CODE: 1, WBR: 1, TIME: 1, Q: 1,
    CITE: 1, VAR: 1, KBD: 1, DEL: 1, INS: 1, BDI: 1
  };
  var SKIP = { SCRIPT: 1, STYLE: 1, TEMPLATE: 1, NOSCRIPT: 1, SVG: 1, PRE: 1 };
  var ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
  var LETTERS = /[A-Za-zÀ-ÖØ-öø-ÿ]{2}/;

  var memo = null;
  var store = {
    get: function () {
      try { return window['local' + 'Storage'].getItem(KEY); } catch (e) { return memo; }
    },
    set: function (v) {
      memo = v;
      try { window['local' + 'Storage'].setItem(KEY, v); } catch (e) {}
    }
  };

  function norm(s) {
    return String(s).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  /* ── repérage des unités ─────────────────────────────────────── */

  var units = [];   // { el, key, orig }
  var attrs = [];   // { el, name, key, orig }

  function onlyInline(el) {
    var all = el.getElementsByTagName('*');
    for (var i = 0; i < all.length; i++) {
      var d = all[i];
      if (d.namespaceURI && d.namespaceURI !== 'http://www.w3.org/1999/xhtml') return false;
      if (!INLINE[d.tagName]) return false;
    }
    return true;
  }

  function collect(el) {
    var kids = el.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (c.namespaceURI && c.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
      if (SKIP[c.tagName] || c.getAttribute('translate') === 'no') continue;
      if (LETTERS.test(c.textContent) && onlyInline(c)) {
        units.push({ el: c, key: norm(c.textContent), orig: c.innerHTML });
      } else {
        collect(c);
      }
    }
  }

  function collectAttrs() {
    var all = document.querySelectorAll('[title],[aria-label],[placeholder],[alt]');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (SKIP[el.tagName]) continue;
      for (var j = 0; j < ATTRS.length; j++) {
        var v = el.getAttribute(ATTRS[j]);
        if (v && LETTERS.test(v)) {
          attrs.push({ el: el, name: ATTRS[j], key: norm(v), orig: v });
        }
      }
    }
    var t = document.querySelector('title');
    if (t) attrs.push({ el: t, name: '#text', key: norm(t.textContent), orig: t.textContent });
    var metas = document.querySelectorAll(
      'meta[name="description"],meta[property="og:title"],meta[property="og:description"],' +
      'meta[name="twitter:title"],meta[name="twitter:description"]');
    for (var k = 0; k < metas.length; k++) {
      var c = metas[k].getAttribute('content');
      if (c && LETTERS.test(c)) {
        attrs.push({ el: metas[k], name: 'content', key: norm(c), orig: c });
      }
    }
  }

  /* ── application ─────────────────────────────────────────────── */

  function restore() {
    for (var i = 0; i < units.length; i++) {
      if (units[i].el.innerHTML !== units[i].orig) units[i].el.innerHTML = units[i].orig;
    }
    for (var j = 0; j < attrs.length; j++) {
      var a = attrs[j];
      if (a.name === '#text') a.el.textContent = a.orig;
      else a.el.setAttribute(a.name, a.orig);
    }
  }

  function apply(dict) {
    var u = dict.units || {}, t = dict.attrs || {}, i;
    for (i = 0; i < units.length; i++) {
      var v = u[units[i].key];
      if (typeof v === 'string' && v) units[i].el.innerHTML = v;
    }
    for (i = 0; i < attrs.length; i++) {
      var a = attrs[i], w = t[a.key];
      if (typeof w !== 'string' || !w) continue;
      if (a.name === '#text') a.el.textContent = w;
      else a.el.setAttribute(a.name, w);
    }
  }

  /* ── chargement ──────────────────────────────────────────────── */

  var cache = { fr: null };
  var current = 'fr';

  function base() {
    var s = document.querySelector('script[src*="pagei18n.js"]');
    var dir = (s && s.getAttribute('data-dict')) || 'i18n/';
    return dir;
  }

  function load(code, done) {
    if (cache[code] !== undefined && cache[code] !== null) { done(cache[code]); return; }
    var url = base() + code + '.json?v=' + VER;
    var x = new XMLHttpRequest();
    x.open('GET', url, true);
    x.onreadystatechange = function () {
      if (x.readyState !== 4) return;
      var d = null;
      if (x.status === 200 || (x.status === 0 && x.responseText)) {
        try { d = JSON.parse(x.responseText); } catch (e) { d = null; }
      }
      cache[code] = d;
      done(d);
    };
    try { x.send(); } catch (e) { done(null); }
  }

  function paint() {
    var btns = document.querySelectorAll('[data-lang]');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-lang') === current;
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      btns[i].classList.toggle('is-on', on);
    }
  }

  function set(code, persist) {
    var ok = false, i;
    for (i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) ok = true;
    if (!ok) code = 'fr';
    if (persist) store.set(code);

    if (code === 'fr') {
      restore();
      current = 'fr';
      document.documentElement.setAttribute('lang', 'fr');
      paint();
      announce();
      return;
    }
    load(code, function (dict) {
      restore();
      if (!dict) { current = 'fr'; document.documentElement.setAttribute('lang', 'fr'); paint(); announce(); return; }
      apply(dict);
      current = code;
      document.documentElement.setAttribute('lang', code);
      paint();
      announce();
    });
  }

  /* Libelles construits en JavaScript : le script appelant passe la
     chaine francaise et recoit sa traduction en texte brut. */
  function t(s) {
    if (current === 'fr') return s;
    var d = cache[current];
    if (!d) return s;
    var k = norm(s);
    var v = (d.attrs && d.attrs[k]) || (d.units && d.units[k]);
    if (typeof v !== 'string' || !v) return s;
    if (v.indexOf('<') === -1) return v;
    var tmp = document.createElement('div');
    tmp.innerHTML = v;
    return tmp.textContent;
  }

  function announce() {
    try {
      document.dispatchEvent(new CustomEvent('ti:lang', { detail: current }));
    } catch (e) {
      var ev = document.createEvent('Event');
      ev.initEvent('ti:lang', true, false);
      document.dispatchEvent(ev);
    }
  }

  /* ── sélecteur ───────────────────────────────────────────────── */

  function build(extra) {
    var wrap = document.createElement('div');
    wrap.className = 'plangs' + (extra ? ' ' + extra : '');
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Langue de la page');
    wrap.setAttribute('translate', 'no');
    for (var i = 0; i < LANGS.length; i++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'plangs__b';
      b.setAttribute('data-lang', LANGS[i].code);
      b.setAttribute('lang', LANGS[i].code);
      b.setAttribute('title', LANGS[i].full);
      b.textContent = LANGS[i].short;
      wrap.appendChild(b);
    }
    return wrap;
  }

  function mount() {
    collect(document.body);
    collectAttrs();

    var anchor = document.querySelector('[data-theme-anchor]');
    var sel = build('plangs--hdr');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sel, anchor);
    else document.body.appendChild(sel);

    /* Sur mobile, la barre du haut est deja pleine : le selecteur passe
       dans le panneau de navigation. */
    var pan = document.querySelector('.mn__pn');
    if (pan) {
      var h = document.createElement('span');
      h.className = 'mn__h plangs__h';
      h.textContent = 'Langue';
      var row = build('plangs--pan');
      pan.insertBefore(row, pan.firstChild);
      pan.insertBefore(h, row);
    }

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.plangs [data-lang]');
      if (!t) return;
      e.preventDefault();
      set(t.getAttribute('data-lang'), true);
    });

    var saved = store.get();
    var pick = 'fr';
    if (saved === 'en' || saved === 'ja' || saved === 'fr') {
      pick = saved;
    } else {
      var nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
      if (nav.indexOf('ja') === 0) pick = 'ja';
      else if (nav.indexOf('fr') !== 0) pick = 'en';
    }
    if (pick === 'fr') paint(); else set(pick, false);

    window.TIpage = { set: set, t: t, get: function () { return current; } };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}());
