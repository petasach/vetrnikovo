document.addEventListener('DOMContentLoaded', function () {
    // Hamburger menu navigation
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const slideMenu = document.getElementById('slide-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    function openMenu() {
        if (!slideMenu) return;
        slideMenu.classList.add('is-open');
        menuOverlay.classList.add('is-visible');
        if (hamburgerBtn) {
            hamburgerBtn.classList.add('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!slideMenu) return;
        slideMenu.classList.remove('is-open');
        menuOverlay.classList.remove('is-visible');
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('is-active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMenu);
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });

    document.querySelectorAll('.slide-menu__link').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // Lightbox Modal
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const lightboxThumbs = document.getElementById('lightbox-thumbs');

        let currentPhotos = [];
        let currentIndex = 0;

        function applyAspectRatio(thumb, img) {
            if (!img) return;
            if (img.naturalWidth && img.naturalHeight) {
                thumb.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            } else {
                img.addEventListener('load', function () {
                    thumb.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                }, { once: true });
            }
        }

        function setActiveItem(index) {
            if (!currentPhotos.length) return;
            currentIndex = (index + currentPhotos.length) % currentPhotos.length;

            const photo = currentPhotos[currentIndex];
            if (lightboxImg && photo) {
                lightboxImg.src = photo.src;
                lightboxImg.alt = photo.alt || '';
            }

            if (lightboxThumbs) {
                const thumbButtons = lightboxThumbs.querySelectorAll('.lightbox__thumb');
                thumbButtons.forEach(function (thumb, i) {
                    const isActive = (i === currentIndex);
                    thumb.classList.toggle('is-active', isActive);
                    if (isActive) {
                        thumb.setAttribute('aria-current', 'true');
                        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    } else {
                        thumb.removeAttribute('aria-current');
                    }
                });
            }
        }

        function openGallery(photos, startIndex) {
            if (!photos || !photos.length) return;
            currentPhotos = photos;

            if (lightboxThumbs) {
                lightboxThumbs.innerHTML = '';
                currentPhotos.forEach(function (photo, i) {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'lightbox__thumb';
                    btn.setAttribute('aria-label', photo.alt ? `Fotka ${i + 1}: ${photo.alt}` : `Fotka ${i + 1}`);

                    const thumbImg = document.createElement('img');
                    thumbImg.src = photo.src;
                    thumbImg.alt = photo.alt || '';
                    thumbImg.loading = 'lazy';

                    btn.appendChild(thumbImg);
                    applyAspectRatio(btn, thumbImg);

                    btn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        setActiveItem(i);
                    });

                    lightboxThumbs.appendChild(btn);
                });
            }

            setActiveItem(startIndex || 0);
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        function showPrev() {
            setActiveItem(currentIndex - 1);
        }

        function showNext() {
            setActiveItem(currentIndex + 1);
        }

        // Prevent background & modal scrolling on touch devices (allow only thumbnail strip scroll)
        lightbox.addEventListener('touchmove', function (e) {
            if (!e.target.closest('.lightbox__thumbs')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent double-tap zoom on mobile while keeping rapid taps responsive
        let lastTapTime = 0;
        lightbox.addEventListener('touchend', function (e) {
            const now = Date.now();
            const timeSinceLastTap = now - lastTapTime;

            if (timeSinceLastTap < 320 && timeSinceLastTap > 0) {
                // Prevent native double-tap zoom gesture
                e.preventDefault();

                // On fast double-taps on navigation, execute action immediately without zoom
                const arrowPrev = e.target.closest('.lightbox__arrow--prev');
                const arrowNext = e.target.closest('.lightbox__arrow--next');
                const closeBtn = e.target.closest('.lightbox__close');
                const thumbBtn = e.target.closest('.lightbox__thumb');

                if (arrowPrev) {
                    showPrev();
                } else if (arrowNext) {
                    showNext();
                } else if (closeBtn) {
                    closeLightbox();
                } else if (thumbBtn && lightboxThumbs) {
                    const allThumbs = Array.from(lightboxThumbs.querySelectorAll('.lightbox__thumb'));
                    const idx = allThumbs.indexOf(thumbBtn);
                    if (idx !== -1) setActiveItem(idx);
                }
            }
            lastTapTime = now;
        }, { passive: false });

        lightbox.addEventListener('dblclick', function (e) {
            e.preventDefault();
        });

        // Touch swipe support (left/right swipe on screen to switch photos)
        let touchStartX = 0;
        let touchStartY = 0;

        lightbox.addEventListener('touchstart', function (e) {
            if (e.target.closest('.lightbox__thumbs')) return;
            if (e.touches && e.touches.length > 0) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        lightbox.addEventListener('touchend', function (e) {
            if (e.target.closest('.lightbox__thumbs')) return;
            if (e.changedTouches && e.changedTouches.length > 0) {
                const diffX = e.changedTouches[0].clientX - touchStartX;
                const diffY = e.changedTouches[0].clientY - touchStartY;
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                    if (diffX < 0) {
                        showNext();
                    } else {
                        showPrev();
                    }
                }
            }
        }, { passive: true });

        // ── Gallery album cards (instant native DOM, no fetch required) ──
        const albumCards = document.querySelectorAll('.gallery-album');
        albumCards.forEach(function (card) {
            const items = Array.from(card.querySelectorAll('.gallery-album__items img'));
            const photos = items.map(function (img) {
                return {
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt') || ''
                };
            });

            function openThisAlbum() {
                openGallery(photos, 0);
            }

            card.addEventListener('click', openThisAlbum);
            card.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openThisAlbum();
                }
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
        if (lightboxNext) lightboxNext.addEventListener('click', showNext);

        lightbox.addEventListener('click', function (e) {
            if (!e.target.closest('.lightbox__img') &&
                !e.target.closest('.lightbox__thumbs') &&
                !e.target.closest('.lightbox__arrow')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }
});
