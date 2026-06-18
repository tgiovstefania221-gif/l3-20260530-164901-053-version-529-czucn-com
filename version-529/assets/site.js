const ready = (callback) => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

ready(() => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-nav-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", () => {
      panel.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let current = 0;
  const showSlide = (index) => {
    if (!slides.length) return;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  };
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });
  if (slides.length > 1) {
    window.setInterval(() => showSlide(current + 1), 5200);
  }

  const filterInputs = Array.from(document.querySelectorAll("[data-card-filter]"));
  const sortSelects = Array.from(document.querySelectorAll("[data-card-sort]"));
  const lists = Array.from(document.querySelectorAll("[data-card-list]"));
  const applyTools = () => {
    lists.forEach((list) => {
      const filter = filterInputs.find((item) => item.dataset.target === list.id);
      const sorter = sortSelects.find((item) => item.dataset.target === list.id);
      const keyword = filter ? filter.value.trim().toLowerCase() : "";
      const cards = Array.from(list.querySelectorAll(".movie-card"));
      cards.forEach((card) => {
        const title = (card.dataset.title || "").toLowerCase();
        const category = (card.dataset.category || "").toLowerCase();
        const visible = !keyword || title.includes(keyword) || category.includes(keyword);
        card.style.display = visible ? "" : "none";
      });
      if (sorter) {
        const mode = sorter.value;
        const sorted = cards.slice().sort((a, b) => {
          if (mode === "views") return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
          if (mode === "year") return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
        });
        sorted.forEach((card) => list.appendChild(card));
      }
    });
  };
  filterInputs.forEach((input) => input.addEventListener("input", applyTools));
  sortSelects.forEach((select) => select.addEventListener("change", applyTools));
});
