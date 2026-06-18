(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(nextIndex);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  var searchInput = document.querySelector('[data-local-search]');
  var cardList = document.querySelector('[data-card-list]');

  if (searchInput && cardList) {
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
    var noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = '没有找到匹配的影片。';

    function applyFilter() {
      var keyword = searchInput.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var visible = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (!visibleCount && !noResults.parentNode) {
        cardList.appendChild(noResults);
      }

      if (visibleCount && noResults.parentNode) {
        noResults.parentNode.removeChild(noResults);
      }
    }

    searchInput.addEventListener('input', applyFilter);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
      applyFilter();
    }
  }

  var video = document.querySelector('[data-video-src]');
  var playButton = document.querySelector('[data-play-button]');
  var status = document.querySelector('[data-player-status]');

  if (video && playButton) {
    var videoUrl = video.getAttribute('data-video-src');
    var hlsInstance = null;
    var hasStarted = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startNativePlayback() {
      video.src = videoUrl;
      return video.play();
    }

    function startHlsPlayback() {
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放遇到浏览器兼容问题，请刷新后重试或更换浏览器。');
            }
          });
        }
        return video.play();
      }
      return startNativePlayback();
    }

    function startPlayback() {
      if (!videoUrl) {
        setStatus('播放源地址缺失。');
        return;
      }

      playButton.classList.add('is-hidden');
      hasStarted = true;
      setStatus('正在加载播放源...');

      var canUseNativeHls = video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
      var playPromise = canUseNativeHls ? startNativePlayback() : startHlsPlayback();

      Promise.resolve(playPromise)
        .then(function () {
          setStatus('正在播放。');
        })
        .catch(function () {
          setStatus('播放源已绑定，浏览器需要用户再次点击播放器开始播放。');
          playButton.classList.remove('is-hidden');
        });
    }

    playButton.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (!hasStarted) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (hasStarted && video.currentTime < 1) {
        playButton.classList.remove('is-hidden');
      }
    });
  }
})();
