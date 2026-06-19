(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (navToggle && mobilePanel) {
        navToggle.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
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
            slide.classList.toggle("is-active", slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyMessage = document.querySelector("[data-empty-message]");
        var query = normalize(searchInputs.map(function (input) {
            return input.value;
        }).join(" "));
        var activeChip = document.querySelector("[data-filter-chip].is-active");
        var filter = activeChip ? activeChip.getAttribute("data-filter-chip") : "all";
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search-card"));
            var cardFilter = card.getAttribute("data-card-filter") || "";
            var matchedText = !query || text.indexOf(query) !== -1;
            var matchedFilter = filter === "all" || cardFilter.indexOf(filter) !== -1;
            var matched = matchedText && matchedFilter;

            card.classList.toggle("hidden-card", !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (emptyMessage) {
            emptyMessage.classList.toggle("is-visible", visible === 0);
        }
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
    });

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            chips.forEach(function (item) {
                item.classList.remove("is-active");
            });
            chip.classList.add("is-active");
            applyFilters();
        });
    });
})();
