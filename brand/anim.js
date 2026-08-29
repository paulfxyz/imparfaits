/* Les preuves — quatre scènes séquencées, jouées à l'entrée dans le viewport,
   rejouables au clic. Chaque scène cumule ses classes is-p1 → is-pN, N étant
   donné par la longueur de sa cadence. */
(function () {
  'use strict';

  var CARDS = [].slice.call(document.querySelectorAll('.pv[data-pv]'));
  if (!CARDS.length) return;

  var CALM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* le nombre de temps est deduit de la cadence : une scene peut en compter
     cinq la ou les autres en gardent quatre. */
  function phases(n) {
    var a = [], i;
    for (i = 1; i <= n; i++) { a.push('is-p' + i); }
    return a;
  }
  var ALL = phases(6);

  /* cadence propre à chaque scène (ms) */
  var TIME = {
    lecture: [80, 980, 1820, 2680, 3560],
    px: [120, 760, 1420, 2020],
    brode: [80, 700, 1500, 2200],
    cout: [80, 620, 1080, 2100],
    /* six declinaisons : une par temps */
    decl: [80, 480, 860, 1240, 1660, 2120]
  };

  function make(card) {
    var kind = card.getAttribute('data-pv');
    var at = TIME[kind] || [80, 700, 1400, 2100];
    var PH = phases(at.length);
    var timers = [];
    var done = false;

    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function reset() {
      clear();
      ALL.forEach(function (c) { card.classList.remove(c); });
    }

    function play() {
      reset();
      if (CALM) {
        PH.forEach(function (c) { card.classList.add(c); });
        return;
      }
      /* on laisse un tick pour que le retrait des classes soit pris en compte */
      timers.push(setTimeout(function () {
        PH.forEach(function (c, i) {
          timers.push(setTimeout(function () { card.classList.add(c); }, at[i]));
        });
      }, 30));
    }

    var btn = card.querySelector('[data-replay]');
    if (btn) {
      btn.addEventListener('click', function () { play(); });
    }
    card.querySelector('.pv__scene').addEventListener('click', function () { play(); });

    return {
      first: function () {
        if (done) return;
        done = true;
        play();
      }
    };
  }

  var api = CARDS.map(make);

  if (!('IntersectionObserver' in window)) {
    api.forEach(function (a) { a.first(); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = CARDS.indexOf(e.target);
      if (i > -1) api[i].first();
      io.unobserve(e.target);
    });
  }, { threshold: 0.35 });

  CARDS.forEach(function (c) { io.observe(c); });
})();
