(() => {
    const ready = (fn) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    };

    ready(() => {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });

    function setupMenu() {
        const button = document.querySelector(".js-menu-toggle");
        const menu = document.querySelector(".js-mobile-nav");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", () => {
            const open = menu.classList.toggle("open");
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function setupHero() {
        const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
        const prev = document.querySelector("[data-hero-prev]");
        const next = document.querySelector("[data-hero-next]");
        let index = 0;
        let timer = 0;

        const show = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("active", dotIndex === index);
            });
        };

        const start = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5600);
        };

        dots.forEach((dot) => {
            dot.addEventListener("click", () => {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", () => {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", () => {
                show(index + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function setupFilters() {
        const panels = Array.from(document.querySelectorAll(".js-filter-panel"));
        panels.forEach((panel) => {
            const targetId = panel.dataset.target;
            const target = targetId ? document.getElementById(targetId) : document;
            if (!target) {
                return;
            }
            const cards = Array.from(target.querySelectorAll(".js-movie-card"));
            const search = panel.querySelector(".js-search");
            const region = panel.querySelector(".js-region-filter");
            const type = panel.querySelector(".js-type-filter");

            const apply = () => {
                const keyword = (search && search.value ? search.value : "").trim().toLowerCase();
                const regionValue = region && region.value ? region.value : "";
                const typeValue = type && type.value ? type.value : "";
                cards.forEach((card) => {
                    const text = (card.dataset.search || "").toLowerCase();
                    const cardRegion = card.dataset.region || "";
                    const cardType = card.dataset.type || "";
                    const keywordOk = !keyword || text.includes(keyword);
                    const regionOk = !regionValue || cardRegion.includes(regionValue);
                    const typeOk = !typeValue || cardType.includes(typeValue);
                    card.hidden = !(keywordOk && regionOk && typeOk);
                });
            };

            [search, region, type].forEach((control) => {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupPlayer() {
        const video = document.querySelector(".js-video-player");
        const button = document.querySelector(".js-play-button");
        const status = document.querySelector(".js-player-status");
        if (!video || !button) {
            return;
        }

        let hls = null;
        const stream = video.getAttribute("data-stream") || "";

        const setStatus = (text) => {
            if (status) {
                status.textContent = text;
            }
        };

        const startVideo = () => {
            if (!stream) {
                setStatus("播放源暂不可用");
                return;
            }

            button.classList.add("is-hidden");
            setStatus("正在加载影片");

            const playNow = () => {
                const result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(() => setStatus("点击视频画面继续播放"));
                }
            };

            if (window.Hls && window.Hls.isSupported()) {
                if (!hls) {
                    hls = new window.Hls({
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                        setStatus("已准备播放");
                        playNow();
                    });
                    hls.on(window.Hls.Events.ERROR, (event, data) => {
                        if (data && data.fatal) {
                            setStatus("播放连接异常，请稍后重试");
                        }
                    });
                } else {
                    playNow();
                }
                return;
            }

            if (!video.getAttribute("src")) {
                video.setAttribute("src", stream);
            }
            video.addEventListener("loadedmetadata", () => setStatus("已准备播放"), { once: true });
            playNow();
        };

        button.addEventListener("click", startVideo);
        video.addEventListener("click", () => {
            if (!video.getAttribute("src") && !hls) {
                startVideo();
            }
        });
        video.addEventListener("playing", () => setStatus(""));
        video.addEventListener("pause", () => {
            if (!video.ended) {
                setStatus("已暂停");
            }
        });
    }
})();
