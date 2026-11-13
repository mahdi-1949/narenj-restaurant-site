(() => {
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeaderAppearance = () => {
      const progress = Math.min(Math.max(window.scrollY / 140, 0), 1);
      header.style.setProperty('--header-opacity', (0.34 + progress * 0.66).toFixed(3));
      header.style.setProperty('--nav-opacity', (0.72 + progress * 0.27).toFixed(3));
      header.classList.toggle('is-scrolled', progress >= 0.08);
    };

    updateHeaderAppearance();
    window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
    window.addEventListener('pageshow', updateHeaderAppearance);
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(new Date().getFullYear());

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'باز کردن فهرست');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'باز کردن فهرست' : 'بستن فهرست');
    nav.classList.toggle('is-open', !isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });
})();
