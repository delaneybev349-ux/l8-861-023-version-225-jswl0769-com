(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-grid]').forEach(function (grid) {
    var root = grid.closest('.container') || document;
    var search = root.querySelector('[data-card-search]');
    var filter = root.querySelector('[data-card-filter]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var genre = filter ? filter.value.trim() : '';
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-keywords') || '').toLowerCase();
        var cardGenre = card.getAttribute('data-genre') || '';
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchGenre = !genre || cardGenre.indexOf(genre) !== -1 || text.indexOf(genre.toLowerCase()) !== -1;
        card.classList.toggle('is-filtered-out', !(matchKeyword && matchGenre));
      });
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }

    if (filter) {
      filter.addEventListener('change', applyFilter);
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildSearchCard(item) {
    return '<a class="movie-card" href="' + escapeHtml(item.url) + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="card-score">' + escapeHtml(item.rating) + '</span>' +
      '<span class="card-duration">' + escapeHtml(item.duration) + '</span>' +
      '</span>' +
      '<span class="card-body">' +
      '<span class="card-category">' + escapeHtml(item.category) + '</span>' +
      '<strong>' + escapeHtml(item.title) + '</strong>' +
      '<span class="card-desc">' + escapeHtml(item.summary) + '</span>' +
      '<span class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span>' +
      '</span>' +
      '</a>';
  }

  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  if (searchInput && searchResults && window.YSM_SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    searchInput.value = initialKeyword;

    function renderSearch() {
      var keyword = searchInput.value.trim().toLowerCase();
      var items = window.YSM_SEARCH_ITEMS;
      var results = keyword
        ? items.filter(function (item) {
            return String(item.keywords || '').toLowerCase().indexOf(keyword) !== -1;
          }).slice(0, 80)
        : items.slice(0, 24);

      if (!results.length) {
        searchResults.innerHTML = '<div class="article-box"><h2>暂无匹配结果</h2><p>可以尝试更换片名、类型、标签、地区或年份继续搜索。</p></div>';
        return;
      }

      searchResults.innerHTML = '<div class="movie-grid movie-grid-four">' + results.map(buildSearchCard).join('') + '</div>';
    }

    searchInput.addEventListener('input', renderSearch);
    renderSearch();
  }
})();

function initPlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var button = document.getElementById('player-start');
  var hls = null;
  var attached = false;

  if (!video || !streamUrl) {
    return;
  }

  function hideLayer() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function playVideo() {
    hideLayer();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = streamUrl;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attachStream();
    if (video.readyState > 0) {
      playVideo();
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('click', start);
  video.addEventListener('play', hideLayer);
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
