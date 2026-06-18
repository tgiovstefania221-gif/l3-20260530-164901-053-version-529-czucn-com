(function () {
  window.initMoviePlayer = function (options) {
    const video = document.getElementById(options.videoId);
    const button = document.getElementById(options.buttonId);
    const source = options.source;
    let prepared = false;
    let hls = null;

    function prepare() {
      if (prepared || !video || !source) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      prepare();
      if (button) {
        button.classList.add("hidden");
      }
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (button) {
            button.classList.remove("hidden");
          }
        });
      }
    }

    if (button && video) {
      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("hidden");
      });
      video.addEventListener("ended", function () {
        button.classList.remove("hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    }
  };
})();
