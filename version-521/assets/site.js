(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-mobile-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-thumb]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initCardFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var keywordInput = scope.querySelector('[data-card-filter]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var sortSelect = scope.querySelector('[data-sort-cards]');
      var list = scope.parentElement.querySelector('[data-card-list]');
      var empty = scope.parentElement.querySelector('[data-empty-state]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      cards.forEach(function (card, i) {
        card.dataset.defaultIndex = String(i);
      });

      function matches(card) {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = yearSelect ? yearSelect.value : '';
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' '));
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        var yearOk = !year || card.dataset.year === year;
        return keywordOk && yearOk;
      }

      function sortCards() {
        var mode = sortSelect ? sortSelect.value : 'default';
        var sorted = cards.slice();
        if (mode === 'year-desc') {
          sorted.sort(function (a, b) {
            return normalize(b.dataset.year).localeCompare(normalize(a.dataset.year), 'zh-Hans-CN');
          });
        } else if (mode === 'title-asc') {
          sorted.sort(function (a, b) {
            return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN');
          });
        } else {
          sorted.sort(function (a, b) {
            return Number(a.dataset.defaultIndex) - Number(b.dataset.defaultIndex);
          });
        }
        sorted.forEach(function (card) {
          list.appendChild(card);
        });
      }

      function apply() {
        sortCards();
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible > 0;
        }
      }

      [keywordInput, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');
    var fallback = document.querySelector('[data-search-fallback]');
    if (!form || !input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function cardTemplate(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="movie-link" href="' + movie.url + '">',
        '    <div class="poster-wrap">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">',
        '      <span class="poster-badge">' + escapeHtml(movie.category) + '</span>',
        '      <span class="poster-play">▶</span>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <div class="movie-card-topline"><span>' + escapeHtml(movie.year) + '年</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="tag-line">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function doSearch(query) {
      var q = normalize(query);
      input.value = query || '';
      results.innerHTML = '';
      if (!q) {
        if (count) {
          count.textContent = '请输入关键词开始搜索。';
        }
        if (fallback) {
          fallback.hidden = false;
        }
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.tags.join(' ')
        ].join(' ')).indexOf(q) !== -1;
      });
      if (count) {
        count.textContent = '找到 ' + matched.length + ' 个结果';
      }
      if (fallback) {
        fallback.hidden = matched.length > 0;
      }
      results.innerHTML = matched.slice(0, 300).map(cardTemplate).join('');
      if (matched.length > 300 && count) {
        count.textContent += '，已显示前 300 个匹配项';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
      doSearch(query);
    });

    var params = new URLSearchParams(window.location.search);
    doSearch(params.get('q') || '');
  }

  function initPlayers() {
    document.querySelectorAll('video[data-hls-src]').forEach(function (video) {
      var source = video.getAttribute('data-hls-src');
      if (!source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.addEventListener('emptied', function () {
          hls.destroy();
        }, { once: true });
      } else {
        video.src = source;
      }
    });

    document.querySelectorAll('[data-player-start]').forEach(function (button) {
      var shell = button.closest('.player-shell');
      var video = shell ? shell.querySelector('video') : null;
      if (!video) {
        return;
      }
      var hide = function () {
        button.classList.add('is-hidden');
      };
      button.addEventListener('click', function () {
        hide();
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });
      video.addEventListener('play', hide);
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
