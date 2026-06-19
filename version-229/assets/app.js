(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var searchInput = document.querySelector("[data-site-search]");
        var yearSelect = document.querySelector("[data-filter-year]");
        var genreSelect = document.querySelector("[data-filter-genre]");
        var emptyState = document.querySelector("[data-empty-state]");

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var genre = genreSelect ? genreSelect.value : "";
            var shown = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardGenre = card.getAttribute("data-genre") || "";
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    shown += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = shown !== 0;
            }
        }

        [searchInput, yearSelect, genreSelect].forEach(function (control) {
            if (!control) {
                return;
            }

            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
    });
})();
