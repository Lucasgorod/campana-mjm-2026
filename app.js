/* =============================================================
   MJM 2026 · Dossier · Presentation engine
   - Slide navigation: keyboard, buttons, dots, swipe
   - Active slide management
   - Progress bar + counter
   - Fullscreen toggle (key F)
   ============================================================= */
(function () {
  const deck = document.getElementById('deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const total = slides.length;
  const slideNowEl = document.getElementById('slideNow');
  const slideTotalEl = document.getElementById('slideTotal');
  const hudBarFill = document.getElementById('hudBarFill');
  const navPrev = document.getElementById('navPrev');
  const navNext = document.getElementById('navNext');
  const dotsRoot = document.getElementById('dots');

  let current = 0;

  /* -----  Build dots ----- */
  slides.forEach((_, idx) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.setAttribute('aria-label', 'Ir a slide ' + (idx + 1));
    b.dataset.target = idx;
    b.addEventListener('click', () => goTo(idx));
    dotsRoot.appendChild(b);
  });
  const dots = Array.from(dotsRoot.querySelectorAll('.dot'));

  slideTotalEl.textContent = String(total).padStart(2, '0');

  /* ----- Render ----- */
  function render() {
    slides.forEach((s, i) => {
      s.classList.remove('active', 'prev');
      if (i === current) s.classList.add('active');
      else if (i < current) s.classList.add('prev');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    slideNowEl.textContent = String(current + 1).padStart(2, '0');
    hudBarFill.style.width = ((current + 1) / total * 100) + '%';
    navPrev.disabled = (current === 0);
    navNext.disabled = (current === total - 1);
    if (history.replaceState) history.replaceState(null, '', '#' + (current + 1));
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    render();
  }
  function next() { if (current < total - 1) goTo(current + 1); }
  function prev() { if (current > 0)         goTo(current - 1); }

  /* ----- Keyboard ----- */
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(total - 1); break;
      case 'f':
      case 'F':
        e.preventDefault(); toggleFullscreen(); break;
    }
  });

  /* ----- Buttons ----- */
  navPrev.addEventListener('click', prev);
  navNext.addEventListener('click', next);

  /* ----- Touch / swipe ----- */
  let tx = 0, ty = 0;
  deck.addEventListener('touchstart', (e) => {
    if (e.changedTouches.length === 1) {
      tx = e.changedTouches[0].clientX;
      ty = e.changedTouches[0].clientY;
    }
  }, { passive: true });

  deck.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - tx;
      const dy = e.changedTouches[0].clientY - ty;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    }
  }, { passive: true });

  /* ----- Wheel — only when slide content NOT scrollable (no rebote) ----- */
  let wheelLock = false;
  deck.addEventListener('wheel', (e) => {
    const slide = slides[current];
    const overflow = slide.scrollHeight > slide.clientHeight + 4;
    if (overflow) return; // permite scroll interno
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 30) return;
    wheelLock = true;
    if (e.deltaY > 0) next(); else prev();
    setTimeout(() => { wheelLock = false; }, 700);
  }, { passive: true });

  /* ----- Fullscreen ----- */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ----- Initial state from hash ----- */
  const initial = parseInt((location.hash || '#1').slice(1), 10) - 1;
  if (!isNaN(initial) && initial >= 0 && initial < total) current = initial;

  render();
})();
