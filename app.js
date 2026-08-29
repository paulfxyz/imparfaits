/* Tous Imparfaits — interactions (concept de refonte) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Barre de progression ---------- */
  var prog = document.getElementById('prog');
  var hdr = document.querySelector('.hdr');
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    prog.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    /* on efface l'en-tête collant à l'approche du logotype final */
    var closer = document.querySelector('.closer');
    if (hdr && closer) {
      var top = closer.getBoundingClientRect().top;
      hdr.classList.toggle('is-hidden', top < 90);
    }
  }

  /* ---------- Reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- Compteurs ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || '0', 10);
    var suffix = el.dataset.suffix || '';
    var plain = el.dataset.plain === '1';
    el.dataset.done = '1';
    if (reduce) {
      el.textContent = (plain ? target : target.toFixed(dec).replace('.', ',')) + suffix;
      return;
    }
    var start = performance.now(), dur = 1400;
    function step(now) {
      var t = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - t, 3);
      var v = target * e;
      el.textContent = (plain ? Math.round(v) : v.toFixed(dec).replace('.', ',')) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  var counters = document.querySelectorAll('[data-count]');
  counters.forEach(function (el) {
    el.dataset.final = el.textContent;   /* valeur juste conservee */
    el.textContent = (el.dataset.plain === '1' ? '0' : '0') + (el.dataset.suffix || '');
    cio.observe(el);
  });
  /* filet de securite : si l'observateur n'a jamais declenche, afficher la vraie valeur */
  setTimeout(function () {
    counters.forEach(function (el) {
      if (!el.dataset.done && el.dataset.final) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) animateCount(el);
      }
    });
  }, 2500);

  /* ---------- Univers : onglets simples, plus aucun pilotage par le scroll ---------- */
  var worlds = document.getElementById('univers');
  var states = worlds ? worlds.querySelectorAll('.wstate') : [];
  var wimgs = worlds ? worlds.querySelectorAll('.worlds__media img') : [];
  var tabs = worlds ? worlds.querySelectorAll('.worlds__rail button') : [];
  var wprice = document.getElementById('wprice');
  var THEMES = [
    { bg: '#0a0a0a', accent: '#d64747', price: 'Hoodie Néo Samouraï — 75 €' },
    { bg: '#1b0f10', accent: '#d64747', price: 'T-shirt Yokai Rouge — 27 €' },
    { bg: '#171331', accent: '#58468c', price: 'Veste Navy Yukata — 55 €' },
    { bg: '#04211c', accent: '#00a289', price: 'Hoodie IJC Black — 70 €' }
  ];
  var current = -1;
  function setWorld(i) {
    if (i === current) return;
    current = i;
    var th = THEMES[i];
    worlds.style.setProperty('--w-bg', th.bg);
    worlds.style.setProperty('--w-accent', th.accent);
    worlds.dataset.world = String(i);
    states.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    wimgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
    tabs.forEach(function (t, k) { t.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    /* les univers masqués sont retirés de l'arbre d'accessibilité */
    states.forEach(function (s, k) {
      if (k === i) { s.removeAttribute('aria-hidden'); }
      else { s.setAttribute('aria-hidden', 'true'); }
    });
    if (wprice) wprice.textContent = th.price;
  }
  /* la section ne détourne plus le scroll : on change d'univers uniquement au clic */
  function onWorldsScroll() { /* volontairement vide : scroll libre */ }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { setWorld(parseInt(t.dataset.go, 10)); });
  });
  if (worlds) setWorld(0);

  /* ---------- Points interactifs (shop the look) ---------- */
  document.querySelectorAll('.hot').forEach(function (h) {
    h.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var open = h.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.hot').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      h.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.hot').forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
  });

  /* ---------- Accordéon FAQ ---------- */
  document.querySelectorAll('.acc__item').forEach(function (item, n) {
    var q = item.querySelector('.acc__q');
    var p = item.querySelector('.acc__p');
    p.id = 'accp' + n;
    q.id = 'accq' + n;
    q.setAttribute('aria-controls', p.id);
    p.setAttribute('role', 'region');
    p.setAttribute('aria-labelledby', q.id);
    function sync() {
      var isOpen = item.dataset.open === 'true';
      q.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      p.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
    sync();
    q.addEventListener('click', function () {
      var open = item.dataset.open === 'true';
      item.parentNode.querySelectorAll('.acc__item').forEach(function (o) { o.dataset.open = 'false'; });
      item.dataset.open = open ? 'false' : 'true';
      item.parentNode.querySelectorAll('.acc__item').forEach(function (o) {
        var oq = o.querySelector('.acc__q'), op = o.querySelector('.acc__p');
        var oo = o.dataset.open === 'true';
        oq.setAttribute('aria-expanded', oo ? 'true' : 'false');
        op.setAttribute('aria-hidden', oo ? 'false' : 'true');
      });
    });
  });

  /* ---------- Verrouillage du scroll (compteur : jamais coincé) ---------- */
  var LOCKS = {};
  function lock(key) {
    LOCKS[key] = true;
    document.body.classList.add('locked');
    document.body.classList.toggle('locked-cart', !!(LOCKS.cart || LOCKS.pv));
  }
  function unlock(key) {
    delete LOCKS[key];
    var any = Object.keys(LOCKS).length > 0;
    document.body.classList.toggle('locked', any);
    document.body.classList.toggle('locked-cart', !!(LOCKS.cart || LOCKS.pv));
  }
  /* la modale de contact vit dans son propre fichier : elle emprunte le verrou */
  window.TI_LOCK = { lock: lock, unlock: unlock };

  /* filet de sécurité : si un verrou traîne sans panneau ouvert, on libère */
  function auditLocks() {
    var d = document.getElementById('drawer');
    var c = document.getElementById('cartov');
    if (LOCKS.drawer && (!d || d.hidden)) unlock('drawer');
    var pvEl = document.getElementById('pv');
    if (LOCKS.pv && (!pvEl || pvEl.hidden)) unlock('pv');
    if (LOCKS.cart && (!c || c.hidden)) unlock('cart');
    var ctEl = document.getElementById('ct');
    if (LOCKS.contact && (!ctEl || ctEl.hidden)) unlock('contact');
  }
  setInterval(auditLocks, 1200);
  window.addEventListener('pageshow', auditLocks);
  window.addEventListener('resize', auditLocks);

  /* ---------- Menu mobile ---------- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    unlock('drawer');
    setTimeout(function () { drawer.hidden = true; }, 300);
    burger.focus();
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      if (drawer.hidden) {
        drawer.hidden = false;
        requestAnimationFrame(function () { drawer.classList.add('open'); });
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Fermer le menu');
        lock('drawer');
        var first = drawer.querySelector('a');
        if (first) first.focus();
      } else {
        closeDrawer();
      }
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeDrawer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
    /* passage en desktop : on ferme et on libère toujours le scroll */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && !drawer.hidden) closeDrawer();
    });
  }

  /* ---------- Rails horizontaux : glisser, fleches, molette non captive ----------
     Regle clef : une molette majoritairement verticale ne doit JAMAIS etre avalee
     par le rail. On la renvoie explicitement a la page, ce qui supprime le
     "scroll bloque" ressenti sur trackpad dans « Derniers exemplaires ». */
  document.querySelectorAll('.rail').forEach(function (rail) {
    var down = false, moved = false, sx = 0, sl = 0, pid = null;

    function end() {
      down = false; pid = null;
      rail.classList.remove('drag');
    }
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; pid = e.pointerId;
      sx = e.clientX; sl = rail.scrollLeft;
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== pid) return;
      var d = e.clientX - sx;
      if (!moved && Math.abs(d) > 4) { moved = true; rail.classList.add('drag'); }
      if (moved) { e.preventDefault(); rail.scrollLeft = sl - d; }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) {
      rail.addEventListener(ev, end);
    });
    window.addEventListener('blur', end);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    /* molette : vertical -> la page, horizontal -> le rail */
    rail.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      window.scrollBy({ top: e.deltaY, left: 0, behavior: 'instant' });
    }, { passive: false });

    /* fleches de defilement */
    var wrap = rail.closest('.sec') || rail.parentNode;
    var prev = wrap.querySelector('[data-rail="prev"]');
    var next = wrap.querySelector('[data-rail="next"]');
    function stepBy(dir) {
      var card = rail.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 18 : 300;
      rail.scrollBy({ left: dir * w * 2, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    function syncArrows() {
      var max = rail.scrollWidth - rail.clientWidth - 4;
      if (prev) prev.disabled = rail.scrollLeft <= 4;
      if (next) next.disabled = rail.scrollLeft >= max;
    }
    rail.addEventListener('scroll', syncArrows, { passive: true });
    window.addEventListener('resize', syncArrows);
    syncArrows();
  });

  /* ---------- Menus deroulants de l'en-tete ---------- */
  var navItems = document.querySelectorAll('.nav__item');
  var closeTimer = null;
  function closeMenus(except) {
    navItems.forEach(function (it) {
      if (it === except) return;
      it.classList.remove('open');
      var b = it.querySelector('.nav__t');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  navItems.forEach(function (it) {
    var btn = it.querySelector('.nav__t');
    if (!btn) return;
    function open() {
      clearTimeout(closeTimer);
      closeMenus(it);
      it.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function shut() { it.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (it.classList.contains('open')) shut(); else open();
    });
    it.addEventListener('mouseenter', function () {
      if (window.matchMedia('(hover: hover)').matches) open();
    });
    it.addEventListener('mouseleave', function () {
      if (!window.matchMedia('(hover: hover)').matches) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(shut, 180);
    });
    it.addEventListener('focusin', open);
    it.addEventListener('focusout', function (e) {
      if (!it.contains(e.relatedTarget)) shut();
    });
    /* un clic sur une entree ferme le menu */
    it.querySelectorAll('.mega a').forEach(function (a) {
      a.addEventListener('click', function () { shut(); });
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenus(null); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item')) closeMenus(null);
  });

  /* ---------- Panier (démo) + palier de livraison offerte ---------- */
  var FREE = 100;
  var count = 0, total = 0;
  var cartBtn = document.getElementById('cartn');
  var toast = document.getElementById('toast');
  var sbtxt = document.getElementById('sbtxt');
  var sbbar = document.getElementById('sbbar');
  var toastT;

  /* Les prix du panier sont calculés à l'exécution : ils doivent suivre la
     convention de la langue affichée, sinon un total « 75,00 € » côtoie des
     étiquettes « 100.00 € » traduites sur le même écran. */
  var POINT = { en: 1, ja: 1, zh: 1, ko: 1 };   /* point décimal */
  var AVANT = { nl: 1 };                        /* symbole avant le nombre */

  function euros(v) {
    var l = document.documentElement.getAttribute('data-lang') || 'fr';
    var s = (Math.round(v * 100) / 100).toFixed(2);
    if (!POINT[l]) s = s.replace('.', ',');
    return AVANT[l] ? '€\u00a0' + s : s + '\u00a0€';
  }

  /* Un changement de langue doit reformater les prix déjà calculés. */
  document.addEventListener('ti:lang', function () {
    try { renderCart(); } catch (e) {}
  });

  function priceOf(card) {
    var el = card.querySelector('.card__price');
    if (!el) return 0;
    var txt = el.cloneNode(true);
    var s = txt.querySelector('s');            /* on ignore le prix barré */
    if (s) s.remove();
    var m = txt.textContent.replace(/\s/g, '').match(/(\d+([.,]\d+)?)/);
    return m ? parseFloat(m[1].replace(',', '.')) : 0;
  }

  function updateProgress() {
    var left = FREE - total;
    if (sbbar) sbbar.style.width = Math.min(100, (total / FREE) * 100) + '%';
    if (!sbtxt) return;
    if (total === 0) sbtxt.innerHTML = 'Livraison offerte<br>dès <b>100\u00a0€</b>';
    else if (left > 0) sbtxt.innerHTML = 'Encore <b>' + euros(left) + '</b><br>et livraison offerte';
    else sbtxt.innerHTML = '<b>Livraison offerte ✳</b><br>panier ' + euros(total);
  }

  function showToast(html) {
    if (!toast) return;
    toast.innerHTML = html;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }

  /* ═══════════════════════════════════════════════════════════════════
     Tunnel d'achat plein écran : panier → livraison → paiement → merci
     ═══════════════════════════════════════════════════════════════════ */
  var SIZES_APPAREL = ['S', 'M', 'L', 'XL'];
  var TVA = 0.20;
  var CODES = {
    IMPARFAIT10: { pct: 10, lbl: 'IMPARFAIT10 · −10 %' },
    JAPANEXPO: { pct: 15, lbl: 'JAPANEXPO · −15 %' }
  };
  var promoApplied = null;

  /* Panier d'exemple pré-rempli : la démo s'ouvre sur un panier réaliste */
  function sampleCart() {
    return [
      { key: 'Hoodie Kamon — Black & Red|M', name: 'Hoodie Kamon — Black & Red', type: 'Hoodie',
        size: 'M', sizes: ['S', 'M', 'L'], img: 'assets/hoodie-kamon-black-red-0.webp', price: 70, qty: 1, tag: 'Série limitée · 40 pièces' },
      { key: 'T-shirt Yokai — Rouge|L', name: 'T-shirt Yokai — Rouge', type: 'T-shirt',
        size: 'L', sizes: SIZES_APPAREL, img: 'assets/t-shirt-yokai-rouge-0.webp', price: 35, qty: 2, tag: 'Le plus vendu' },
      { key: 'Casquette Sakura — Denim|Taille unique', name: 'Casquette Sakura — Denim', type: 'Casquette',
        size: 'Taille unique', sizes: [], img: 'assets/casquette-sakura-denim-0.webp', price: 25, qty: 1, tag: '' }
    ];
  }
  var ITEMS = sampleCart();

  var SHIPS = {
    colissimo: { cost: 4.90, free: true, lbl: 'Colissimo à domicile', eta: 'France · 48–72 h', days: 3 },
    relais: { cost: 3.50, free: true, lbl: 'Point relais Mondial Relay', eta: 'Point relais · 3-5 j', days: 5 },
    express: { cost: 9.90, free: false, lbl: 'Chronopost express', eta: 'Express · demain 13 h', days: 1 },
    retrait: { cost: 0, free: true, lbl: 'Retrait à Bailly-Romainvilliers', eta: 'Retrait · sous 24 h', days: 1 }
  };
  function shipKey() {
    var r = document.querySelector('input[name="ship"]:checked');
    return r ? r.value : 'colissimo';
  }

  var ov = document.getElementById('cartov');
  var openBtn = document.getElementById('cartopen');
  var listEl = document.getElementById('cartl');
  var emptyEl = document.getElementById('cartempty');
  var miniEl = document.getElementById('comini');
  var lastFocus = null;
  var STEP = 1;

  function subtotal() { return ITEMS.reduce(function (s, it) { return s + it.price * it.qty; }, 0); }
  function qtyTotal() { return ITEMS.reduce(function (s, it) { return s + it.qty; }, 0); }
  function setText(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* --- Chiffres de la commande --- */
  function totals() {
    var sub = subtotal();
    var disc = promoApplied ? sub * (CODES[promoApplied].pct / 100) : 0;
    var net = Math.max(0, sub - disc);
    var sk = shipKey(), sm = SHIPS[sk];
    var ship = (sm.free && net >= FREE) || sub === 0 ? 0 : sm.cost;
    return { sub: sub, disc: disc, net: net, ship: ship, tot: net + ship, sk: sk, sm: sm };
  }

  function renderCart() {
    count = qtyTotal();
    total = subtotal();
    var t = totals();
    var isEmpty = ITEMS.length === 0;

    if (cartBtn) cartBtn.textContent = '(' + count + ')';
    setText('cartqty', '(' + count + ')');
    setText('cartn2', '(' + count + ')');
    var sbc = document.getElementById('sbcta');
    if (sbc) sbc.textContent = count ? 'Voir mon panier (' + count + ')' : 'Voir les nouveautés';

    /* lignes détaillées : taille modifiable + quantité */
    if (listEl) {
      listEl.hidden = isEmpty;
      listEl.innerHTML = ITEMS.map(function (it, k) {
        var szCtl = it.sizes && it.sizes.length
          ? '<span class="col__sz"><span>Taille</span><label class="sr" for="sz' + k + '">Taille de ' + esc(it.name) + '</label>' +
            '<select id="sz' + k + '" data-size="' + k + '">' + it.sizes.map(function (s) {
              return '<option' + (s === it.size ? ' selected' : '') + '>' + esc(s) + '</option>';
            }).join('') + '</select></span>'
          : '<span class="col__sz"><span>Taille unique</span></span>';
        return '<li>' +
          '<img src="' + esc(it.img) + '" width="92" height="115" alt="" loading="lazy" decoding="async">' +
          '<div>' +
            '<span class="col__n">' + esc(it.name) + '</span>' +
            '<span class="col__meta"><span>' + esc(it.type) + '</span> · réf. TI-' + (1200 + k * 37) + '</span>' +
            (it.tag ? '<span class="col__tag">' + esc(it.tag) + '</span>' : '') +
            '<span class="col__ctl">' + szCtl +
              '<span class="col__step">' +
                '<button type="button" data-dec="' + k + '" aria-label="Retirer une unité de ' + esc(it.name) + '">−</button>' +
                '<label class="sr" for="q' + k + '">Quantité de ' + esc(it.name) + '</label>' +
                '<input id="q' + k + '" type="number" min="1" max="20" step="1" value="' + it.qty + '" data-qty="' + k + '">' +
                '<button type="button" data-inc="' + k + '" aria-label="Ajouter une unité de ' + esc(it.name) + '">+</button>' +
              '</span>' +
            '</span>' +
          '</div>' +
          '<div class="col__r">' +
            '<span class="col__p">' + euros(it.price * it.qty) + '</span>' +
            (it.qty > 1 ? '<span class="col__u">' + euros(it.price) + ' / pièce</span>' : '') +
            '<button class="col__x" type="button" data-del="' + k + '">Retirer</button>' +
          '</div>' +
        '</li>';
      }).join('');
    }

    /* mini-récapitulatif latéral */
    if (miniEl) {
      miniEl.innerHTML = isEmpty
        ? '<li class="comini__none">Aucun article pour le moment.</li>'
        : ITEMS.map(function (it) {
            return '<li><img src="' + esc(it.img) + '" width="46" height="58" alt="" loading="lazy" decoding="async">' +
              '<div><span class="comini__n">' + esc(it.name) + '</span>' +
              '<span class="comini__v">' + esc(it.size) + ' · ×' + it.qty + '</span></div>' +
              '<span class="comini__p">' + euros(it.price * it.qty) + '</span></li>';
          }).join('');
    }

    if (emptyEl) emptyEl.hidden = !isEmpty;
    var xs = document.getElementById('coxsell');
    if (xs) xs.hidden = isEmpty;
    var codeEl = document.getElementById('cartcode');
    if (codeEl) { codeEl.hidden = isEmpty; if (isEmpty) codeEl.open = false; }
    var shipWrap = document.getElementById('cartshipwrap');
    if (shipWrap) shipWrap.hidden = isEmpty;
    var sumEl = document.querySelector('.cartsum');
    if (sumEl) sumEl.hidden = isEmpty;

    setText('sumsub', euros(t.sub));
    var dl = document.getElementById('sumdiscl');
    if (dl) {
      dl.hidden = !promoApplied;
      if (promoApplied) { setText('sumdisccode', CODES[promoApplied].lbl); setText('sumdisc', '−' + euros(t.disc)); }
    }
    setText('sumship', t.ship === 0 ? 'Offerte' : euros(t.ship));
    setText('sumshipl', t.sm.eta);
    setText('sumtva', euros(t.tot - t.tot / (1 + TVA)));
    setText('sumtot', euros(t.tot));
    setText('cosidetot', euros(t.tot));
    setText('coacttot', euros(t.tot));

    /* prix affichés dans les modes d'expédition */
    document.querySelectorAll('#cosh input').forEach(function (r) {
      var p = r.nextElementSibling.querySelector('[data-p]');
      if (!p) return;
      var c = parseFloat(r.getAttribute('data-cost'));
      var isFree = c === 0 || (r.getAttribute('data-free') === '1' && t.net >= FREE);
      p.textContent = isFree ? (c === 0 ? 'Gratuit' : 'Offerte') : euros(c);
      p.classList.toggle('is-free', isFree);
    });

    /* paliers cadeaux */
    var left = FREE - t.sub;
    var cs = document.getElementById('cartship');
    if (cs) {
      if (t.sub === 0) cs.innerHTML = 'Livraison offerte dès <b>100\u00a0€</b>';
      else if (left > 0) cs.innerHTML = 'Encore <b>' + euros(left) + '</b> pour la livraison offerte';
      else if (t.sub < 150) cs.innerHTML = '<b>Livraison offerte ✳</b> encore ' + euros(150 - t.sub) + ' pour le tote bag';
      else cs.innerHTML = '<b>Livraison offerte + tote bag ✳</b> merci !';
    }
    var cb = document.getElementById('cartbar');
    if (cb) cb.style.width = Math.min(100, (t.sub / 150) * 100) + '%';
    document.querySelectorAll('.co__tiers li').forEach(function (li) {
      var hit = t.sub >= parseFloat(li.getAttribute('data-tier'));
      li.classList.toggle('hit', hit);
      li.setAttribute('aria-label', (hit ? 'Palier obtenu : ' : 'Palier à débloquer : ') + li.textContent.replace('✳', '').trim());
    });

    syncAct();
    updateProgress();
  }

  /* --- Barre d'action selon l'étape --- */
  function syncAct() {
    var t = totals();
    var cta = document.getElementById('cartcta');
    var back = document.getElementById('coback');
    var act = document.getElementById('coact');
    var lab = document.getElementById('coctat');
    if (act) act.hidden = STEP === 4;
    if (back) back.hidden = STEP === 1 || STEP === 4;
    if (!cta || !lab) return;
    cta.disabled = false;
    if (STEP === 1) lab.textContent = ITEMS.length ? 'Passer à la livraison' : 'Voir toute la boutique';
    else if (STEP === 2) lab.textContent = 'Aller au paiement';
    else if (STEP === 3) lab.textContent = 'Payer ' + euros(t.tot);
  }

  function goStep(n) {
    STEP = n;
    document.querySelectorAll('.co__step').forEach(function (s) {
      var on = parseInt(s.getAttribute('data-step'), 10) === n;
      s.hidden = !on;
      s.classList.toggle('is-on', on);
    });
    document.querySelectorAll('#costeps li').forEach(function (li) {
      var i = parseInt(li.getAttribute('data-s'), 10);
      li.classList.toggle('is-now', i === n);
      li.classList.toggle('is-done', i < n || n === 4);
      li.setAttribute('aria-current', i === n ? 'step' : 'false');
    });
    var main = document.getElementById('comain');
    if (main) main.scrollTop = 0;
    if (n === 3) fillRecap();
    syncAct();
    var h = document.querySelector('.co__step.is-on .co__h');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }

  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }

  function fillRecap() {
    var t = totals();
    var addr = [val('f-fn') + ' ' + val('f-ln'), val('f-ad'), val('f-ad2'), val('f-cp') + ' ' + val('f-city'), val('f-cty')]
      .filter(function (x) { return x && x.trim(); }).join(', ');
    setText('rec-addr', addr || '—');
    setText('rec-ship', t.sm.lbl + ' · ' + (t.ship === 0 ? 'offerte' : euros(t.ship)));
  }

  /* --- Validation d'étape --- */
  function bad(id, on) {
    var e = document.getElementById(id);
    if (!e) return;
    if (on) e.setAttribute('aria-invalid', 'true'); else e.removeAttribute('aria-invalid');
  }
  function check2() {
    var need = ['f-mail', 'f-tel', 'f-fn', 'f-ln', 'f-ad', 'f-cp', 'f-city'];
    var first = null;
    need.forEach(function (id) {
      var ok = !!val(id);
      if (id === 'f-mail') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val(id));
      if (id === 'f-cp') ok = /^\d{4,5}$/.test(val(id));
      bad(id, !ok);
      if (!ok && !first) first = id;
    });
    var err = document.getElementById('err2');
    if (first) {
      if (err) err.textContent = 'Il manque quelques informations pour expédier ta commande.';
      var e = document.getElementById(first);
      if (e) { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); e.focus({ preventScroll: true }); }
      return false;
    }
    if (err) err.textContent = '';
    return true;
  }
  function check3() {
    var err = document.getElementById('err3');
    var pay = document.querySelector('.copay__t.is-on');
    var mode = pay ? pay.getAttribute('data-pay') : 'cb';
    var first = null;
    if (mode === 'cb') {
      [['f-card', function (v) { return v.replace(/\s/g, '').length >= 14; }],
       ['f-exp', function (v) { return /^\d{2}\/\d{2}$/.test(v); }],
       ['f-cvc', function (v) { return /^\d{3,4}$/.test(v); }],
       ['f-holder', function (v) { return v.length > 2; }]
      ].forEach(function (p) {
        var ok = p[1](val(p[0]));
        bad(p[0], !ok);
        if (!ok && !first) first = p[0];
      });
    }
    var cgv = document.getElementById('f-cgv');
    if (first) {
      if (err) err.textContent = 'Vérifie les informations de paiement.';
      var ef = document.getElementById(first);
      ef.scrollIntoView({ block: 'center', behavior: 'smooth' });
      ef.focus({ preventScroll: true });
      return false;
    }
    if (cgv && !cgv.checked) {
      if (err) err.textContent = 'Merci d\'accepter les conditions générales de vente.';
      cgv.focus();
      return false;
    }
    if (err) err.textContent = '';
    return true;
  }

  /* --- Confirmation --- */
  function finish() {
    var t = totals();
    var num = 'TI-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
    var d = new Date(); d.setDate(d.getDate() + t.sm.days);
    var eta = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    setText('done-num', num);
    setText('done-tot', euros(t.tot));
    setText('done-eta', t.sm.lbl + ' · ' + eta);
    setText('done-mail', val('f-mail') || 'ton adresse');
    var addr = [val('f-fn') + ' ' + val('f-ln'), val('f-ad'), val('f-cp') + ' ' + val('f-city')]
      .filter(function (x) { return x && x.trim(); }).join(', ');
    setText('done-addr', addr || '—');
    var dl = document.getElementById('donel');
    if (dl) {
      dl.innerHTML = ITEMS.map(function (it) {
        return '<li><img src="' + esc(it.img) + '" width="62" height="78" alt="" loading="lazy" decoding="async">' +
          '<div><span class="col__n">' + esc(it.name) + '</span>' +
          '<span class="col__meta">' + (it.sizes && it.sizes.length ? 'Taille ' + esc(it.size) : esc(it.size)) + ' · ×' + it.qty + '</span></div>' +
          '<div class="col__r"><span class="col__p">' + euros(it.price * it.qty) + '</span></div></li>';
      }).join('');
    }
    goStep(4);
    showToast('Commande <b>' + num + '</b> confirmée · démo, aucun paiement traité');
  }

  /* --- Ajout depuis les suggestions et ventes croisées --- */
  function addFromData(str) {
    var p = str.split('|');
    var key = p[0] + '|' + p[4];
    var found = null;
    ITEMS.forEach(function (it) { if (it.key === key) found = it; });
    if (found) found.qty++;
    else ITEMS.push({
      key: key, name: p[0], type: p[1], size: p[4], img: p[3],
      sizes: p[4] === 'Taille unique' ? [] : SIZES_APPAREL,
      price: parseFloat(p[2]), qty: 1, tag: ''
    });
    renderCart();
    showToast(p[0] + ' ajouté à ton panier');
  }
  if (ov) ov.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sug]');
    if (b) addFromData(b.getAttribute('data-sug'));
  });

  var lookBtn = document.getElementById('addlook');
  if (lookBtn) lookBtn.addEventListener('click', function () {
    [['Veste Navy — ensemble Yukata', 'Veste', 55, 'assets/veste-navy-ensemble-yukata-0.webp', 'M'],
     ['T-shirt Yukata Noir', 'T-shirt', 30, 'assets/t-shirt-sakura-noir-0.webp', 'M'],
     ['Short Navy — ensemble Yukata', 'Short', 40, 'assets/veste-navy-ensemble-yukata-1.webp', 'M']
    ].forEach(function (p) {
      var key = p[0] + '|' + p[4];
      var found = null;
      ITEMS.forEach(function (it) { if (it.key === key) found = it; });
      if (found) found.qty++;
      else ITEMS.push({ key: key, name: p[0], type: p[1], size: p[4], img: p[3], sizes: SIZES_APPAREL, price: p[2], qty: 1, tag: 'Look complet' });
    });
    renderCart();
    openCart();
    showToast('Look complet ajouté · <b>livraison offerte débloquée</b>');
  });

  /* --- Ouverture / fermeture --- */
  function openCart() {
    if (!ov) return;
    lastFocus = document.activeElement;
    ov.hidden = false;
    requestAnimationFrame(function () { ov.classList.add('open'); });
    lock('cart');
    goStep(ITEMS.length || STEP === 4 ? STEP : 1);
    var x = ov.querySelector('.co__x');
    if (x) x.focus();
  }
  function closeCart() {
    if (!ov || ov.hidden) return;
    ov.classList.remove('open');
    unlock('cart');
    setTimeout(function () { ov.hidden = true; }, 320);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (openBtn) openBtn.addEventListener('click', openCart);
  var dCart = document.getElementById('drawercart');
  if (dCart) dCart.addEventListener('click', function () {
    if (typeof closeDrawer === 'function') closeDrawer();
    setTimeout(openCart, 260);
  });
  var sbCart = document.getElementById('sbcart');
  if (sbCart) sbCart.addEventListener('click', function () {
    if (ITEMS.length) openCart();
    else location.hash = '#nouveautes';
  });

  if (ov) {
    /* clics : fermeture, quantités, tailles, navigation */
    ov.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { e.preventDefault(); closeCart(); return; }
      var t = e.target.closest('button');
      if (!t) return;
      var k;
      if ((k = t.getAttribute('data-inc')) !== null) { ITEMS[+k].qty = Math.min(20, ITEMS[+k].qty + 1); renderCart(); }
      else if ((k = t.getAttribute('data-dec')) !== null) {
        ITEMS[+k].qty--;
        if (ITEMS[+k].qty < 1) { ITEMS.splice(+k, 1); if (!ITEMS.length) goStep(1); }
        renderCart();
      } else if ((k = t.getAttribute('data-del')) !== null) {
        ITEMS.splice(+k, 1); if (!ITEMS.length) goStep(1); renderCart();
      } else if ((k = t.getAttribute('data-goto')) !== null) { goStep(+k); }
      else if (t.id === 'cartcta') {
        if (STEP === 1) {
          if (!ITEMS.length) { closeCart(); location.hash = '#nouveautes'; return; }
          goStep(2);
        } else if (STEP === 2) { if (check2()) goStep(3); }
        else if (STEP === 3) { if (check3()) finish(); }
      } else if (t.id === 'coback') { goStep(Math.max(1, STEP - 1)); }
      else if (t.id === 'coreset') {
        ITEMS = sampleCart(); promoApplied = null;
        var pmsg = document.getElementById('promomsg'); if (pmsg) pmsg.textContent = '';
        var pin = document.getElementById('promo'); if (pin) pin.value = '';
        renderCart(); goStep(1);
      } else if (t.classList.contains('copay__t')) {
        document.querySelectorAll('.copay__t').forEach(function (o) {
          var on = o === t;
          o.classList.toggle('is-on', on);
          o.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        var mode = t.getAttribute('data-pay');
        document.querySelectorAll('.copay__pane').forEach(function (p) {
          p.hidden = p.getAttribute('data-pane') !== mode;
          p.classList.toggle('is-on', p.getAttribute('data-pane') === mode);
        });
        var e3 = document.getElementById('err3'); if (e3) e3.textContent = '';
      }
    });

    /* changements : taille, quantité saisie, mode d'expédition */
    ov.addEventListener('change', function (e) {
      var t = e.target, k;
      if ((k = t.getAttribute('data-size')) !== null) {
        var it = ITEMS[+k];
        it.size = t.value; it.key = it.name + '|' + it.size;
        renderCart();
        showToast(it.name + ' · taille <b>' + it.size + '</b>');
      } else if ((k = t.getAttribute('data-qty')) !== null) {
        var q = parseInt(t.value, 10);
        if (isNaN(q) || q < 1) q = 1;
        if (q > 20) q = 20;
        ITEMS[+k].qty = q; renderCart();
      } else if (t.name === 'ship') { renderCart(); }
      else if (t.id === 'f-same') {
        var bill = document.getElementById('cobill');
        if (bill) bill.hidden = t.checked;
      } else if (t.id === 'f-gift') {
        var g = document.getElementById('cogift');
        if (g) g.hidden = !t.checked;
      }
    });

    /* formatage carte + effacement des erreurs à la saisie */
    ov.addEventListener('input', function (e) {
      var t = e.target;
      if (t.id === 'f-card') {
        var v = t.value.replace(/\D/g, '').slice(0, 19);
        t.value = v.replace(/(.{4})/g, '$1 ').trim();
      } else if (t.id === 'f-exp') {
        var x = t.value.replace(/\D/g, '').slice(0, 4);
        t.value = x.length > 2 ? x.slice(0, 2) + '/' + x.slice(2) : x;
      } else if (t.id === 'f-cvc' || t.id === 'f-cp' || t.id === 'b-cp') {
        t.value = t.value.replace(/\D/g, '');
      }
      if (t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
    });

    /* piège de focus */
    ov.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = [].filter.call(ov.querySelectorAll('button, input, select, textarea, summary, [href]'), function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });

  /* récapitulatif dépliable en mobile */
  var sTog = document.getElementById('cosidetog');
  var sBody = document.getElementById('cosidebody');
  if (sTog && sBody) sTog.addEventListener('click', function () {
    var open = sBody.classList.toggle('is-open');
    sTog.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* code promo */
  var pb = document.getElementById('promobtn'), pi = document.getElementById('promo'), pm = document.getElementById('promomsg');
  function applyPromo() {
    if (!pi || !pm) return;
    var code = pi.value.trim().toUpperCase();
    if (!code) { pm.className = 'co__msg'; pm.textContent = 'Saisissez un code.'; return; }
    if (CODES[code]) {
      promoApplied = code;
      pm.className = 'co__msg ok';
      pm.textContent = 'Code appliqué : ' + CODES[code].lbl;
    } else {
      promoApplied = null;
      pm.className = 'co__msg';
      pm.textContent = 'Code inconnu. Essayez IMPARFAIT10.';
    }
    renderCart();
  }
  if (pb) pb.addEventListener('click', applyPromo);
  if (pi) pi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });
  /* --- Ajout au panier depuis les cartes : la taille est obligatoire --- */
  document.querySelectorAll('.card__add').forEach(function (b) {
    var card = b.closest('.card');
    if (!card) return;
    var nameEl = card.querySelector('.card__name');
    var name = nameEl ? nameEl.textContent.trim() : 'Article';
    var typeEl = card.querySelector('.card__type');
    var type = typeEl ? typeEl.textContent.trim().split('\u00b7')[0].trim() : 'Tous Imparfaits';
    var imgEl = card.querySelector('.card__media img');
    var img = imgEl ? imgEl.getAttribute('src') : 'assets/logo.webp';
    var price = priceOf(card);
    var row = card.querySelector('.card__sizes');
    var chosen = null;

    /* les tailles disponibles deviennent des boutons selectionnables */
    var buttons = [];
    if (row) {
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', 'Choisir une taille pour ' + name);
      Array.prototype.slice.call(row.children).forEach(function (sp) {
        if (sp.classList.contains('out')) { sp.setAttribute('aria-disabled', 'true'); return; }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'szb';
        btn.textContent = sp.textContent.trim();
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Taille ' + btn.textContent);
        sp.replaceWith(btn);
        buttons.push(btn);
      });
    }

    function add() {
      var size = chosen || 'Taille unique';
      var key = name + '|' + size;
      var found = null;
      ITEMS.forEach(function (it) { if (it.key === key) found = it; });
      if (found) found.qty++;
      else ITEMS.push({ key: key, name: name, type: type, size: size, img: img, price: price, qty: 1,
        sizes: buttons.map(function (bb) { return bb.textContent; }), tag: '' });
      renderCart();
      card.classList.remove('needsize');
      b.classList.add('ok');
      b.textContent = 'Ajout\u00e9 \u2733';
      setTimeout(function () { b.classList.remove('ok'); b.textContent = label; }, 1200);
      var left = FREE - subtotal();
      showToast(left > 0
        ? name + (chosen ? ' \u00b7 taille ' + chosen : '') + ' ajout\u00e9 \u00b7 encore <b>' + euros(left) + '</b> pour la livraison offerte'
        : name + (chosen ? ' \u00b7 taille ' + chosen : '') + ' ajout\u00e9 \u00b7 <b>livraison offerte d\u00e9bloqu\u00e9e</b>');
    }

    var label = buttons.length ? 'Choisir la taille' : 'Ajouter au panier';
    b.textContent = label;
    b.setAttribute('aria-label', (buttons.length ? 'Choisir une taille pour ' : 'Ajouter au panier : ') + name);

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var already = chosen === btn.textContent;
        buttons.forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-pressed', 'false'); });
        if (already) { chosen = null; b.textContent = label; return; }
        chosen = btn.textContent;
        btn.classList.add('on');
        btn.setAttribute('aria-pressed', 'true');
        card.classList.remove('needsize');
        b.textContent = 'Ajouter \u2014 taille ' + chosen;
        if (card.dataset.pending === '1') { card.dataset.pending = ''; add(); }
      });
    });

    b.addEventListener('click', function (e) {
      e.preventDefault();
      if (buttons.length && !chosen) {
        card.classList.add('needsize');
        card.dataset.pending = '1';
        buttons[0].focus({ preventScroll: true });
        showToast('Choisis ta taille pour <b>' + name + '</b>');
        return;
      }
      add();
    });
  });
  renderCart();

  /* ---------- Barre d'achat mobile ---------- */
  var sb = document.getElementById('stickybar');
  if (sb) {
    sb.hidden = false;
    var hero = document.querySelector('.hero');
    var ft = document.querySelector('.ft');
    function syncBar() {
      var past = hero ? hero.getBoundingClientRect().bottom < 60 : false;
      var atEnd = ft ? ft.getBoundingClientRect().top < window.innerHeight - 40 : false;
      var show = past && !atEnd;
      sb.classList.toggle('show', show);
      document.body.classList.toggle('hasbar', show);
    }
    window.__syncBar = syncBar;
  }

  /* ---------- Newsletter (démo) ---------- */
  var nl = document.getElementById('nlform');
  if (nl) {
    var err = document.getElementById('nlerr');
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input');
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
      if (!ok) {
        input.setAttribute('aria-invalid', 'true');
        if (err) err.textContent = 'Merci d\'entrer une adresse e-mail valide (exemple : prenom@mail.com).';
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
      nl.classList.add('done');
      input.value = '';
    });
    nl.querySelector('input').addEventListener('input', function () {
      this.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    });
  }


  /* ═══════════════════════════════════════════════════════════════════
     Aperçu produit plein écran (une seule modale, réutilisée par tous)
     ═══════════════════════════════════════════════════════════════════ */
  var GAL = {
    'casquette-sakura-denim': 1, 'casquette-tous-imparfaits-black': 1,
    'chaussettes-tous-imparfaits-x-maison-broussaud-le-coffret': 1,
    'cordons-bleus-amone': 1, 'crewneck-xsite': 2, 'echarpes-ijc-esport': 2,
    'gourde-momiji': 1, 'hoodie-basics-rouge': 1, 'hoodie-basics-vert': 2,
    'hoodie-ijc-black': 2, 'hoodie-kamon-black-red': 2, 'hoodie-momiji-black': 2,
    'hoodie-neo-samourai-kaki-nouvelle-coupe': 2, 'hoodie-neo-samourai-noir-nouvelle-coupe': 3,
    'le-meug': 2, 'maillot-ijc-esport-2026': 3, 'p-te-tartiner-debenoit-classique-550g': 1,
    'pack-mystere-fukubukuro': 1, 'pins-daruma': 1, 'pins-road-trip': 1,
    'surchemise-chainsaw-man': 2, 't-shirt-fujiwara-bleu': 3, 't-shirt-hokkaido': 1,
    't-shirt-ijc-vert': 2, 't-shirt-kyoto': 1, 't-shirt-mecha-black': 2,
    't-shirt-okinawa': 1, 't-shirt-sakura-blanc': 1, 't-shirt-sakura-noir': 2,
    't-shirt-tokyo': 1, 't-shirt-yokai-rouge': 2, 'tasse-mediterraneenne-ijc': 1,
    'tote-bag-road-trip': 1, 'veste-baseball-chainsaw-man-pochita-red': 2,
    'veste-navy-ensemble-yukata': 3, 'veste-yokai-beige': 3,
    'veste-yukata-dinterieur-collection-zen': 2, 'veste-zippee-xsite': 1
  };

  /* Fiches : description, matière, glyphe, note de style. Familles par défaut ensuite. */
  var PV_DATA = {
    'hoodie-kamon-black-red': { jp: '家紋', desc: "Le kamon — le blason familial japonais — repris par JACKY en broderie rouge sur un molleton noir gratté. Coupe droite légèrement oversize, capuche doublée, poche kangourou sans cordon visible.", mat: "Molleton 400 g/m², 85 % coton bio · 15 % polyester recyclé. Broderie fil rouge, pas de flocage qui craquelle.", care: "Lavage 30 °C à l'envers, séchage à l'air, pas de sèche-linge.", fit: "Coupe unisexe, taille normalement. Entre deux tailles, prenez la plus petite." },
    't-shirt-mecha-black': { jp: '妖怪', desc: "Un mecha vu par le prisme yokai : impression sérigraphiée large dos, petit motif poitrine. Le noir est un vrai noir profond, pas un gris foncé après trois lavages.", mat: "Jersey 220 g/m², 100 % coton peigné. Sérigraphie encres à l'eau.", care: "Lavage 30 °C, impression à l'envers, repassage sans toucher le motif.", fit: "Coupe unisexe régulière, épaules tombantes légères." },
    't-shirt-tokyo': { jp: '東京', desc: "Premier arrêt du Road Trip. Le lettrage Tokyo est composé à la main, mélange de katakana et de caractères latins compressés — pensé pour être lisible à trois mètres.", mat: "Jersey 220 g/m², 100 % coton peigné, col côtelé renforcé.", care: "Lavage 30 °C, séchage à l'air.", fit: "Coupe unisexe régulière." },
    't-shirt-kyoto': { jp: '京都', desc: "Kyoto, la halte calme du Road Trip : palette dégradée inspirée des érables de Tofuku-ji, impression plus sobre que les autres pièces de la série.", mat: "Jersey 220 g/m², 100 % coton peigné.", care: "Lavage 30 °C, séchage à l'air.", fit: "Coupe unisexe régulière." },
    't-shirt-okinawa': { jp: '沖縄', desc: "La pièce la plus solaire du Road Trip. Motif tissé shisa et bleus d'Okinawa, sur un coton volontairement plus léger pour l'été.", mat: "Jersey 220 g/m², 100 % coton peigné.", care: "Lavage 30 °C, séchage à l'air.", fit: "Coupe unisexe régulière." },
    'tote-bag-road-trip': { jp: '袋', desc: "Le tote qui a survécu au vrai road trip de l'équipe : toile épaisse, anses longues portables à l'épaule, coutures doublées aux points de tension.", mat: "Toile coton 340 g/m², sérigraphie deux couleurs. 38 × 42 cm, anses 65 cm.", care: "Lavage 30 °C, ne pas repasser l'impression.", fit: "Taille unique · supporte environ 10 kg." },
    'tasse-mediterraneenne-ijc': { jp: '茶', desc: "Née d'une blague de tournage devenue objet : la tasse méditerranéenne d'Ici Japon Corp., céramique épaisse et anse large.", mat: "Céramique émaillée 33 cl. Compatible micro-ondes et lave-vaisselle.", care: "Lave-vaisselle OK, éviter les chocs thermiques.", fit: "33 cl · hauteur 9,5 cm." },
    'pins-road-trip': { jp: '徽章', desc: "Le pin's souvenir du Road Trip : métal émaillé à froid, attache papillon, à épingler sur une veste, un tote ou une casquette.", mat: "Métal émaillé, 25 mm, attache papillon métal.", care: "Nettoyer au chiffon sec.", fit: "Taille unique." },
    'crewneck-xsite': { jp: '限定', desc: "Fin de série Xsite : le crewneck lourd de la collaboration, molleton gratté et broderie discrète. Il n'y aura pas de réédition — les tailles parties sont parties.", mat: "Molleton 420 g/m², 80 % coton · 20 % polyester recyclé, bords-côtes renforcés.", care: "Lavage 30 °C à l'envers, séchage à plat.", fit: "Coupe droite, légèrement oversize." },
    'surchemise-chainsaw-man': { jp: '公式', desc: "Surchemise sous licence officielle Chainsaw Man : sergé épais, poches poitrine, broderie Pochita sur le cœur. Portable ouverte sur un t-shirt ou fermée comme une veste légère.", mat: "Sergé de coton 280 g/m², boutons corozo, broderie fil trois couleurs.", care: "Lavage 30 °C, repassage doux.", fit: "Coupe chemise ample, taille normalement." },
    'casquette-sakura-denim': { jp: '桜', desc: "Casquette six panneaux en denim lavé, broderie sakura sur le panneau avant, fermeture métal réglable. Le denim se patine avec le temps, c'est voulu.", mat: "Denim coton 12 oz lavé, doublure coton, boucle métal.", care: "Nettoyage à la main, ne pas machine.", fit: "Taille unique réglable (54–60 cm)." },
    'gourde-momiji': { jp: '紅葉', desc: "Gourde isotherme gravée du motif Momiji : garde le froid 24 h et le chaud 12 h. Bouchon étanche, pas de goût métallique.", mat: "Inox 18/8 double paroi, 500 ml, sans BPA. Gravure laser.", care: "Lavage à la main recommandé.", fit: "500 ml · hauteur 26 cm." },
    'pins-daruma': { jp: '達磨', desc: "Le daruma, porte-bonheur qu'on peint quand un vœu se réalise. Version pin's émaillé, le second œil reste à remplir.", mat: "Métal émaillé, 22 mm, attache papillon métal.", care: "Nettoyer au chiffon sec.", fit: "Taille unique." },
    'veste-baseball-chainsaw-man-pochita-red': { jp: '公式', desc: "Veste baseball sous licence officielle Chainsaw Man. Corps rouge, manches contrastées, patch Pochita brodé et boutons pression métal.", mat: "Corps molleton 340 g/m², manches sergé, doublure satinée. Patchs brodés.", care: "Lavage 30 °C à l'envers, pas de sèche-linge.", fit: "Coupe teddy régulière, taille normalement." },
    'chaussettes-tous-imparfaits-x-maison-broussaud': { jp: '職人', desc: "Trois paires tricotées par Maison Broussaud, bonnetier français depuis 1936. Motifs sakura, kamon et momiji, coton peigné épais.", mat: "78 % coton peigné · 20 % polyamide · 2 % élasthanne. Fabriqué en France.", care: "Lavage 30 °C, pas de sèche-linge.", fit: "Deux tailles : 39–42 et 43–46." },
    'cordons-bleus-amone': { jp: '本', desc: "Le livre illustré d'Amone : la cuisine japonaise du quotidien, dessinée plutôt que photographiée. 128 pages, impression française.", mat: "128 pages, papier offset 140 g, couverture cartonnée, 19 × 25 cm.", care: "Ranger à l'abri de l'humidité.", fit: "Exemplaire unique." },
    'p-te-tartiner-debenoit-classique-550g': { jp: '食', desc: "La pâte à tartiner DEBENOÎT, version classique 550 g. Noisettes torréfiées, sans huile de palme — la collab la plus dangereuse du catalogue.", mat: "Pot verre 550 g. Ingrédients et allergènes détaillés sur l'étiquette.", care: "À conserver à température ambiante, consommer sous 3 semaines après ouverture.", fit: "550 g." },
    'maillot-ijc-esport-2026': { jp: '競技', desc: "Le maillot officiel de l'équipe IJC Esport, saison 2026 · LFL. Maille technique respirante, sponsors sublimés, numéro au dos.", mat: "Maille polyester recyclé 145 g/m², impression sublimation.", care: "Lavage 30 °C, pas d'assouplissant.", fit: "Coupe sport ajustée, prenez une taille au-dessus pour un porté large." },
    'pack-mystere-fukubukuro': { jp: '福袋', desc: "Le fukubukuro version Tous Imparfaits : un sac scellé, une valeur garantie supérieure au prix payé, et aucune idée de ce qu'il y a dedans. Fins de séries, prototypes et pièces sorties du catalogue.", mat: "Contenu variable : 3 à 5 pièces (75 €) ou 6 à 9 pièces (150 €).", care: "Selon les pièces reçues.", fit: "Indiquez votre taille habituelle en commentaire de commande." }
  };

  var FAM = [
    [/^hoodie/, { jp: '衣', desc: "Le hoodie maison : molleton lourd gratté à l'intérieur, capuche doublée et bords-côtes qui ne se détendent pas au troisième lavage.", mat: "Molleton 400 g/m², coton majoritaire, polyester recyclé.", care: "Lavage 30 °C à l'envers, séchage à l'air.", fit: "Coupe unisexe droite, taille normalement." }],
    [/^t-shirt/, { jp: '衣', desc: "Coton peigné épais, col côtelé renforcé et impression encres à l'eau : un t-shirt fait pour être porté cent fois, pas dix.", mat: "Jersey 220 g/m², 100 % coton peigné.", care: "Lavage 30 °C, impression à l'envers.", fit: "Coupe unisexe régulière." }],
    [/^veste|^surchemise/, { jp: '羽織', desc: "Pièce d'extérieur en série courte : tissu tenu, finitions doublées et coupe pensée pour se porter en mi-saison sur un sweat.", mat: "Sergé ou molleton lourd selon le modèle, doublure coton.", care: "Lavage 30 °C, repassage doux.", fit: "Coupe régulière, taille normalement." }],
    [/^casquette/, { jp: '帽', desc: "Casquette structurée, broderie directe et fermeture réglable. Taille unique, portable par tout le monde.", mat: "Coton ou denim selon le coloris, doublure coton.", care: "Nettoyage à la main.", fit: "Taille unique réglable (54–60 cm)." }],
    [/^echarpes/, { jp: '襟巻', desc: "L'écharpe de supporter IJC Esport : maille jacquard double face, franges nouées à la main.", mat: "Maille acrylique jacquard, 140 × 18 cm.", care: "Lavage à la main, séchage à plat.", fit: "Taille unique." }],
    [/^le-meug|^tasse/, { jp: '茶', desc: "Céramique émaillée épaisse, anse large, motif cuit dans l'émail : il ne partira pas au lave-vaisselle.", mat: "Céramique émaillée 33 cl.", care: "Lave-vaisselle et micro-ondes OK.", fit: "33 cl." }],
    [/^pins/, { jp: '徽章', desc: "Pin's métal émaillé à froid, attache papillon. Le petit objet qu'on garde des années.", mat: "Métal émaillé, 22–25 mm.", care: "Chiffon sec.", fit: "Taille unique." }],
    [/^crewneck/, { jp: '衣', desc: "Le crewneck lourd, sans capuche ni cordon : molleton gratté, bords-côtes renforcés, silhouette droite.", mat: "Molleton 420 g/m².", care: "Lavage 30 °C à l'envers.", fit: "Coupe droite légèrement oversize." }]
  ];

  var pv = document.getElementById('pv');
  if (pv) {
    var PV_SIZES = ['S', 'M', 'L', 'XL'];
    var pvState = { slug: '', name: '', type: '', price: 0, old: 0, img: '', gal: [], sizes: [], out: [], size: '', qty: 1, uni: '', stock: '' };
    var pvLastFocus = null;

    var $pv = function (id) { return document.getElementById(id); };

    function pvSlug(src) {
      var m = String(src || '').match(/assets\/(.+?)-(\d)\.webp/);
      return m ? m[1] : String(src || '').replace(/^assets\//, '').replace(/\.\w+$/, '');
    }
    function pvSheet(slug) {
      if (PV_DATA[slug]) return PV_DATA[slug];
      for (var i = 0; i < FAM.length; i++) if (FAM[i][0].test(slug)) return FAM[i][1];
      return { jp: '品', desc: "Pièce en série courte dessinée par JACKY pour Tous Imparfaits. Fabrication en petite quantité, jamais rééditée à l'identique.", mat: "Détails matière communiqués sur la fiche produit complète.", care: "Suivre l'étiquette d'entretien.", fit: "Voir le guide des tailles." };
    }

    function pvOpen(src) {
      var card = src;
      var isCollab = card.classList.contains('collab');
      var img = card.querySelector('img');
      var slug = pvSlug(img && img.getAttribute('src'));
      var sheet = pvSheet(slug);

      var name, type, price = 0, old = 0, badge = '', stock = '', sizes = [], out = [], uni = '';

      if (isCollab) {
        name = (card.querySelector('.collab__name') || {}).textContent || '';
        type = (card.querySelector('.collab__tag') || {}).textContent || 'Collaboration';
        var meta = card.querySelector('.collab__meta');
        var mb = meta && meta.querySelector('b');
        if (mb) price = parseFloat(mb.textContent.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
        if (meta) uni = meta.textContent.replace(mb ? mb.textContent : '', '').trim();
        badge = 'Collab';
      } else {
        name = (card.querySelector('.card__name') || {}).textContent || '';
        type = (card.querySelector('.card__type') || {}).textContent || '';
        price = priceOf(card);
        var oldEl = card.querySelector('.card__price s');
        if (oldEl) old = parseFloat(oldEl.textContent.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
        var bEl = card.querySelector('.card__badge');
        if (bEl) badge = bEl.textContent.trim();
        var stEl = card.querySelector('.card__body .mono-s');
        if (stEl) stock = stEl.textContent.trim();
        var szs = card.querySelectorAll('.card__sizes > *');
        if (szs.length) {
          szs.forEach(function (n) {
            var lbl = (n.textContent || '').replace(/\s*épuisée\s*/i, '').trim();
            if (/^(S|M|L|XL|XXL)$/.test(lbl)) {
              sizes.push(lbl);
              if (n.classList.contains('out')) out.push(lbl);
            } else { uni = lbl; }
          });
        }
      }
      var apparel = /hoodie|t-shirt|veste|surchemise|crewneck|maillot|chaussettes/.test(slug);
      if (!sizes.length && apparel) {
        sizes = PV_SIZES.slice();
        if (/chaussettes/.test(slug)) sizes = ['39–42', '43–46'];
        if (isCollab && uni) { type = type + ' · ' + uni; }
        uni = '';
      }
      if (!sizes.length && !uni) uni = 'Taille unique';
      if (isCollab && uni && uni !== 'Taille unique' && type.indexOf(uni) < 0) { type = type + ' · ' + uni; uni = ''; }

      var n = GAL[slug] || 1, gal = [];
      for (var i = 0; i < n; i++) gal.push('assets/' + slug + '-' + i + '.webp');
      if (!GAL[slug] && img) gal = [img.getAttribute('src')];

      pvState = {
        slug: slug, name: name.trim(), type: type.trim(), price: price, old: old,
        gal: gal, img: gal[0], sizes: sizes, out: out,
        size: '', qty: 1, uni: uni, stock: stock, badge: badge, sheet: sheet
      };
      var firstOk = sizes.filter(function (s) { return out.indexOf(s) < 0; });
      if (firstOk.length === 1) pvState.size = firstOk[0];

      pvRender();
      pvLastFocus = document.activeElement;
      pv.hidden = false;
      pv.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(function () { pv.classList.add('open'); });
      lock('pv');
      var x = $pv('pvx');
      if (x) setTimeout(function () { x.focus(); }, 60);
    }

    function pvClose() {
      if (pv.hidden) return;
      pv.classList.remove('open');
      pv.setAttribute('aria-hidden', 'true');
      unlock('pv');
      setTimeout(function () { pv.hidden = true; }, 280);
      if (pvLastFocus && pvLastFocus.focus) pvLastFocus.focus();
    }

    function pvRender() {
      var s = pvState, sh = s.sheet;
      var mainImg = $pv('pv-img');
      if (mainImg) { mainImg.src = s.img; mainImg.alt = s.name; }
      var bd = $pv('pv-badge');
      if (bd) { bd.textContent = s.badge || ''; bd.hidden = !s.badge; }

      $pv('pv-jp').textContent = sh.jp;
      $pv('pv-type').textContent = s.type || 'Tous Imparfaits';
      $pv('pv-name').textContent = s.name;
      $pv('pv-price').innerHTML = (s.old ? '<s>' + euros(s.old) + '</s>' : '') + '<b>' + euros(s.price) + '</b>' +
        (s.old ? '<span class="pv__save">−' + Math.round((1 - s.price / s.old) * 100) + ' %</span>' : '');
      var st = $pv('pv-stock');
      st.textContent = s.stock || (s.out.length ? 'Certaines tailles sont épuisées — pas de réédition.' : 'En stock · expédié sous 48–72 h');
      st.className = 'pv__stock' + (s.stock || s.out.length ? ' pv__stock--low' : '');
      $pv('pv-desc').textContent = sh.desc;
      $pv('pv-mat').textContent = sh.mat;
      $pv('pv-care').textContent = sh.care;
      $pv('pv-fit').textContent = sh.fit;

      /* galerie */
      var th = $pv('pv-thumbs');
      th.innerHTML = '';
      th.hidden = s.gal.length < 2;
      s.gal.forEach(function (g, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pv__th' + (g === s.img ? ' on' : '');
        b.setAttribute('aria-label', 'Visuel ' + (i + 1) + ' de ' + s.gal.length);
        b.innerHTML = '<img src="' + esc(g) + '" alt="" loading="lazy" decoding="async">';
        b.addEventListener('click', function () { pvState.img = g; pvRender(); });
        li.appendChild(b); th.appendChild(li);
      });

      /* tailles */
      var szw = $pv('pv-szwrap'), szs = $pv('pv-szs');
      if (s.sizes.length) {
        szw.hidden = false;
        szs.innerHTML = '';
        s.sizes.forEach(function (sz) {
          var isOut = s.out.indexOf(sz) >= 0;
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'pv__szb' + (isOut ? ' out' : '') + (s.size === sz ? ' on' : '');
          b.textContent = sz;
          b.setAttribute('aria-pressed', s.size === sz ? 'true' : 'false');
          if (isOut) {
            b.disabled = true;
            b.title = 'Taille ' + sz + ' épuisée';
            b.innerHTML = sz + '<span class="sr"> épuisée</span>';
          } else {
            b.addEventListener('click', function () { pvState.size = sz; pvRender(); });
          }
          szs.appendChild(b);
        });
        $pv('pv-szhint').textContent = s.size ? '· ' + s.size + ' sélectionnée' : '· sélectionnez une taille';
      } else {
        szs.innerHTML = '';
        szw.hidden = true;
      }
      var uniEl = $pv('pv-uni');
      uniEl.hidden = !s.uni || s.sizes.length > 0;
      uniEl.textContent = s.uni;

      /* quantité + total */
      $pv('pv-q').textContent = s.qty;
      $pv('pv-qminus').disabled = s.qty <= 1;
      $pv('pv-qplus').disabled = s.qty >= 10;
      $pv('pv-tot').textContent = euros(s.price * s.qty);

      var add = $pv('pv-add');
      var need = s.sizes.length && !s.size;
      add.disabled = false;
      add.querySelector('span').textContent = need ? 'Choisir une taille' : 'Ajouter au panier · ' + euros(s.price * s.qty);
      add.classList.toggle('is-need', !!need);

      /* ventes croisées */
      var xs = $pv('pv-xs');
      if (xs && !xs.dataset.done) {
        xs.dataset.done = '1';
      }
      pvXsell();
    }

    var XS = [
      ['Casquette Tous Imparfaits — Black', 'Casquette', 25, 'assets/casquette-tous-imparfaits-black-0.webp', 'Taille unique'],
      ['Le Meug', 'Mug', 20, 'assets/le-meug-0.webp', '33 cl'],
      ['Gourde Momiji', 'Gourde', 30, 'assets/gourde-momiji-0.webp', 'Taille unique'],
      ['Pin\u2019s Daruma', 'Pin\u2019s', 5, 'assets/pins-daruma-0.webp', 'Taille unique'],
      ['Tote Bag Road Trip', 'Tote bag', 15, 'assets/tote-bag-road-trip-0.webp', 'Taille unique']
    ];
    function pvXsell() {
      var wrap = $pv('pv-xslist');
      if (!wrap) return;
      wrap.innerHTML = '';
      XS.filter(function (p) { return p[0] !== pvState.name; }).slice(0, 4).forEach(function (p) {
        var li = document.createElement('li');
        li.innerHTML = '<img src="' + esc(p[3]) + '" width="120" height="120" loading="lazy" decoding="async" alt="">' +
          '<span class="pv__xt"><span class="pv__xn">' + esc(p[0]) + '</span><span class="pv__xp">' + euros(p[2]) + '</span></span>';
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'pv__xb'; b.textContent = '+';
        b.setAttribute('aria-label', 'Ajouter ' + p[0] + ' au panier');
        b.addEventListener('click', function () { addFromData(p.join('|')); });
        li.appendChild(b);
        wrap.appendChild(li);
      });
    }

    function pvAdd(then) {
      var s = pvState;
      if (s.sizes.length && !s.size) {
        var szs = $pv('pv-szs');
        szs.classList.remove('shake');
        void szs.offsetWidth;
        szs.classList.add('shake');
        $pv('pv-szhint').textContent = '· choisissez une taille disponible';
        var f = szs.querySelector('.pv__szb:not(.out)');
        if (f) f.focus();
        return;
      }
      var size = s.size || s.uni || 'Taille unique';
      var key = s.name + '|' + size;
      var found = null;
      ITEMS.forEach(function (it) { if (it.key === key) found = it; });
      if (found) found.qty += s.qty;
      else ITEMS.push({
        key: key, name: s.name, type: s.type || 'Tous Imparfaits', size: size,
        img: s.gal[0], sizes: s.sizes.length ? s.sizes : [], price: s.price, qty: s.qty, tag: ''
      });
      renderCart();
      showToast('<b>' + esc(s.name) + '</b> · ' + size + ' ×' + s.qty + ' ajouté au panier');
      if (then === 'cart') { pvClose(); setTimeout(openCart, 200); }
      else pvClose();
    }

    /* --- contrôles --- */
    $pv('pvx').addEventListener('click', pvClose);
    pv.addEventListener('click', function (e) { if (e.target === pv) pvClose(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pv.hidden) { e.stopPropagation(); pvClose(); }
    });
    $pv('pv-qminus').addEventListener('click', function () { if (pvState.qty > 1) { pvState.qty--; pvRender(); } });
    $pv('pv-qplus').addEventListener('click', function () { if (pvState.qty < 10) { pvState.qty++; pvRender(); } });
    $pv('pv-add').addEventListener('click', function () { pvAdd(); });
    $pv('pv-buy').addEventListener('click', function () { pvAdd('cart'); });

    /* --- déclencheurs sur toutes les cartes --- */
    document.querySelectorAll('.card').forEach(function (card) {
      var media = card.querySelector('.card__media');
      if (media && !media.querySelector('.card__quick')) {
        var q = document.createElement('button');
        q.type = 'button';
        q.className = 'card__quick';
        q.innerHTML = '<span>Aperçu</span>';
        q.setAttribute('aria-label', 'Aperçu de ' + ((card.querySelector('.card__name') || {}).textContent || 'l\u2019article'));
        media.appendChild(q);
        q.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); pvOpen(card); });
      }
      if (media) media.addEventListener('click', function (e) {
        if (e.target.closest('.card__add') || e.target.closest('.card__quick') || e.target.closest('.szb')) return;
        pvOpen(card);
      });
      var nm = card.querySelector('.card__name');
      if (nm) {
        nm.style.cursor = 'pointer';
        nm.addEventListener('click', function () { pvOpen(card); });
      }
    });
    document.querySelectorAll('.collab').forEach(function (c) {
      c.addEventListener('click', function (e) { e.preventDefault(); pvOpen(c); });
    });
  }

  /* --- ouverture automatique du bloc légal ciblé --- */
  document.querySelectorAll('.ft a[href^="#legal-"]').forEach(function (a) {
    a.addEventListener('click', function () {
      var d = document.querySelector(a.getAttribute('href'));
      if (d && d.tagName === 'DETAILS') d.open = true;
    });
  });

  /* ---------- Boucle scroll ---------- */
  var ticking = false;
  function loop() {
    onScroll();
    onWorldsScroll();
    if (window.__syncBar) window.__syncBar();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }, { passive: true });
  window.addEventListener('resize', loop);
  loop();
})();


/* ── Footer en accordéons sur mobile ── */
(function footerAccordion() {
  if (!window.matchMedia('(max-width: 860px)').matches) return;
  document.querySelectorAll('.ft__grid > div:not(.ft__brand)').forEach(function (col) {
    Array.prototype.slice.call(col.children).filter(function (n) {
      return n.classList && n.classList.contains('ft__h');
    }).forEach(function (h) {
      var ul = h.nextElementSibling;
      if (!ul || ul.tagName !== 'UL') return;
      var d = document.createElement('details');
      d.className = 'ftacc';
      var sm = document.createElement('summary');
      sm.textContent = h.textContent.trim();
      d.appendChild(sm);
      col.insertBefore(d, h);
      d.appendChild(ul);
      h.remove();
    });
  });
})();
