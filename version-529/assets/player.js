import { H as Hls } from "./hls-vendor-dru42stk.js";

const ready = (callback) => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
};

ready(() => {
  const video = document.querySelector("[data-player]");
  const panel = document.querySelector("[data-player-cover]");
  const button = document.querySelector("[data-play-button]");
  const configNode = document.getElementById("player-config");
  if (!video || !configNode) return;

  let config = {};
  try {
    config = JSON.parse(configNode.textContent.trim());
  } catch (error) {
    config = {};
  }

  let attached = false;
  const attach = () => {
    if (attached || !config.src) return;
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.src;
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(config.src);
      hls.attachMedia(video);
      video.hls = hls;
      return;
    }
    video.src = config.src;
  };

  const play = () => {
    attach();
    if (panel) panel.classList.add("is-hidden");
    const result = video.play();
    if (result && result.catch) result.catch(() => {});
  };

  if (button) button.addEventListener("click", play);
  if (panel) panel.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) play();
  });
});
