(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setDisplay(element, visible) {
    element.style.display = visible ? "" : "none";
  }

  function filterCards(input, cards, emptyNode) {
    var keyword = normalizeText(input ? input.value : "");
    var visibleCount = 0;
    cards.forEach(function (card) {
      var text = normalizeText(card.dataset.title + " " + card.dataset.meta);
      var visible = !keyword || text.indexOf(keyword) !== -1;
      setDisplay(card, visible);
      if (visible) {
        visibleCount += 1;
      }
    });
    if (emptyNode) {
      emptyNode.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  function sortCards(select, list) {
    if (!select || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var mode = select.value;
    cards.sort(function (a, b) {
      if (mode === "rating") {
        return Number(b.dataset.rating) - Number(a.dataset.rating);
      }
      if (mode === "views") {
        return Number(b.dataset.views) - Number(a.dataset.views);
      }
      if (mode === "year") {
        return Number(b.dataset.year) - Number(a.dataset.year);
      }
      return 0;
    });
    cards.forEach(function (card) {
      list.appendChild(card);
    });
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length) {
      var active = 0;
      var showSlide = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
        });
      });
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
      showSlide(0);
    }

    var filterInput = document.querySelector("[data-movie-filter]");
    var list = document.querySelector("[data-search-list]");
    var emptyNode = document.querySelector("[data-empty]");
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (filterInput && query) {
      filterInput.value = query;
    }
    if (filterInput && cards.length) {
      filterCards(filterInput, cards, emptyNode);
      filterInput.addEventListener("input", function () {
        filterCards(filterInput, cards, emptyNode);
      });
    }

    var sortSelect = document.querySelector("[data-sort-select]");
    if (sortSelect && list) {
      sortSelect.addEventListener("change", function () {
        sortCards(sortSelect, list);
      });
    }
  });

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !source) {
      return;
    }
    var hls = null;
    var attached = false;
    var attach = function () {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal || !hls) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = source;
      }
      attached = true;
    };
    var start = function () {
      attach();
      if (overlay) {
        overlay.hidden = true;
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    };
    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!attached) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
  };
})();
