(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            }, { once: true });
        });

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length) {
            var current = 0;
            var showSlide = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });
            showSlide(0);
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var filterAreas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
        filterAreas.forEach(function (area) {
            var keyword = area.querySelector("[data-search-input]");
            var typeSelect = area.querySelector("[data-type-select]");
            var regionSelect = area.querySelector("[data-region-select]");
            var yearSelect = area.querySelector("[data-year-select]");
            var cards = Array.prototype.slice.call(area.querySelectorAll("[data-card]"));
            var emptyState = area.querySelector("[data-empty-state]");
            var apply = function () {
                var keywordValue = keyword ? keyword.value.trim().toLowerCase() : "";
                var typeValue = typeSelect ? typeSelect.value : "";
                var regionValue = regionSelect ? regionSelect.value : "";
                var yearValue = yearSelect ? yearSelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matched = true;
                    if (keywordValue && text.indexOf(keywordValue) === -1) matched = false;
                    if (typeValue && card.getAttribute("data-type") !== typeValue) matched = false;
                    if (regionValue && card.getAttribute("data-region") !== regionValue) matched = false;
                    if (yearValue && card.getAttribute("data-year") !== yearValue) matched = false;
                    card.style.display = matched ? "" : "none";
                    if (matched) visible += 1;
                });
                if (emptyState) {
                    emptyState.classList.toggle("show", visible === 0);
                }
            };
            [keyword, typeSelect, regionSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    });
})();
