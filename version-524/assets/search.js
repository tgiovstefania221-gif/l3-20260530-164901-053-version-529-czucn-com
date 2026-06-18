(function () {
    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[char];
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function card(movie) {
        var tags = String(movie.tags || "").split(/[,，、\/\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
            "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\">" +
            "<div class=\"poster-wrap\">" +
            "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<div class=\"card-mask\"><span class=\"play-badge\">▶</span></div>" +
            "<span class=\"corner-tag\">" + escapeHtml(movie.region) + "</span>" +
            "</div>" +
            "<div class=\"card-body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</a>" +
            "</article>";
    }

    function render() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = document.getElementById("searchInput");
        var title = document.getElementById("searchTitle");
        var results = document.getElementById("searchResults");
        var empty = document.getElementById("searchEmpty");
        if (input) {
            input.value = query;
        }
        if (!results || !window.movieIndex) {
            return;
        }
        var keyword = normalize(query);
        var list = window.movieIndex.filter(function (movie) {
            if (!keyword) {
                return true;
            }
            var text = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" "));
            return text.indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (title) {
            title.textContent = keyword ? "搜索结果：" + query : "热门影片";
        }
        results.innerHTML = list.map(card).join("");
        if (empty) {
            empty.classList.toggle("show", list.length === 0);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})();
