(() => {
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeaderAppearance = () => {
      const progress = Math.min(Math.max(window.scrollY / 140, 0), 1);
      const innerPage = document.body.classList.contains('inner-page');
      const headerStart = innerPage ? 0.82 : 0.34;
      const navStart = innerPage ? 0.90 : 0.72;
      header.style.setProperty('--header-opacity', (headerStart + progress * (1 - headerStart)).toFixed(3));
      header.style.setProperty('--nav-opacity', (navStart + progress * (0.99 - navStart)).toFixed(3));
      header.classList.toggle('is-scrolled', progress >= 0.08);
    };

    updateHeaderAppearance();
    window.addEventListener('scroll', updateHeaderAppearance, { passive: true });
    window.addEventListener('pageshow', updateHeaderAppearance);
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealGroups = [
      { selector: '.inner-hero-copy, .contact-page-heading', effect: 'from-right' },
      { selector: '.page-breadcrumb, .story-step, .space-principle, .related-page-card', effect: 'rise', stagger: 55 },
      { selector: '.space-table-feature', effect: 'from-left' },
      { selector: '.inner-hero-media', effect: 'from-left' },
      { selector: '.menu-category, .story-value, .space-gallery figure, .contact-page-cards .contact-item', effect: 'rise', stagger: 65 },

      { selector: '.hero-content > .eyebrow, .hero-content > h1, .hero-content > .hero-lead, .hero-content > .hero-actions, .hero-content > .hero-caption', effect: 'rise', stagger: 55 },
      { selector: '.highlight', effect: 'rise', stagger: 65 },
      { selector: '.story-copy', effect: 'from-right' },
      { selector: '.story-art', effect: 'from-left' },
      { selector: '.section-heading', effect: 'rise' },
      { selector: '.menu-card', effect: 'rise', stagger: 70 },
      { selector: '.menu-note, .menu-more', effect: 'rise', stagger: 55 },
      { selector: '.atmosphere-copy', effect: 'from-right' },
      { selector: '.atmosphere-visual', effect: 'from-left' },
      { selector: '.contact-intro', effect: 'from-right' },
      { selector: '.contact-item', effect: 'rise', stagger: 60 },
      { selector: '.footer-brand-block, .footer-column, .footer-cta', effect: 'rise', stagger: 55 }
    ];
    const revealItems = [];

    revealGroups.forEach(({ selector, effect, stagger = 0 }) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        if (element.dataset.reveal) return;
        element.dataset.reveal = effect;
        element.style.setProperty('--reveal-delay', `${index * stagger}ms`);
        revealItems.push(element);
      });
    });

    if (revealItems.length) {
      document.documentElement.classList.add('has-reveal-motion');
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

      revealItems.forEach((element) => revealObserver.observe(element));
    }
  }

  const menuBrowser = document.querySelector('[data-menu-browser]');
  if (menuBrowser) {
    const searchInput = menuBrowser.querySelector('#menu-search');
    const filters = [...menuBrowser.querySelectorAll('[data-menu-filter]')];
    const categories = [...menuBrowser.querySelectorAll('[data-menu-category]')];
    const resultCount = menuBrowser.querySelector('[data-menu-results]');
    const emptyState = menuBrowser.querySelector('[data-menu-empty]');
    let activeCategory = 'all';
    const normalize = (value) => value.toLocaleLowerCase('fa-IR')
      .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/[\\s\\u200c]+/g, '');
    const updateMenu = () => {
      const query = normalize(searchInput?.value || '');
      let visibleCount = 0;
      categories.forEach((category) => {
        const categoryMatches = activeCategory === 'all' || category.dataset.menuCategory === activeCategory;
        let categoryCount = 0;
        category.querySelectorAll('[data-menu-item]').forEach((item) => {
          const matchesQuery = !query || normalize(item.textContent).includes(query);
          item.hidden = !(categoryMatches && matchesQuery);
          if (!item.hidden) {
            visibleCount += 1;
            categoryCount += 1;
          }
        });
        category.hidden = categoryCount === 0;
      });
      filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter.dataset.menuFilter === activeCategory)));
      if (resultCount) resultCount.textContent = `${new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(visibleCount)} گزینه در فهرست`;
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    };
    filters.forEach((filter) => filter.addEventListener('click', () => {
      activeCategory = filter.dataset.menuFilter || 'all';
      updateMenu();
    }));
    searchInput?.addEventListener('input', updateMenu);
    updateMenu();
  }


  // Cinematic, scroll-linked image depth for the story page only.
  const storyParallax = [...document.querySelectorAll('.story-page [data-parallax] img')];
  if (storyParallax.length && !prefersReducedMotion) {
    let ticking = false;
    const updateStoryParallax = () => {
      const viewport = window.innerHeight || 1;
      storyParallax.forEach((img) => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;
        const progress = (viewport - rect.top) / (viewport + rect.height);
        const offset = (progress - 0.5) * 34;
        img.style.transform = `scale(1.12) translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    const requestStoryParallax = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateStoryParallax);
    };
    window.addEventListener('scroll', requestStoryParallax, { passive: true });
    window.addEventListener('resize', requestStoryParallax, { passive: true });
    requestStoryParallax();
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
