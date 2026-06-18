(function () {
  const header = document.querySelector('[data-header]');
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function refreshHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', refreshHeader, { passive: true });
  refreshHeader();

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-index]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function setHero(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function restartHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setHero(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-index')) || 0);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(active - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(active + 1);
        restartHero();
      });
    }

    if (slides.length > 1) {
      restartHero();
    }
  }

  document.querySelectorAll('[data-rail-prev], [data-rail-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      const id = button.getAttribute('data-rail-prev') || button.getAttribute('data-rail-next');
      const rail = document.getElementById(id);
      if (!rail) {
        return;
      }
      const direction = button.hasAttribute('data-rail-prev') ? -1 : 1;
      rail.scrollBy({
        left: direction * 320,
        behavior: 'smooth'
      });
    });
  });

  document.querySelectorAll('[data-filter-page]').forEach(function (panel) {
    const scope = panel.closest('section') || document;
    const input = panel.querySelector('[data-filter-input]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(scope.querySelectorAll('.filter-card'));
    const empty = scope.querySelector('[data-empty-state]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function cardText(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
    }

    function filterCards() {
      const q = input ? input.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const r = region ? region.value : '';
      const t = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const matchQuery = !q || cardText(card).indexOf(q) !== -1;
        const matchYear = !y || card.getAttribute('data-year') === y;
        const matchRegion = !r || card.getAttribute('data-region') === r;
        const matchType = !t || card.getAttribute('data-type') === t;
        const matched = matchQuery && matchYear && matchRegion && matchType;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  });

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = form.getAttribute('action') || './search.html';
    });
  });
})();
