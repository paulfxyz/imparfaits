/* ═══════════════════════════════════════════════════════════════════════════
   Boutons flottants + modale de contact
   ─────────────────────────────────────────────────────────────────────────
   Deux boutons en bas à droite : retour en haut (apparaît une fois la page
   entamée) et « nous écrire ». La modale ouvre trois vues : les canaux, un
   message court, une demande de rendez-vous filtrée par un motif obligatoire.
   Le site est statique : les deux formulaires composent un courriel prêt à
   partir dans la messagerie du visiteur. Rien n'est stocké ici.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── à changer si les canaux bougent ───────────────────────────────────── */
  var MAIL = 'tousimparfaits@gmail.com';

  var doc = document;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || doc).querySelectorAll(s)); };

  /* le verrou de défilement est partagé avec app.js : on l'emprunte, et on
     retombe sur la classe si le fichier principal n'a pas encore tourné */
  function lock() {
    if (window.TI_LOCK) window.TI_LOCK.lock('contact');
    else doc.body.classList.add('locked', 'locked-cart');
  }
  function unlock() {
    if (window.TI_LOCK) window.TI_LOCK.unlock('contact');
    else doc.body.classList.remove('locked', 'locked-cart');
  }

  /* ═══ 1. retour en haut ══════════════════════════════════════════════════ */
  var top = $('#fabtop');
  if (top) {
    var shown = false;
    var seuil = function () { return Math.max(520, window.innerHeight * 0.9); };
    var sync = function () {
      var v = window.pageYOffset > seuil();
      if (v === shown) return;
      shown = v; top.hidden = !v;
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    top.addEventListener('click', function () {
      var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
      var skip = $('.skip') || $('a[href="#main"]');
      if (skip) { try { skip.focus({ preventScroll: true }); } catch (e) {} }
    });
  }

  /* ═══ 2. la modale ═══════════════════════════════════════════════════════ */
  var ct = $('#ct');
  var chat = $('#fabchat');
  if (!ct || !chat) return;

  var frame = $('.ct__frame', ct);
  var views = $$('.ct__view', ct);
  var last = null;
  var timer = null;

  function show(name) {
    views.forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
    var v = $('.ct__view[data-view="' + name + '"]', ct);
    if (frame) frame.scrollTop = 0;
    var f = v && v.querySelector('button, a, input, select, textarea');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
  }

  function open(view) {
    last = doc.activeElement;
    clearTimeout(timer);
    ct.hidden = false;
    show(view || 'hub');
    requestAnimationFrame(function () { ct.classList.add('open'); });
    chat.classList.add('is-open');
    chat.setAttribute('aria-expanded', 'true');
    lock();
  }

  function close() {
    if (ct.hidden) return;
    ct.classList.remove('open');
    chat.classList.remove('is-open');
    chat.setAttribute('aria-expanded', 'false');
    unlock();
    timer = setTimeout(function () { ct.hidden = true; }, 280);
    if (last && last.focus) { try { last.focus({ preventScroll: true }); } catch (e) {} }
  }

  chat.setAttribute('aria-expanded', 'false');
  chat.addEventListener('click', function () { ct.hidden ? open('hub') : close(); });
  var x = $('#ctx');
  if (x) x.addEventListener('click', close);
  ct.addEventListener('click', function (e) { if (e.target === ct) close(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ct.hidden) close(); });

  $$('[data-go]', ct).forEach(function (b) {
    b.addEventListener('click', function () { show(b.getAttribute('data-go')); });
  });

  /* les liens sortants ferment la modale derrière eux */
  $$('.ct__row[href]', ct).forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(close, 120); });
  });

  /* le clavier reste dans la modale */
  ct.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = $$('button, a[href], input, select, textarea', ct).filter(function (n) {
      return !n.disabled && n.offsetParent !== null;
    });
    if (!f.length) return;
    var first = f[0], lastF = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); lastF.focus(); }
    else if (!e.shiftKey && doc.activeElement === lastF) { e.preventDefault(); first.focus(); }
  });

  /* ── validation légère et partagée ─────────────────────────────────────── */
  function bad(el, is) {
    if (is) el.setAttribute('aria-invalid', 'true');
    else el.removeAttribute('aria-invalid');
    return !is;
  }
  function checkField(el) {
    var v = (el.value || '').trim();
    if (el.hasAttribute('required') && !v) return bad(el, true);
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return bad(el, true);
    var min = parseInt(el.getAttribute('minlength'), 10);
    if (min && v.length < min) return bad(el, true);
    return bad(el, false);
  }
  function checkForm(form) {
    return $$('input, select, textarea', form).reduce(function (ok, el) {
      return checkField(el) && ok;
    }, true);
  }
  function firstBad(form) { return $('[aria-invalid="true"]', form); }

  function send(subject, body) {
    window.location.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  /* ── vue 2 : le message ────────────────────────────────────────────────── */
  var form = $('#ctform');
  if (form) {
    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('blur', function () { checkField(el); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) checkField(el); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!checkForm(form)) { var b = firstBad(form); if (b) b.focus(); return; }
      var d = new FormData(form);
      send('Tous Imparfaits · ' + d.get('sujet'),
        d.get('msg') + '\n\n— ' + d.get('nom') + '\n' + d.get('mail'));
      setTimeout(close, 400);
    });
  }

  /* ═══ 3. le rendez-vous ══════════════════════════════════════════════════ */
  var rdv = $('#ctrdv');
  if (!rdv) return;

  /* des matinées parisiennes : c'est la fin de journée à Tokyo, où est l'équipe */
  var SLOTS = ['08:30', '09:30', '10:30', '11:30', '12:30'];
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  var cal = $('[data-cal]', rdv);
  var grid = $('[data-grid]', cal);
  var molab = $('[data-molab]', cal);
  var slotwrap = $('[data-slotwrap]', rdv);
  var slotbox = $('[data-slots]', rdv);
  var tokyo = $('[data-tokyo]', rdv);
  var sendBtn = $('.ct__send', rdv);

  var today = new Date(); today.setHours(0, 0, 0, 0);
  /* on ouvre à deux jours ouvrés et on ferme à huit semaines */
  var from = new Date(today); from.setDate(from.getDate() + 2);
  var until = new Date(today); until.setDate(until.getDate() + 56);
  var view = new Date(from.getFullYear(), from.getMonth(), 1);
  /* si le mois d'ouverture n'offre presque rien, on part sur le suivant :
     la fleche precedente reste la pour revenir sur les derniers jours */
  var pickedDay = null;
  var pickedSlot = null;

  function ymd(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function usable(d) {
    var w = d.getDay();
    return w !== 0 && w !== 6 && d >= from && d <= until;
  }

  /* décalage d'un fuseau, en minutes, à un instant donné */
  function offset(ts, tz) {
    var p = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date(ts)).reduce(function (o, x) { o[x.type] = x.value; return o; }, {});
    var asUTC = Date.UTC(+p.year, p.month - 1, +p.day, p.hour % 24, +p.minute, +p.second);
    return (asUTC - Math.floor(ts / 1000) * 1000) / 60000;
  }
  /* l'instant réel d'une heure murale à Paris (deux passes : suffisant hors
     seconde intercalaire, et on retombe silencieusement en cas d'ennui) */
  function instant(d, hhmm) {
    var h = hhmm.split(':');
    var guess = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), +h[0], +h[1], 0);
    for (var i = 0; i < 3; i++) {
      var off = offset(guess, 'Europe/Paris');
      var next = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), +h[0], +h[1], 0) - off * 60000;
      if (next === guess) break;
      guess = next;
    }
    return guess;
  }
  function tokyoLine(d, hhmm) {
    try {
      var ts = instant(d, hhmm);
      var f = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Asia/Tokyo', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date(ts));
      return f;
    } catch (e) { return null; }
  }

  function syncSend() {
    var motif = $('[name="motif"]', rdv);
    var ok = !!(pickedDay && pickedSlot && motif && motif.value);
    sendBtn.disabled = !ok;
  }

  function drawSlots() {
    slotbox.innerHTML = '';
    SLOTS.forEach(function (s) {
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'ct__s' + (pickedSlot === s ? ' is-on' : '');
      b.textContent = s;
      b.setAttribute('aria-pressed', pickedSlot === s ? 'true' : 'false');
      b.addEventListener('click', function () {
        pickedSlot = s; drawSlots(); drawTokyo(); syncSend();
      });
      slotbox.appendChild(b);
    });
  }

  function drawTokyo() {
    if (!tokyo) return;
    if (!pickedDay || !pickedSlot) { tokyo.hidden = true; return; }
    var l = tokyoLine(pickedDay, pickedSlot);
    if (!l) { tokyo.hidden = true; return; }
    tokyo.hidden = false;
    tokyo.innerHTML = 'Soit <b>' + l + '</b> à Tokyo — l’équipe est au Japon, on choisit un créneau qui va aux deux.';
  }

  function draw() {
    var y = view.getFullYear(), m = view.getMonth();
    molab.textContent = MOIS[m] + ' ' + y;
    grid.innerHTML = '';
    var first = new Date(y, m, 1);
    var pad = (first.getDay() + 6) % 7; /* la semaine commence le lundi */
    var n = new Date(y, m + 1, 0).getDate();
    for (var i = 0; i < pad; i++) {
      var v = doc.createElement('span');
      v.className = 'ct__d is-void'; v.setAttribute('aria-hidden', 'true');
      grid.appendChild(v);
    }
    for (var d = 1; d <= n; d++) {
      var day = new Date(y, m, d);
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'ct__d';
      b.textContent = d;
      if (!usable(day)) { b.disabled = true; b.setAttribute('aria-disabled', 'true'); }
      else {
        b.setAttribute('aria-label', d + ' ' + MOIS[m] + ' ' + y);
        if (pickedDay && ymd(pickedDay) === ymd(day)) {
          b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true');
        } else b.setAttribute('aria-pressed', 'false');
        (function (dd) {
          b.addEventListener('click', function () {
            pickedDay = dd;
            if (!pickedSlot) pickedSlot = SLOTS[0];
            slotwrap.hidden = false;
            draw(); drawSlots(); drawTokyo(); syncSend();
          });
        })(day);
      }
      grid.appendChild(b);
    }
    var prev = $('[data-mo="-1"]', cal), next = $('[data-mo="1"]', cal);
    prev.disabled = new Date(y, m, 0) < from;
    next.disabled = new Date(y, m + 1, 1) > until;
  }

  $$('[data-mo]', cal).forEach(function (b) {
    b.addEventListener('click', function () {
      view = new Date(view.getFullYear(), view.getMonth() + (+b.getAttribute('data-mo')), 1);
      draw();
    });
  });

  var motifSel = $('[name="motif"]', rdv);
  if (motifSel) motifSel.addEventListener('change', function () { checkField(motifSel); syncSend(); });
  $$('input, textarea', rdv).forEach(function (el) {
    el.addEventListener('blur', function () { checkField(el); });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid')) checkField(el); });
  });

  rdv.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!checkForm(rdv) || !pickedDay || !pickedSlot) {
      var b = firstBad(rdv); if (b) b.focus();
      return;
    }
    var d = new FormData(rdv);
    var quand = JOURS[pickedDay.getDay()] + ' ' + pickedDay.getDate() + ' ' +
      MOIS[pickedDay.getMonth()] + ' ' + pickedDay.getFullYear() + ' à ' + pickedSlot + ' (heure de Paris)';
    var tk = tokyoLine(pickedDay, pickedSlot);
    var corps = 'Motif : ' + d.get('motif') + '\n' +
      'Créneau souhaité : ' + quand + (tk ? '\nSoit à Tokyo : ' + tk : '') + '\n' +
      'Demandé par : ' + d.get('qui') + '\n' +
      'E-mail : ' + d.get('mail') + '\n\n' +
      'Pourquoi c’est important :\n' + d.get('pourquoi') + '\n';
    send('Demande de rendez-vous · ' + d.get('motif'), corps);
    setTimeout(close, 400);
  });

  (function () {
    var y = view.getFullYear(), m = view.getMonth(), n = new Date(y, m + 1, 0).getDate(), c = 0;
    for (var d = 1; d <= n; d++) if (usable(new Date(y, m, d))) c++;
    if (c < 3) view = new Date(y, m + 1, 1);
  })();

  draw(); drawSlots(); syncSend();
})();
