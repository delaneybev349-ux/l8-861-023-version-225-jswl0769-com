(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!heroSlides.length) {
      return;
    }

    currentSlide = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  heroDots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var heroForm = document.querySelector('[data-hero-search]');

  if (heroForm) {
    heroForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroForm.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './search.html';

      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }

      window.location.href = target;
    });
  }

  var cardFilters = Array.prototype.slice.call(document.querySelectorAll('[data-filter-cards]'));

  cardFilters.forEach(function (filter) {
    filter.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    var input = filter.querySelector('input');
    var scope = document.querySelector(filter.getAttribute('data-filter-cards')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = document.querySelector(filter.getAttribute('data-empty-target'));

    if (!input) {
      return;
    }

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    });
  });

  function attachVideo(video) {
    var stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-stream]'));

  videos.forEach(function (video) {
    attachVideo(video);
  });

  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));

  playButtons.forEach(function (button) {
    var target = document.querySelector(button.getAttribute('data-play-button'));

    if (!target) {
      return;
    }

    button.addEventListener('click', function () {
      var playResult = target.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
      button.classList.add('is-hidden');
    });

    target.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    target.addEventListener('pause', function () {
      if (target.currentTime === 0 || target.ended) {
        button.classList.remove('is-hidden');
      }
    });
  });

  var searchRoot = document.querySelector('[data-search-page]');

  if (searchRoot && window.SEARCH_MOVIES) {
    var searchInput = searchRoot.querySelector('input');
    var results = searchRoot.querySelector('[data-search-results]');
    var emptyState = searchRoot.querySelector('[data-search-empty]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function movieTemplate(movie) {
      return [
        '<article class="movie-card" data-card>',
        '  <a href="' + movie.link + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <div class="poster-frame">',
        '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="year-chip">' + escapeHtml(movie.year) + '</span>',
        '    </div>',
        '    <div class="movie-info">',
        '      <div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '      <h2>' + escapeHtml(movie.title) + '</h2>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    function renderSearch(query) {
      var keyword = query.trim().toLowerCase();
      var source = window.SEARCH_MOVIES;
      var matched = keyword
        ? source.filter(function (movie) {
            return movie.search.indexOf(keyword) !== -1;
          })
        : source.slice(0, 48);

      matched = matched.slice(0, 120);
      results.innerHTML = matched.map(movieTemplate).join('');
      emptyState.style.display = matched.length ? 'none' : 'block';
    }

    var searchForm = searchRoot.querySelector('form');

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderSearch(searchInput ? searchInput.value : '');
      });
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener('input', function () {
        renderSearch(searchInput.value);
      });
    }

    renderSearch(initialQuery);
  }
})();
