(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");

  if (menuButton && menu) {
    menuButton.addEventListener("click", function () {
      const opened = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    if (slides.length > 1) {
      start();
    }
  });

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    const input = scope.querySelector("[data-filter-search]");
    const year = scope.querySelector("[data-filter-year]");
    const region = scope.querySelector("[data-filter-region]");
    const type = scope.querySelector("[data-filter-type]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));
    const count = scope.querySelector("[data-result-count]");
    const empty = scope.querySelector("[data-empty-state]");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      const query = normalize(input ? input.value : "");
      const selectedYear = normalize(year ? year.value : "");
      const selectedRegion = normalize(region ? region.value : "");
      const selectedType = normalize(type ? type.value : "");
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        const matchesQuery = !query || haystack.includes(query);
        const matchesYear = !selectedYear || normalize(card.dataset.year) === selectedYear;
        const matchesRegion = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
        const matchesType = !selectedType || normalize(card.dataset.type) === selectedType;
        const isVisible = matchesQuery && matchesYear && matchesRegion && matchesType;

        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
})();
