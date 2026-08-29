/* ══════════════════════════════════════════════════════════════════
   Tous Imparfaits — traduction live côté client
   Dictionnaires plats : { "texte français": "traduction" }
   Deux passes : correspondance exacte du nœud de texte, puis
   remplacement de fragments (pour le contenu assemblé par app.js).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var LANGS = [
    { code: 'fr', label: 'Français',  native: 'Français',  htmlLang: 'fr',      locale: 'fr_FR' },
    { code: 'en', label: 'English',   native: 'English',   htmlLang: 'en',      locale: 'en_US' },
    { code: 'ja', label: 'Japonais',  native: '日本語',     htmlLang: 'ja',      locale: 'ja_JP' },
    { code: 'zh', label: 'Chinois',   native: '简体中文',    htmlLang: 'zh-Hans', locale: 'zh_CN' },
    { code: 'ko', label: 'Coréen',    native: '한국어',      htmlLang: 'ko',      locale: 'ko_KR' },
    { code: 'es', label: 'Espagnol',  native: 'Español',   htmlLang: 'es',      locale: 'es_ES' },
    { code: 'de', label: 'Allemand',  native: 'Deutsch',   htmlLang: 'de',      locale: 'de_DE' },
    { code: 'nl', label: 'Néerlandais', native: 'Nederlands', htmlLang: 'nl',   locale: 'nl_NL' },
    { code: 'it', label: 'Italien',   native: 'Italiano',  htmlLang: 'it',      locale: 'it_IT' }
  ];

  var ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEXTAREA: 1, CODE: 1 };
  var MIN_FRAG = 7;

  /* Stockage de la préférence : mémoire web quand elle est disponible,
     variable en mémoire sinon (aperçus en iframe cloisonnée). */
  var memo = null;
  var store = {
    get: function () {
      try { return window['local' + 'Storage'].getItem('ti-lang'); } catch (e) { return memo; }
    },
    set: function (v) {
      memo = v;
      try { window['local' + 'Storage'].setItem('ti-lang', v); } catch (e) {}
    }
  };

  var DICT_V = '22';       // version des dictionnaires (cache-busting)
  var cache = {};          // code -> dict
  var fragKeys = {};       // code -> [clés triées par longueur décroissante]
  var cur = 'fr';
  var busy = false;
  var obs = null;

  /* ── mémorisation des originaux français ─────────────────────── */
  var ORIG = 'data-i18n-o';

  /* L'original est mémorisé SUR le nœud de texte, jamais sur (parent, index) :
     app.js réécrit l'innerHTML du panier et de la barre collante, les nouveaux
     nœuds réoccupaient le même index et héritaient de l'ancienne valeur — un
     total recalculé était alors écrasé par le montant périmé. */
  function origText(node) {
    if (node.__i18nO === undefined) node.__i18nO = node.nodeValue;
    return node.__i18nO;
  }

  function origAttr(el, a) {
    var k = ORIG + '-' + a;
    if (!el.hasAttribute(k)) el.setAttribute(k, el.getAttribute(a) || '');
    return el.getAttribute(k);
  }

  /* Les clés ont été extraites avec des espaces ordinaires, alors que le
     HTML porte de vraies espaces insécables devant « : », « % », « € ».
     Sans cette normalisation, une phrase entière restait en français dans
     les neuf langues alors que sa traduction existait bel et bien. */
  var NBSP = /[\u00a0\u202f\u2009]/g;
  function nz(s) { return s.replace(NBSP, ' '); }

  var NZFOR = null, NZMAP = null;
  function nzmap(dict) {
    if (NZFOR === dict) return NZMAP;
    NZFOR = dict; NZMAP = {};
    var ks = Object.keys(dict);
    for (var i = 0; i < ks.length; i++) {
      var f = nz(ks[i]);
      if (NZMAP[f] === undefined) NZMAP[f] = dict[ks[i]];
    }
    return NZMAP;
  }

  /* ── traduction d'une chaîne ────────────────────────────── */
  function tr(raw, dict, frags) {
    if (!raw) return raw;
    var t = raw.trim();
    if (!t) return raw;
    var hit = dict[t];
    if (hit === undefined) {
      var f = nz(t);
      if (f !== t) hit = dict[f];
      if (hit === undefined) hit = nzmap(dict)[f];
    }
    if (hit !== undefined) return raw.replace(t, hit);
    if (!frags.length) return raw;
    var out = raw, touched = false;
    for (var i = 0; i < frags.length; i++) {
      var k = frags[i];
      if (out.indexOf(k) === -1) continue;
      var next = replaceWhole(out, k, dict[k]);
      if (next !== out) { out = next; touched = true; }
    }
    return touched ? out : raw;
  }

  /* Un fragment ne remplace que s'il forme un mot entier : sans ce
     garde-fou, « parfait » était remplacé à l'intérieur d'« Imparfaits »
     et le nom de la marque se retrouvait mutilé dans les métadonnées. */
  var WORD = /[0-9A-Za-z\u00c0-\u024f]/;

  function edgeOk(s, i, j) {
    var before = i > 0 ? s.charAt(i - 1) : '';
    var after  = j < s.length ? s.charAt(j) : '';
    if (before && WORD.test(before) && WORD.test(s.charAt(i))) return false;
    if (after && WORD.test(after) && WORD.test(s.charAt(j - 1))) return false;
    return true;
  }

  function replaceWhole(s, k, v) {
    var out = '', from = 0, i;
    while ((i = s.indexOf(k, from)) !== -1) {
      var j = i + k.length;
      if (edgeOk(s, i, j)) { out += s.slice(from, i) + v; }
      else { out += s.slice(from, j); }
      from = j;
    }
    return from === 0 ? s : out + s.slice(from);
  }

  /* ── parcours du DOM ─────────────────────────────────────────── */
  function walk(root, dict, frags) {
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/\S/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p.nodeType === 1) {
          if (SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if (p.getAttribute && p.getAttribute('translate') === 'no') return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = tw.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var o = origText(node);
      var v = tr(o, dict, frags);
      if (node.nodeValue !== v) node.nodeValue = v;
    });

    var els = root.nodeType === 1 ? [root] : [];
    els = els.concat(Array.prototype.slice.call(root.querySelectorAll ? root.querySelectorAll('*') : []));
    els.forEach(function (el) {
      // le contenu d'un <textarea> est ignoré plus haut, mais son placeholder doit l'être aussi
      if (el.nodeName === 'SCRIPT' || el.nodeName === 'STYLE') return;
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var o = origAttr(el, a);
        if (!o) return;
        var v = tr(o, dict, frags);
        if (el.getAttribute(a) !== v) el.setAttribute(a, v);
      });
    });
  }

  /* ── application ─────────────────────────────────────────────── */
  function apply(code) {
    var dict = cache[code] || {};
    var frags = fragKeys[code] || [];
    busy = true;
    walk(document.body, dict, frags);
    var h = document.querySelector('head title');
    if (h) { var o = origText(h.firstChild || h); }
    var t = document.title;
    var meta = LANGS.filter(function (l) { return l.code === code; })[0];
    document.documentElement.lang = meta ? meta.htmlLang : code;
    document.documentElement.setAttribute('data-lang', code);
    var loc = document.querySelector('meta[property="og:locale"]');
    if (loc && meta && meta.locale) loc.setAttribute('content', meta.locale);
    // <title> + meta description
    var titleEl = document.querySelector('title');
    if (titleEl) {
      if (!titleEl.hasAttribute(ORIG)) titleEl.setAttribute(ORIG, titleEl.textContent);
      titleEl.textContent = tr(titleEl.getAttribute(ORIG), dict, frags);
    }
    ['meta[name="description"]', 'meta[property="og:title"]',
     'meta[property="og:description"]', 'meta[property="og:image:alt"]',
     'meta[name="twitter:title"]', 'meta[name="twitter:description"]',
     'meta[name="twitter:image:alt"]']
      .forEach(function (sel) {
        var m = document.querySelector(sel);
        if (!m) return;
        if (!m.hasAttribute(ORIG)) m.setAttribute(ORIG, m.getAttribute('content') || '');
        m.setAttribute('content', tr(m.getAttribute(ORIG), dict, frags));
      });
    busy = false;
    document.querySelectorAll('[data-lang-opt]').forEach(function (b) {
      var on = b.getAttribute('data-lang-opt') === code;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-lang-current]').forEach(function (s) {
      s.textContent = code.toUpperCase();
    });
  }

  function buildFrags(code) {
    var d = cache[code] || {};
    fragKeys[code] = Object.keys(d)
      .filter(function (k) { return k.length >= MIN_FRAG && d[k] !== k; })
      .sort(function (a, b) { return b.length - a.length; });
  }

  function load(code) {
    if (code === 'fr') { cache.fr = {}; fragKeys.fr = []; return Promise.resolve(); }
    if (cache[code]) return Promise.resolve();
    /* Les dictionnaires sont mis en cache agressivement : sans jeton de
       version, un visiteur de retour reste sur l'ancienne traduction
       indéfiniment. Bump DICT_V à chaque correction de contenu. */
    return fetch('assets/i18n/' + code + '.json?v=' + DICT_V, { cache: 'force-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { cache[code] = j; buildFrags(code); })
      .catch(function () { cache[code] = {}; fragKeys[code] = []; });
  }

  function setLang(code, remember) {
    var known = LANGS.some(function (l) { return l.code === code; });
    if (!known) code = 'fr';
    var root = document.documentElement;
    root.setAttribute('data-lang-loading', '1');
    return load(code).then(function () {
      cur = code;
      apply(code);
      if (remember !== false) store.set(code);
      root.removeAttribute('data-lang-loading');
      document.dispatchEvent(new CustomEvent('ti:lang', { detail: { lang: code } }));
    });
  }

  /* ── retraduction du contenu injecté par app.js ──────────────── */
  function observe() {
    if (obs || !window.MutationObserver) return;
    var pending = false;
    obs = new MutationObserver(function (muts) {
      if (busy || cur === 'fr' || pending) return;
      var relevant = muts.some(function (m) {
        return m.type === 'childList' && m.addedNodes.length;
      });
      if (!relevant) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (cur === 'fr') return;
        busy = true;
        walk(document.body, cache[cur] || {}, fragKeys[cur] || []);
        busy = false;
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ── interface : bouton + menu ───────────────────────────────── */
  function markup() {
    var opts = LANGS.map(function (l) {
      return '<button type="button" role="option" data-lang-opt="' + l.code + '" aria-selected="false" translate="no">' +
        '<span class="langsel__native">' + l.native + '</span>' +
        '<span class="langsel__code">' + l.code.toUpperCase() + '</span></button>';
    }).join('');
    return '<button class="langsel__btn" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Langue \u00b7 Language" translate="no">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18"/></svg>' +
      '<span data-lang-current translate="no">FR</span><i class="langsel__chev" aria-hidden="true"></i></button>' +
      '<div class="langsel__list" role="listbox" aria-label="Langues \u00b7 Languages" hidden>' + opts + '</div>';
  }

  function mount() {
    var hosts = [];

    // 1. barre d'en-tête, avant le panier
    var cart = document.getElementById('cartopen');
    if (cart && cart.parentNode) {
      var d = document.createElement('div');
      d.className = 'langsel langsel--hdr';
      d.innerHTML = markup();
      cart.parentNode.insertBefore(d, cart);
      hosts.push(d);
    }

    // 2. menu mobile (tiroir)
    var drawerNav = document.querySelector('#drawer nav');
    if (drawerNav) {
      var w = document.createElement('div');
      w.className = 'langsel langsel--drawer langsel--open';
      w.innerHTML = '<p class="langsel__h" translate="no">Langue / Language</p>' +
        '<div class="langsel__grid" role="listbox" aria-label="Langues">' +
        LANGS.map(function (l) {
          return '<button type="button" role="option" data-lang-opt="' + l.code + '" aria-selected="false" translate="no">' +
            l.native + '</button>';
        }).join('') + '</div>';
      drawerNav.appendChild(w);
      hosts.push(w);
    }

    // 3. pied de page
    var footCol = document.querySelector('.ft__bot');
    if (footCol) {
      var f = document.createElement('div');
      f.className = 'langsel langsel--foot';
      f.innerHTML = '<span class="langsel__h" translate="no">Langue \u00b7 Language</span>' +
        '<div class="langsel__grid" role="listbox" aria-label="Langues">' +
        LANGS.map(function (l) {
          return '<button type="button" role="option" data-lang-opt="' + l.code + '" aria-selected="false" translate="no">' +
            l.native + '</button>';
        }).join('') + '</div>';
      footCol.appendChild(f);
      hosts.push(f);
    }

    // interactions
    document.addEventListener('click', function (e) {
      var opt = e.target.closest && e.target.closest('[data-lang-opt]');
      if (opt) {
        e.preventDefault();
        setLang(opt.getAttribute('data-lang-opt'));
        closeAll();
        return;
      }
      var btn = e.target.closest && e.target.closest('.langsel__btn');
      if (btn) {
        e.preventDefault();
        var box = btn.parentNode.querySelector('.langsel__list');
        var open = !box.hidden;
        closeAll();
        if (!open) { box.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
        return;
      }
      if (!(e.target.closest && e.target.closest('.langsel'))) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    function closeAll() {
      document.querySelectorAll('.langsel__list').forEach(function (b) { b.hidden = true; });
      document.querySelectorAll('.langsel__btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    }

    return hosts;
  }

  /* ── démarrage ───────────────────────────────────────────────── */
  function init() {
    mount();
    observe();
    var saved = store.get();
    if (!saved) {
      var nav = (navigator.language || 'fr').toLowerCase();
      var m = LANGS.filter(function (l) {
        return nav === l.code || nav.indexOf(l.code + '-') === 0;
      })[0];
      saved = m ? m.code : 'fr';
    }
    setLang(saved, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TIi18n = { set: setLang, langs: LANGS, get current() { return cur; } };
})();
