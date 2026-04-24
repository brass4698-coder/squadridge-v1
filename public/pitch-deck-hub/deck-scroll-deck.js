/**
 * Vertical scroll pitch decks: snap between `section.slide` siblings,
 * sync dots/counter/disabled arrows with IntersectionObserver.
 * Expects elements from deck markup (see pilot-partner-deck.html).
 */
(function () {
  const slides = Array.from(document.querySelectorAll('body > section.slide'));
  if (slides.length === 0) return;

  const total = slides.length;
  const counterEl = document.getElementById('scroll-deck-counter');
  const dotRow = document.getElementById('scroll-deck-dots');
  const prevBtns = document.querySelectorAll('[data-scroll-deck-prev]');
  const nextBtns = document.querySelectorAll('[data-scroll-deck-next]');
  let idx = 0;

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function updateDots() {
    if (!dotRow) return;
    dotRow.querySelectorAll('.deck-dot').forEach((d, i) => {
      d.setAttribute('aria-current', i === idx ? 'true' : 'false');
    });
  }

  function setDisabled() {
    const atStart = idx <= 0;
    const atEnd = idx >= total - 1;
    document.querySelectorAll('[data-scroll-deck-prev]').forEach((b) => {
      b.disabled = atStart;
    });
    document.querySelectorAll('[data-scroll-deck-next]').forEach((b) => {
      b.disabled = atEnd;
    });
  }

  function syncFooterNums() {
    document.querySelectorAll('.js-deck-slide-num').forEach((el) => {
      const slide = el.closest('section.slide');
      if (!slide) return;
      const si = slides.indexOf(slide);
      if (si === -1) return;
      el.textContent =
        String(si + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    });
  }

  function setCounter() {
    if (counterEl) {
      counterEl.textContent = idx + 1 + ' / ' + total;
    }
    syncFooterNums();
    updateDots();
    setDisabled();
  }

  function go(i) {
    idx = Math.max(0, Math.min(total - 1, i));
    slides[idx].scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
    setCounter();
  }

  if (dotRow) {
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'deck-dot';
      b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      b.addEventListener('click', () => go(i));
      dotRow.appendChild(b);
    }
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.intersectionRatio < 0.5) return;
        const si = slides.indexOf(en.target);
        if (si !== -1) {
          idx = si;
          setCounter();
        }
      });
    },
    { root: null, threshold: [0.5, 0.55] },
  );
  slides.forEach((s) => io.observe(s));

  prevBtns.forEach((b) => b.addEventListener('click', () => go(idx - 1)));
  nextBtns.forEach((b) => b.addEventListener('click', () => go(idx + 1)));

  document.addEventListener('keydown', (e) => {
    const tgt = e.target;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA' || tgt.isContentEditable)) {
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      go(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      go(idx - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      go(total - 1);
    }
  });

  setCounter();
})();
