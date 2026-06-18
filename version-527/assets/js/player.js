(function () {
  function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const starter = shell.querySelector('[data-start-player]');
    const streamUrl = shell.getAttribute('data-stream');
    let loaded = false;
    let hls = null;

    function loadStream() {
      if (loaded || !video || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      loaded = true;
    }

    function startPlayback() {
      loadStream();
      shell.classList.add('is-started');
      video.controls = true;
      const playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {});
      }
    }

    if (starter) {
      starter.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell[data-stream]').forEach(setupPlayer);
})();
