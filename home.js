(() => {
  'use strict';

  const header = document.getElementById('site-header');
  const progress = document.querySelector('.reading-progress');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(new Date().getFullYear());

  let scrollPending = false;
  function updateOnScroll() {
    const y = Math.max(window.scrollY, 0);
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (header) header.classList.toggle('is-scrolled', y > 35);
    if (progress) progress.style.width = (Math.min(y / maxScroll, 1) * 100).toFixed(2) + '%';

    if (!reducedMotion.matches && window.innerWidth > 900) {
      const viewport = window.innerHeight;
      for (const frame of parallaxItems) {
        const rect = frame.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) continue;
        const distance = viewport / 2 - (rect.top + rect.height / 2);
        const shift = Math.max(-32, Math.min(32, distance * 0.045));
        frame.style.setProperty('--parallax-y', shift.toFixed(1) + 'px');
      }
    } else {
      for (const frame of parallaxItems) frame.style.setProperty('--parallax-y', '0px');
    }
    scrollPending = false;
  }
  function requestScrollUpdate() {
    if (scrollPending) return;
    scrollPending = true;
    window.requestAnimationFrame(updateOnScroll);
  }
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });
  window.addEventListener('pageshow', requestScrollUpdate);
  requestScrollUpdate();

  function closeMenu(restoreFocus = false) {
    if (!nav || !toggle) return;
    const wasOpen = nav.classList.contains('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'باز کردن منو');
    document.body.classList.remove('nav-open');
    if (restoreFocus && wasOpen) toggle.focus();
  }
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
      document.body.classList.toggle('nav-open', isOpen);
      if (isOpen) nav.querySelector('a')?.focus();
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(true);
      if (event.key !== 'Tab' || !nav.classList.contains('is-open')) return;
      const focusable = [...nav.querySelectorAll('a')];
      focusable.push(toggle);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  }

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reveals.length && !reducedMotion.matches && 'IntersectionObserver' in window) {
    reveals.forEach((element, index) => {
      element.style.setProperty('--reveal-delay', (index % 3) * 75 + 'ms');
    });
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        current.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: 0.06 });
    reveals.forEach(element => observer.observe(element));
    document.documentElement.classList.add('has-motion');
  }

  // External editorial photography is optional. Keep a local image visible if a host fails.
  document.querySelectorAll('img[src^="https://images."]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackUsed) return;
      img.dataset.fallbackUsed = 'true';
      const isFood = img.closest('.philosophy-small, .moment-b, .moment-a');
      img.src = isFood ? 'assets/narenj-hero.webp' : 'assets/narenj-dining-room.webp';
    });
  });
})();
