(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img[data-fallback]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var timer = null;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            setSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (timer) {
                window.clearInterval(timer);
            }

            setSlide(index);
            startSlider();
        });
    });

    startSlider();

    var searchInput = document.querySelector('[data-search-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.library-card'));
    var activeFilter = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function matchesFilter(card, filterValue) {
        if (filterValue === 'all') {
            return true;
        }

        var type = card.getAttribute('data-type') || '';
        var genre = card.getAttribute('data-genre') || '';
        var year = card.getAttribute('data-year') || '';
        var region = card.getAttribute('data-region') || '';
        var joined = type + ' ' + genre + ' ' + year + ' ' + region;
        return joined.indexOf(filterValue) !== -1;
    }

    function filterCards() {
        var query = normalize(searchInput ? searchInput.value : '');

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-type'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' '));

            var visible = (!query || haystack.indexOf(query) !== -1) && matchesFilter(card, activeFilter);
            card.classList.toggle('is-filtered-out', !visible);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            filterCards();
        });
    });
})();
