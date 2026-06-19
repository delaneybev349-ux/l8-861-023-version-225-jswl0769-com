(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var open = mobileNav.classList.toggle("open");
                menuButton.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var activeSlide = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeSlide = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === activeSlide);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === activeSlide);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-slide") || 0));
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeSlide + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-page-filter]");
        if (filterInput) {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".card-grid [data-search]"));
            filterInput.addEventListener("input", function () {
                var keyword = normalize(filterInput.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    card.classList.toggle("card-hidden", keyword && text.indexOf(keyword) === -1);
                });
            });
        }

        var searchPanel = document.getElementById("searchPanel");
        var searchInput = document.getElementById("searchInput");
        var searchResults = document.getElementById("searchResults");
        var searchSummary = document.getElementById("searchSummary");

        function renderSearch() {
            if (!searchResults || !window.SEARCH_INDEX) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var keyword = normalize(searchInput ? searchInput.value : params.get("q"));
            if (searchInput && !searchInput.value && params.get("q")) {
                searchInput.value = params.get("q");
            }
            var data = window.SEARCH_INDEX;
            var matches = data.filter(function (item) {
                if (!keyword) {
                    return false;
                }
                var text = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.tags,
                    item.category,
                    item.summary
                ].join(" "));
                return text.indexOf(keyword) !== -1;
            }).slice(0, 120);

            searchResults.innerHTML = matches.map(function (item) {
                return [
                    "<article class="movie-card">",
                    "<a class="movie-poster" href="" + item.url + "" aria-label="" + escapeHtml(item.title) + "">",
                    "<img src="" + item.poster + "" alt="" + escapeHtml(item.title) + "" loading="lazy">",
                    "<span class="movie-type">" + escapeHtml(item.type) + "</span>",
                    "<span class="movie-play">▶</span>",
                    "</a>",
                    "<div class="movie-card-body">",
                    "<a class="movie-title" href="" + item.url + "">" + escapeHtml(item.title) + "</a>",
                    "<p class="movie-desc">" + escapeHtml(item.summary) + "</p>",
                    "<div class="movie-meta"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div>",
                    "<div class="tag-row"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.genre) + "</span></div>",
                    "</div>",
                    "</article>"
                ].join("");
            }).join("");

            if (searchSummary) {
                searchSummary.textContent = keyword ? "已显示匹配影片，点击卡片进入播放页。" : "输入关键词后显示匹配影片。";
            }
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        if (searchPanel && searchInput) {
            searchPanel.addEventListener("submit", function (event) {
                event.preventDefault();
                var params = new URLSearchParams();
                if (searchInput.value.trim()) {
                    params.set("q", searchInput.value.trim());
                }
                window.history.replaceState(null, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
                renderSearch();
            });
            searchInput.addEventListener("input", renderSearch);
            renderSearch();
        }
    });
}());
