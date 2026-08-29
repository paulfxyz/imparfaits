/* --- Section rebranding : la rencontre du nom et de l'ecusson, une seule fois --- */
(function () {
  var scenes = [].slice.call(document.querySelectorAll('[data-rebanim]'));
  if (!scenes.length) return;
  var PH = ['is-p1', 'is-p2', 'is-p3', 'is-p4'];
  var AT = [60, 1150, 2060, 2820];
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* chaque scene est autonome : sa signature et son bouton sont cherches dans
     son propre cadre, jamais dans le document entier. */
  function wire(el) {
  var box = el.closest('[data-reb-scene]') || el.parentNode;
  var ijc = box.querySelector('[data-rebijc]');
  var timers = [];

  function play() {
    timers.forEach(clearTimeout); timers = [];
    el.classList.remove('no-anim');
    PH.forEach(function (c) { el.classList.remove(c); });
    void el.offsetWidth;
    if (ijc) ijc.classList.remove('is-on');
    if (mq.matches) {
      el.classList.add('no-anim');
      PH.forEach(function (c) { el.classList.add(c); });
      if (ijc) ijc.classList.add('is-on');
      return;
    }
    PH.forEach(function (c, i) {
      timers.push(setTimeout(function () { el.classList.add(c); }, AT[i]));
    });
    /* la signature Ici Japon Corp. arrive apres la rencontre, jamais avant */
    if (ijc) timers.push(setTimeout(function () { ijc.classList.add('is-on'); }, AT[3] + 780));
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); play(); } });
    }, { threshold: 0.4 });
    io.observe(el);
  } else { play(); }

  var btn = box.querySelector('[data-reb-replay]');
  if (btn) btn.addEventListener('click', play);
  /* un clic n’importe ou dans le cadre rejoue aussi la rencontre */
  var frame = box.querySelector('[data-reb-frame]');
  if (frame) {
    frame.style.cursor = 'pointer';
    frame.addEventListener('click', play);
  }

  /* sur l’accueil, le logo du header ramene ici et rejoue la rencontre */
  if (el.hasAttribute('data-reb-hdr')) {
    var logo = document.querySelector('.hdr__logo');
    if (logo) logo.addEventListener('click', function () { setTimeout(play, 640); });
  }
  }

  scenes.forEach(wire);
})();
