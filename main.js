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

    // Lightbox (O nás gallery)
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        const lightboxPrev = document.getElementById('lightbox-prev');
        const lightboxNext = document.getElementById('lightbox-next');
        const galleryItems = document.querySelectorAll('.about-gallery__item img');
        let currentIndex = 0;

        function openLightbox(index) {
            currentIndex = index;
            lightboxImg.src = galleryItems[currentIndex].src;
            lightboxImg.alt = galleryItems[currentIndex].alt;
            lightbox.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('is-open');
            document.body.style.overflow = '';
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
            lightboxImg.src = galleryItems[currentIndex].src;
            lightboxImg.alt = galleryItems[currentIndex].alt;
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % galleryItems.length;
            lightboxImg.src = galleryItems[currentIndex].src;
            lightboxImg.alt = galleryItems[currentIndex].alt;
        }

        galleryItems.forEach(function (img, i) {
            img.addEventListener('click', function () {
                openLightbox(i);
            });
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
        if (lightboxNext) lightboxNext.addEventListener('click', showNext);

        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }
});
