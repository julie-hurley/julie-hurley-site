const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xkjopgvl';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.add('js');

/* ---------- Sticky nav: shadow on scroll + mobile menu ---------- */
function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav__toggle');
  const links = document.getElementById('nav-links');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!toggle || !links) return;

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('is-open', open);
  });

  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  window.matchMedia('(min-width: 761px)').addEventListener('change', close);
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  items.forEach((el) => io.observe(el));
}

/* ---------- Count-up numbers ----------
   <span data-count="443509" data-prefix="" data-suffix="K+" data-decimals="1"> */
function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length || reduceMotion || !('IntersectionObserver' in window)) return;

  const format = (value, el) => {
    const decimals = Number(el.dataset.decimals || 0);
    const text = value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${el.dataset.prefix || ''}${text}${el.dataset.suffix || ''}`;
  };

  const run = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased, el);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = format(target, el);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  nums.forEach((el) => io.observe(el));
}

/* ---------- Infinite industries ticker ---------- */
function initTicker() {
  document.querySelectorAll('.ticker__track').forEach((track) => {
    const list = track.querySelector('.ticker__list');
    if (!list) return;
    const clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

/* ---------- Testimonial carousel ---------- */
function initCarousel() {
  const root = document.querySelector('.carousel');
  if (!root) return;

  const slides = [...root.querySelectorAll('.carousel__slide')];
  const dotsWrap = root.querySelector('.carousel__dots');
  const prev = root.querySelector('[data-carousel="prev"]');
  const next = root.querySelector('[data-carousel="next"]');
  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Show recommendation ${i + 1} of ${slides.length}`);
    dot.addEventListener('click', () => {
      go(i);
      restart();
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      const active = n === index;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === index)));
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    if (!reduceMotion) timer = setInterval(() => go(index + 1), 8000);
  }

  prev.addEventListener('click', () => {
    go(index - 1);
    restart();
  });
  next.addEventListener('click', () => {
    go(index + 1);
    restart();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', restart);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', restart);

  // Basic swipe support on touch devices
  let startX = null;
  root.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
  root.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      go(index + (dx < 0 ? 1 : -1));
      restart();
    }
    startX = null;
  });

  go(0);
  restart();
}

/* ---------- Work page: case study filter ---------- */
function initCaseFilter() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  const buttons = [...bar.querySelectorAll('.filter-btn')];
  const tiles = [...document.querySelectorAll('.case-tile')];
  const status = document.getElementById('filter-status');

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    const filter = btn.dataset.filter;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));

    let shown = 0;
    tiles.forEach((tile) => {
      const match = filter === 'all' || tile.dataset.tags.split(' ').includes(filter);
      tile.hidden = !match;
      if (match) shown += 1;
    });
    if (status) status.textContent = `Showing ${shown} of ${tiles.length} case studies`;
  });
}

/* ---------- Screenshot lightbox ---------- */
function initLightbox() {
  const triggers = document.querySelectorAll('.proof__btn');
  if (!triggers.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.innerHTML =
    '<button type="button" class="lightbox__close" aria-label="Close image">&times;</button><img alt="" />';
  document.body.appendChild(dialog);
  const img = dialog.querySelector('img');

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const source = btn.querySelector('img');
      img.src = source.currentSrc || source.src;
      img.alt = source.alt;
      dialog.showModal();
    });
  });

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}

/* ---------- Approach page: process stepper ---------- */
function initProcess() {
  const root = document.querySelector('.process');
  if (!root) return;

  const tabs = [...root.querySelectorAll('.process__tab')];
  const panels = [...root.querySelectorAll('.process__panel')];
  const progress = root.querySelector('.process__progress');
  const prev = root.querySelector('[data-step="prev"]');
  const next = root.querySelector('[data-step="next"]');
  let current = 0;

  function select(i, focus = false) {
    current = Math.max(0, Math.min(i, tabs.length - 1));
    tabs.forEach((tab, n) => {
      const active = n === current;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-done', n < current);
    });
    panels.forEach((panel, n) => {
      const active = n === current;
      panel.hidden = !active;
      if (active) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth;
        panel.classList.add('is-entering');
      }
    });
    if (progress) {
      progress.style.width = `calc((100% - (100% / 6)) * ${current / (tabs.length - 1)})`;
    }
    prev.disabled = current === 0;
    next.disabled = current === tabs.length - 1;
    if (focus) tabs[current].focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        select(current + 1, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        select(current - 1, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        select(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        select(tabs.length - 1, true);
      }
    });
  });

  prev.addEventListener('click', () => select(current - 1));
  next.addEventListener('click', () => select(current + 1));

  select(0);
}

/* ---------- Contact form (Formspree) ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit.textContent;

  const show = (message, type) => {
    status.textContent = message;
    status.className = `form-status form-status--${type}`;
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.hidden = true;

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      form.reset();
      show('Thanks for reaching out. I’ll review your message and get back to you soon.', 'success');
    } catch (err) {
      console.error(err);
      show(
        'Sorry, something went wrong sending your message. Please email me directly at julieroo182@gmail.com.',
        'error'
      );
    } finally {
      submit.disabled = false;
      submit.textContent = submitLabel;
    }
  });
}

/* ---------- Footer year ---------- */
function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

initNav();
initTicker();
initReveal();
initCounters();
initCarousel();
initCaseFilter();
initLightbox();
initProcess();
initContactForm();
initYear();
