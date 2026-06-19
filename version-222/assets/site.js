(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const nav = document.querySelector('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let currentSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === currentSlide);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  document.querySelectorAll('.hero-control.next').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      startCarousel();
    });
  });

  document.querySelectorAll('.hero-control.prev').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      startCarousel();
    });
  });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      startCarousel();
    });
  });

  startCarousel();

  function applyFilters() {
    const queryInput = document.querySelector('.movie-search');
    const categorySelect = document.querySelector('.category-filter');
    const query = queryInput ? queryInput.value.trim().toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : 'all';
    document.querySelectorAll('.movie-card').forEach(function (card) {
      const haystack = card.getAttribute('data-filter') || '';
      const cardCategory = card.getAttribute('data-category') || '';
      const queryMatch = !query || haystack.indexOf(query) !== -1;
      const categoryMatch = category === 'all' || cardCategory === category;
      card.classList.toggle('hidden-by-filter', !(queryMatch && categoryMatch));
    });
  }

  document.querySelectorAll('.movie-search').forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  document.querySelectorAll('.category-filter').forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  const params = new URLSearchParams(window.location.search);
  const queryParam = params.get('q');
  const firstSearch = document.querySelector('.movie-search');
  if (queryParam && firstSearch) {
    firstSearch.value = queryParam;
    applyFilters();
  }
})();

function initMoviePlayer(source) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.querySelector('.player-overlay');
  if (!video || !source) {
    return;
  }

  let hls = null;
  let ready = false;

  function markReady() {
    ready = true;
  }

  function prepare() {
    if (ready) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, markReady);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          ready = false;
        }
      });
      ready = true;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', markReady, { once: true });
      ready = true;
    }
  }

  function play() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  prepare();

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
