(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var navLinks = document.querySelector("[data-nav-links]");
        if (menuButton && navLinks) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length > 1) {
            var index = 0;
            var show = function (next) {
                index = next;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("active", i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }

        var filterList = document.querySelector("[data-filter-list]");
        if (filterList) {
            var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
            var input = document.querySelector(".filter-input");
            var typeSelect = document.querySelector(".filter-select");
            var yearSelect = document.querySelector(".filter-year");
            var categorySelect = document.querySelector(".filter-category");
            var empty = document.querySelector("[data-empty-state]");
            var runFilter = function () {
                var keyword = normalize(input && input.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var category = normalize(categorySelect && categorySelect.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.genre
                    ].join(" "));
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                        ok = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        ok = false;
                    }
                    if (category && normalize(card.dataset.category) !== category) {
                        ok = false;
                    }
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            };
            [input, typeSelect, yearSelect, categorySelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", runFilter);
                    node.addEventListener("change", runFilter);
                }
            });
        }
    });

    window.createMoviePlayer = function (config) {
        ready(function () {
            var video = document.querySelector(config.videoSelector);
            var button = document.querySelector(config.buttonSelector);
            var source = config.source;
            var started = false;
            var hlsInstance = null;
            if (!video || !button || !source) {
                return;
            }
            var load = function () {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            };
            var play = function () {
                load();
                button.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            };
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    play();
                }
            });
            video.addEventListener("error", function () {
                button.classList.remove("is-hidden");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    };
})();
