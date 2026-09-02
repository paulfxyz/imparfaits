/* --- Le logo : l'intro qui passe du nom a la signature ---------------------
   IMPARFAITS -> TOUS IMPARFAITS -> TOUS IM/PARFAITS -> IM/PARFAITS -> + signe,
   et dans le header : le signe se retire et IM/PARFAITS se range a gauche.
   Elle ne tourne pas en boucle : elle joue une fois quand le logo entre en
   scene, puis se rejoue au survol, ou au clic quand le logo n'est pas un lien. */
(function () {
  var logos = [].slice.call(document.querySelectorAll('[data-tilogo]'));
  if (!logos.length) return;

  /* Les verrous d'en-tete des trois pages (accueil, planche, offre) jouent une
     phase de plus : l'ecusson se retire et IM/PARFAITS glisse se ranger a
     gauche, seul. Les verrous de fin de page s'arretent a p4, avec le signe. */
  var PH = ['p1', 'p2', 'p3', 'p4', 'p5'];
  var STEP = [80, 720, 1360, 1700, 2760];
  var TOP = ['tilogo--hdr', 'tilogo--nav', 'tilogo--board'];
  function steps(el) {
    for (var i = 0; i < TOP.length; i++) {
      if (el.classList.contains(TOP[i])) return PH.length;
    }
    return 4;
  }
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clear(el) {
    (el.__t || []).forEach(clearTimeout);
    el.__t = [];
  }

  function play(el) {
    if (el.__busy) return;               /* on ne relance pas par-dessus */
    el.__busy = 1;
    clear(el);
    PH.forEach(function (c) { el.classList.remove(c); });

    var n = steps(el);
    if (still) {                          /* pas de mouvement : etat final direct */
      el.classList.add('no-anim');
      PH.slice(0, n).forEach(function (c) { el.classList.add(c); });
      el.__busy = 0;
      return;
    }
    void el.offsetWidth;                  /* on force le reflow avant de rejouer */
    PH.slice(0, n).forEach(function (c, i) {
      el.__t.push(setTimeout(function () { el.classList.add(c); }, STEP[i]));
    });
    el.__t.push(setTimeout(function () { el.__busy = 0; }, STEP[n - 1] + 760));
  }

  logos.forEach(function (el) {
    el.__t = [];
    /* le survol rejoue, sur les appareils qui savent survoler */
    if (window.matchMedia && matchMedia('(hover: hover)').matches) {
      var zone = el.closest('a, button') || el;
      zone.addEventListener('pointerenter', function () { play(el); });
    }
    /* hors lien, le clic rejoue aussi : c'est le seul geste dispo au doigt */
    if (!el.closest('a, button')) {
      el.addEventListener('click', function () { play(el); });
    }
  });

  function start() {
    var hdr = document.querySelector('.tilogo--hdr, .tilogo--nav, .tilogo--board');
    if (hdr) play(hdr);
    var rest = logos.filter(function (el) { return el !== hdr; });
    if (!rest.length) return;
    if (!('IntersectionObserver' in window)) { rest.forEach(play); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        play(e.target);
      });
    }, { threshold: .55 });
    rest.forEach(function (el) { io.observe(el); });
  }

  /* on attend la police : les segments se replient sur leur largeur reelle */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(start, 90); });
  } else {
    setTimeout(start, 260);
  }
})();
