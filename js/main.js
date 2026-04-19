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

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverTargets = document.querySelectorAll(
    'a, button, .video-card__embed, .yt-facade, .photo-card, .section__photo-thumb, .nav__link'
  );

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
  });

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .photo-card, .section__photo-thumb, .yt-facade, .video-card__embed, .nav__link');
    if (target) {
      cursor.classList.add('cursor--hover');
    } else {
      cursor.classList.remove('cursor--hover');
    }
  });

  /* ── 2. SCROLL REVEAL ────────────────────────────────────── */
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
          observer.unobserve(entry.target);
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
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
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
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.borderBottomColor = window.scrollY > 60
        ? 'rgba(60,60,60,0.6)'
        : 'var(--grey-d)';
    }, { passive: true });
  }

  /* ── 5. LIGHTBOX — système multi-albums ─────────────────── */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lb-img');
  const lbCounter   = document.getElementById('lb-counter');
  const lbAlbumName = document.getElementById('lb-album-name');
  const lbClose     = document.getElementById('lb-close');
  const lbPrev      = document.getElementById('lb-prev');
  const lbNext      = document.getElementById('lb-next');

  const albumDataEl = document.getElementById('album-data');
  const albumData = albumDataEl ? JSON.parse(albumDataEl.textContent) : {};

  let currentAlbum = null;
  let currentIndex = 0;
  let singleImageMode = false;

  function ensureThumbLightbox() {
    let thumbLb = document.getElementById('thumb-lightbox-fallback');
    if (thumbLb) return thumbLb;

    thumbLb = document.createElement('div');
    thumbLb.id = 'thumb-lightbox-fallback';
    thumbLb.className = 'thumb-lb';
    thumbLb.innerHTML = `
      <button class="thumb-lb__close" type="button" aria-label="Fermer">Fermer</button>
      <img src="" alt="" />
    `;
    document.body.appendChild(thumbLb);

    const closeBtn = thumbLb.querySelector('.thumb-lb__close');
    const img = thumbLb.querySelector('img');

    function closeThumbLb() {
      thumbLb.classList.remove('is-open');
      img.src = '';
      img.alt = '';
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeThumbLb);
    thumbLb.addEventListener('click', (e) => {
      if (e.target === thumbLb) closeThumbLb();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && thumbLb.classList.contains('is-open')) {
        closeThumbLb();
      }
    });

    return thumbLb;
  }

  function openThumbFallback(src, alt) {
    const thumbLb = ensureThumbLightbox();
    const img = thumbLb.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    thumbLb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function thumbUrl(id, size) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=${size || 'w1600'}`;
  }

  function openLightbox(albumKey, index) {
    if (!lightbox || !lbImg || !lbClose || !lbPrev || !lbNext || !albumData[albumKey]) return;
    singleImageMode = false;
    currentAlbum = albumKey;
    currentIndex = index;
    lbPrev.hidden = false;
    lbNext.hidden = false;
    renderLightbox();
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function openSingleLightbox(src, alt, label) {
    if (!lightbox || !lbImg || !lbClose || !lbPrev || !lbNext) {
      openThumbFallback(src, alt);
      return;
    }

    singleImageMode = true;
    currentAlbum = null;
    lbImg.src = src;
    lbImg.alt = alt || '';
    if (lbCounter) lbCounter.textContent = '';
    if (lbAlbumName) lbAlbumName.textContent = label || '';
    lbPrev.hidden = true;
    lbNext.hidden = true;
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function renderLightbox() {
    const album = albumData[currentAlbum];
    if (!album) return;
    const total = album.ids.length;
    lbImg.src = thumbUrl(album.ids[currentIndex]);
    lbImg.alt = `${album.label} — ${currentIndex + 1}`;
    if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${total}`;
    if (lbAlbumName) lbAlbumName.textContent = album.label;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lbImg) {
      lbImg.src = '';
      lbImg.alt = '';
    }
    if (lbCounter) lbCounter.textContent = '';
    if (lbAlbumName) lbAlbumName.textContent = '';
    if (lbPrev) lbPrev.hidden = false;
    if (lbNext) lbNext.hidden = false;
    currentAlbum = null;
    singleImageMode = false;
  }

  function showPrev() {
    if (singleImageMode || !currentAlbum || !albumData[currentAlbum]) return;
    const total = albumData[currentAlbum].ids.length;
    currentIndex = (currentIndex - 1 + total) % total;
    renderLightbox();
  }

  function showNext() {
    if (singleImageMode || !currentAlbum || !albumData[currentAlbum]) return;
    const total = albumData[currentAlbum].ids.length;
    currentIndex = (currentIndex + 1) % total;
    renderLightbox();
  }

  document.querySelectorAll('.photo-card[data-album]').forEach((card) => {
    card.addEventListener('click', () => {
      openLightbox(card.dataset.album, parseInt(card.dataset.index, 10));
    });
  });

  document.querySelectorAll('.annexe-btn[data-album]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(btn.dataset.album, 0);
    });
  });

  document.querySelectorAll('.section__photo-thumb').forEach((thumb) => {
    const openThumb = () => {
      const src = thumb.dataset.lightboxSrc || thumb.currentSrc || thumb.src;
      const alt = thumb.dataset.lightboxAlt || thumb.alt || '';
      const label = thumb.dataset.lightboxLabel || '';
      openSingleLightbox(src, alt, label);
    };

    thumb.addEventListener('click', openThumb);
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openThumb();
      }
    });
  });

  if (lbClose && lbPrev && lbNext && lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hasAttribute('hidden')) return;
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ── 6. YOUTUBE FAÇADE — chargement différé ─────────────── */
  document.querySelectorAll('.yt-facade').forEach((facade) => {
    const id = facade.dataset.id;
    const img = facade.querySelector('img');

    if (img) {
      const checker = new Image();
      checker.onload = function () {
        if (this.naturalWidth <= 120) {
          img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        }
      };
      checker.src = img.src;
    }

    facade.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = facade.dataset.title || 'Vidéo';
      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.remove('yt-facade');
    });
  });
  /* ── 7. DUO CAROUSEL — navigation entre 2 vidéos ─────────── */
  document.querySelectorAll('.video-card--duo').forEach((card) => {
    const dots = card.querySelectorAll('.duo-dot');

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetSlide = parseInt(dot.dataset.slide, 10);
        const slides = card.querySelectorAll('.duo-slide');

        slides.forEach((s, i) => {
          s.classList.toggle('duo-slide--active', i === targetSlide);
        });
        dots.forEach((d, i) => {
          d.classList.toggle('duo-dot--active', i === targetSlide);
        });
      });
    });
  });

})();
