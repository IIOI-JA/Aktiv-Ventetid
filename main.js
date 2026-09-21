/* ============================================================
   AKTIV VENTETID — interaction engine
   Zero dependencies. Native scroll-snap + one IntersectionObserver.
   ============================================================ */
(() => {
  'use strict';

  const deck   = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots   = Array.from(document.querySelectorAll('.slide-nav .dot'));
  const ctrNum = document.querySelector('.ctr-num');
  const ctrTot = document.querySelector('.ctr-tot');
  const body   = document.body;

  if (ctrTot) ctrTot.textContent = String(slides.length).padStart(2, '0');

  // ---- loader dismiss ----
  window.addEventListener('load', () => {
    setTimeout(() => body.classList.remove('is-loading'), 250);
  });
  // Safety net: never let a stalled asset keep the loader up forever.
  setTimeout(() => body.classList.remove('is-loading'), 2500);

  // ---- in-view observer: drives reveals + active dot + counter ----
  let currentIndex = 0;
  const setActive = (index) => {
    if (index === currentIndex && slides[index]?.classList.contains('is-active')) return;
    currentIndex = index;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    if (ctrNum) ctrNum.textContent = String(index + 1).padStart(2, '0');
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
        const idx = slides.indexOf(entry.target);
        if (idx !== -1) setActive(idx);
      }
    });
  }, { threshold: [0, 0.55, 1] });
  slides.forEach((s) => io.observe(s));

  // reveal the first slide immediately (no scroll event fires on load)
  requestAnimationFrame(() => setActive(0));

  // ---- navigation: dots + keyboard ----
  const goTo = (index) => {
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    slides[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(currentIndex + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(currentIndex - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(slides.length - 1); }
  });
})();
