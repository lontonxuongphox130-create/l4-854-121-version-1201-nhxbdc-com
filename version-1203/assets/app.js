(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (!slides.length) return;
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupSearch() {
    var input = document.querySelector('.movie-search');
    var areas = Array.prototype.slice.call(document.querySelectorAll('.searchable-area'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    if (!input || !areas.length) return;

    function collectCards() {
      var cards = [];
      areas.forEach(function (area) {
        cards = cards.concat(Array.prototype.slice.call(area.children));
      });
      return cards;
    }

    function match(card, text) {
      if (!text) return true;
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      return haystack.indexOf(text) !== -1;
    }

    function apply(value) {
      var keyword = String(value || input.value || '').trim().toLowerCase();
      collectCards().forEach(function (card) {
        card.classList.toggle('is-filtered-out', !match(card, keyword));
      });
    }

    input.addEventListener('input', function () {
      filters.forEach(function (button) {
        button.classList.remove('is-active');
      });
      apply(input.value);
    });

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || '';
        filters.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        input.value = value;
        apply(value);
      });
    });
  }

  function setupPlayer() {
    var video = document.getElementById('main-player');
    var overlay = document.querySelector('.player-overlay');
    if (!video) return;
    var source = video.getAttribute('data-m3u8');
    var loaded = false;

    function loadSource() {
      if (loaded || !source) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlay() {
      loadSource();
      if (overlay) overlay.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) overlay.classList.remove('is-hidden');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) startPlay();
    });

    video.addEventListener('play', function () {
      if (overlay) overlay.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (overlay && !video.ended) overlay.classList.remove('is-hidden');
    });
  }

  ready(function () {
    setupMenu();
    setupCarousel();
    setupSearch();
    setupPlayer();
  });
})();
