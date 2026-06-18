(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-arrow.prev");
        var next = hero.querySelector(".hero-arrow.next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
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

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initSearchPage() {
        var input = document.querySelector(".search-input");
        var grid = document.querySelector(".search-results");
        var empty = document.querySelector(".empty-state");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim().toLowerCase();
        if (input) {
            input.value = q;
        }

        function apply(value) {
            var term = value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-search") || "";
                var matched = !term || text.indexOf(term) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        apply(q);
        if (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        }
    }

    function initPlayer() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var action = shell.querySelector(".player-action");
            var status = shell.querySelector(".player-status");
            var stream = shell.getAttribute("data-stream");
            if (!video || !stream) {
                return;
            }

            function showError() {
                if (status) {
                    status.hidden = false;
                }
            }

            function attachStream() {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    return;
                }
                video.src = stream;
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(showError);
                }
            }

            function togglePlay() {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            }

            attachStream();

            if (action) {
                action.addEventListener("click", function (event) {
                    event.preventDefault();
                    togglePlay();
                });
            }

            video.addEventListener("click", togglePlay);
            video.addEventListener("play", function () {
                shell.classList.add("playing");
            });
            video.addEventListener("pause", function () {
                shell.classList.remove("playing");
            });
            video.addEventListener("ended", function () {
                shell.classList.remove("playing");
            });
            video.addEventListener("error", showError);
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchPage();
        initPlayer();
    });
})();
