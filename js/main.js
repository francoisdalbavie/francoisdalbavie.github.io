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

  /* ── 5. LIGHTBOX — système multi-albums ─────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lb-img');
  const lbCounter   = document.getElementById('lb-counter');
  const lbAlbumName = document.getElementById('lb-album-name');
  const lbClose     = document.getElementById('lb-close');
  const lbPrev      = document.getElementById('lb-prev');
  const lbNext      = document.getElementById('lb-next');

  // Charger les données albums depuis le JSON embarqué
  const albumData = JSON.parse(document.getElementById('album-data').textContent);

  let currentAlbum = null; // clé : "denis" | "speleo" | "captif"
  let currentIndex = 0;

  function thumbUrl(id, size) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=${size || 'w1600'}`;
  }

  function openLightbox(albumKey, index) {
    currentAlbum = albumKey;
    currentIndex = index;
    renderLightbox();
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function renderLightbox() {
    const album = albumData[currentAlbum];
    const total = album.ids.length;
    lbImg.src = thumbUrl(album.ids[currentIndex]);
    lbImg.alt = `${album.label} — ${currentIndex + 1}`;
    lbCounter.textContent = `${currentIndex + 1} / ${total}`;
    lbAlbumName.textContent = album.label;
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lbImg.src = '';
    currentAlbum = null;
  }

  function showPrev() {
    const total = albumData[currentAlbum].ids.length;
    currentIndex = (currentIndex - 1 + total) % total;
    renderLightbox();
  }

  function showNext() {
    const total = albumData[currentAlbum].ids.length;
    currentIndex = (currentIndex + 1) % total;
    renderLightbox();
  }

  // Clic sur une photo de grille
  document.querySelectorAll('.photo-card[data-album]').forEach((card) => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.album, parseInt(card.dataset.index, 10));
    });
  });

  // Clic sur le bouton annexe CAPTIF
  document.querySelectorAll('.annexe-btn[data-album]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(btn.dataset.album, 0);
    });
  });

  // Boutons navigation
  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Clic fond = fermer
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Clavier
  document.addEventListener('keydown', (e) => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape')     closeLightbox();
  });

  /* ── 6. YOUTUBE FAÇADE — chargement différé ─────────────── */
  // Certaines vidéos YouTube ne servent pas maxresdefault.jpg —
  // on tente d'abord cette qualité, et on bascule sur hqdefault si l'image
  // retourne une image "placeholder" (largeur ≤ 120px, typiquement 120×90).
  document.querySelectorAll('.yt-facade').forEach((facade) => {
    const id = facade.dataset.id;
    const img = facade.querySelector('img');

    // Fallback qualité d'image : maxres → hq
    if (img) {
      const checker = new Image();
      checker.onload = function () {
        if (this.naturalWidth <= 120) {
          img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        }
      };
      checker.src = img.src;
    }

    // Clic : injecter l'iframe avec autoplay
    facade.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = facade.dataset.title || 'Vidéo';

      // Supprimer image + bouton, insérer l'iframe
      facade.innerHTML = '';
      facade.appendChild(iframe);
      // Désactiver le curseur hover une fois la vidéo lancée
      facade.classList.remove('yt-facade');
    });
  });

})();
