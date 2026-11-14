(() => {
  'use strict';
  const config = window.NARENJ_CONFIG || {};

  const formatPhone = value => String(value || '').trim();
  document.querySelectorAll('[data-config-phone]').forEach(el => {
    const phone = formatPhone(config.phone);
    if (phone) {
      el.textContent = phone;
      if (el.tagName === 'A') el.href = 'tel:' + phone.replace(/[^+\d]/g, '');
    } else {
      el.textContent = 'شماره تماس پس از دریافت اطلاعات رستوران ثبت می‌شود';
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
    }
  });
  document.querySelectorAll('[data-config-email]').forEach(el => {
    const email = String(config.contactEmail || '').trim();
    if (email) {
      el.textContent = email;
      if (el.tagName === 'A') el.href = 'mailto:' + email;
    } else {
      el.textContent = 'نشانی ایمیل هنوز ثبت نشده است';
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
    }
  });
  document.querySelectorAll('[data-config-address]').forEach(el => {
    el.textContent = config.address || 'نشانی دقیق پس از دریافت اطلاعات رستوران ثبت می‌شود';
  });
  document.querySelectorAll('[data-config-hours]').forEach(el => {
    el.textContent = config.hours || 'ساعت پذیرایی پس از دریافت برنامه رسمی ثبت می‌شود';
  });
  document.querySelectorAll('[data-config-map-link]').forEach(el => {
    if (config.mapUrl) {
      el.href = config.mapUrl;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
  document.querySelectorAll('[data-map-pending]').forEach(el => { el.hidden = Boolean(config.mapUrl); });
  document.querySelectorAll('[data-config-whatsapp]').forEach(el => {
    const whatsapp = String(config.whatsapp || '').replace(/\D/g, '');
    if (whatsapp) {
      el.href = 'https://wa.me/' + whatsapp;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });
  document.querySelectorAll('[data-config-instagram]').forEach(el => {
    if (config.instagram) {
      el.href = config.instagram;
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  // Menu filtering and search
  const menuRoot = document.querySelector('[data-menu-browser]');
  if (menuRoot) {
    const search = document.querySelector('[data-menu-search]');
    const filters = [...document.querySelectorAll('[data-menu-filter]')];
    const items = [...menuRoot.querySelectorAll('[data-menu-item]')];
    const count = document.querySelector('[data-menu-count]');
    const empty = document.querySelector('[data-menu-empty]');
    let active = 'all';
    const normalize = value => String(value || '').toLocaleLowerCase('fa-IR')
      .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
      .replace(/[\s\u200c]+/g, '');
    const update = () => {
      const query = normalize(search?.value);
      let visible = 0;
      items.forEach(item => {
        const categoryMatch = active === 'all' || item.dataset.category === active;
        const textMatch = !query || normalize(item.textContent).includes(query);
        const show = categoryMatch && textMatch;
        item.hidden = !show;
        if (show) visible++;
      });
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.menuFilter === active)));
      if (count) count.textContent = new Intl.NumberFormat('fa-IR').format(visible) + ' پیشنهاد';
      if (empty) empty.hidden = visible > 0;
    };
    filters.forEach(button => button.addEventListener('click', () => {
      active = button.dataset.menuFilter || 'all';
      update();
    }));
    search?.addEventListener('input', update);
    update();
  }

  // Accessible dish detail dialog
  const dishDialog = document.getElementById('dish-dialog');
  if (dishDialog) {
    const title = dishDialog.querySelector('[data-dialog-title]');
    const description = dishDialog.querySelector('[data-dialog-description]');
    const close = dishDialog.querySelector('[data-dialog-close]');
    document.querySelectorAll('[data-menu-detail]').forEach(button => {
      button.addEventListener('click', () => {
        if (title) title.textContent = button.dataset.name || 'جزئیات غذا';
        if (description) description.textContent = button.dataset.description || '';
        if (typeof dishDialog.showModal === 'function') dishDialog.showModal();
      });
    });
    close?.addEventListener('click', () => dishDialog.close());
    dishDialog.addEventListener('click', event => {
      if (event.target === dishDialog) dishDialog.close();
    });
  }

  // Full-screen gallery lightbox
  const lightbox = document.getElementById('gallery-lightbox');
  if (lightbox) {
    const image = lightbox.querySelector('img');
    const caption = lightbox.querySelector('[data-lightbox-caption]');
    const close = lightbox.querySelector('[data-lightbox-close]');
    document.querySelectorAll('[data-gallery-image]').forEach(button => {
      button.addEventListener('click', () => {
        const source = button.dataset.full || button.querySelector('img')?.src;
        if (!source || !image) return;
        image.src = source;
        image.alt = button.dataset.alt || button.querySelector('img')?.alt || '';
        if (caption) caption.textContent = button.dataset.caption || image.alt;
        if (typeof lightbox.showModal === 'function') lightbox.showModal();
      });
    });
    close?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', () => {
      if (image) image.removeAttribute('src');
    });
  }

  // Contact form: prepare an email draft only when a real address is configured.
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = contactForm.querySelector('[data-form-status]');
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const email = String(config.contactEmail || '').trim();
      if (!email) {
        if (status) status.textContent = 'برای ارسال واقعی پیام، ایمیل رستوران را در فایل site-config.js ثبت کنید. در حال حاضر این فرم به مقصدی متصل نیست.';
        return;
      }
      const data = new FormData(contactForm);
      const subject = 'پیام از وب‌سایت نارنج: ' + (data.get('topic') || 'ارتباط با رستوران');
      const body = [
        'نام: ' + (data.get('name') || ''),
        'شماره تماس: ' + (data.get('phone') || ''),
        'موضوع: ' + (data.get('topic') || ''),
        '',
        'پیام:',
        data.get('message') || ''
      ].join('\n');
      if (status) status.textContent = 'پیش‌نویس پیام در برنامه ایمیل شما آماده می‌شود؛ برای ارسال نهایی آن را بررسی کنید.';
      window.location.href = 'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  // Replace failed remote photos with local assets without blocking the page.
  document.querySelectorAll('img[src^="https://images."]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackUsed) return;
      img.dataset.fallbackUsed = 'true';
      const isFood = img.closest('.menu-item') || /غذا|کباب|فسنجان|برنج|پیش.?غذا|نوشیدنی/i.test(img.alt);
      img.src = isFood ? 'assets/narenj-hero.webp' : 'assets/narenj-dining-room.webp';
    });
  });
})();
