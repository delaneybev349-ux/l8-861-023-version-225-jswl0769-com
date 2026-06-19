(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      menuButton.textContent = mobileMenu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
      dot.setAttribute('aria-pressed', dotIndex === currentSlide ? 'true' : 'false');
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchRoot = document.querySelector('[data-search-root]');

  if (searchRoot) {
    var input = searchRoot.querySelector('[data-search-input]');
    var region = searchRoot.querySelector('[data-filter-region]');
    var type = searchRoot.querySelector('[data-filter-type]');
    var year = searchRoot.querySelector('[data-filter-year]');
    var status = searchRoot.querySelector('[data-search-status]');
    var cards = Array.prototype.slice.call(searchRoot.querySelectorAll('[data-search-card]'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applySearch() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords') + ' ' + card.getAttribute('data-title'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '已匹配 ' + visible + ' 部影片' : '没有找到匹配影片';
      }
    }

    [input, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }

  var configNode = document.getElementById('movie-player-config');
  var video = document.querySelector('[data-player-video]');
  var startButton = document.querySelector('[data-player-start]');
  var veil = document.querySelector('[data-player-veil]');

  if (configNode && video) {
    var config = {};

    try {
      config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
      config = {};
    }

    var sourceUrl = config.src || '';
    var ready = false;
    var hlsInstance = null;

    function attachSource() {
      if (!sourceUrl || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function playMovie() {
      attachSource();
      video.controls = true;

      if (veil) {
        veil.classList.add('is-hidden');
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playMovie);
    }

    if (veil) {
      veil.addEventListener('click', playMovie);
    }

    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        playMovie();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
