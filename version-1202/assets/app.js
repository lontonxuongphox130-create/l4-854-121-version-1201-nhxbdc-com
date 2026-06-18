(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    if (!input || !cards.length) {
      return;
    }
    var region = document.querySelector('[data-region-filter]');
    var type = document.querySelector('[data-type-filter]');
    var year = document.querySelector('[data-year-filter]');
    var empty = document.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && !input.value) {
      input.value = q;
    }

    function matches(card) {
      var query = normalize(input.value);
      var regionValue = region ? normalize(region.value) : '';
      var typeValue = type ? normalize(type.value) : '';
      var yearValue = year ? normalize(year.value) : '';
      var content = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(' '));
      var okQuery = !query || content.indexOf(query) !== -1;
      var okRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
      var okType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
      var okYear = !yearValue || normalize(card.dataset.year) === yearValue;
      return okQuery && okRegion && okType && okYear;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var isVisible = matches(card);
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    [region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
