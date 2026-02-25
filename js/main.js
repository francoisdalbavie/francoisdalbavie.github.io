/* ============================================================
   DALBAVIE — main.js
   Fonctions : curseur custom · scroll reveal · nav active
   Vanilla JS, aucune dépendance
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. CUSTOM CURSOR ────────────────────────────────────── */
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Lerp pour mouvement fluide
  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Agrandir le curseur sur les éléments cliquables
  const hoverTargets = document.querySelectorAll(
    'a, button, .video-card__embed, .photo-card, .nav__link'
  );

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });

  /* ── 2. SCROLL REVEAL ────────────────────────────────────── */
  // On ajoute la classe .reveal à tous les éléments à animer
  const revealSelectors = [
    '.video-card',
    '.photo-card',
    '.fiction-hero',
    '.section__header',
    '.doc-single',
    '.contact__title',
    '.contact__link',
    '.divider',
    '.photo-series-title',
  ];

  document.querySelectorAll(revealSelectors.join(', ')).forEach((el) => {
    el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // ne déclencher qu'une fois
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  /* ── 3. NAV ACTIVE AU SCROLL ─────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    {
      rootMargin: '-40% 0px -50% 0px',
    }
  );

  sections.forEach((sec) => navObserver.observe(sec));

  /* ── 4. NAV OMBRE AU SCROLL ──────────────────────────────── */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 60
      ? 'rgba(60,60,60,0.6)'
      : 'var(--grey-d)';
  }, { passive: true });

})();
