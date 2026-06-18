document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var prev = slider.querySelector('[data-slide-prev]');
    var next = slider.querySelector('[data-slide-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        startAuto();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        startAuto();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        startAuto();
      });
    }

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);
    show(0);
    startAuto();
  }

  document.querySelectorAll('[data-filter-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var category = area.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card'));
    var empty = area.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var categoryValue = category ? category.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var sameCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matched = sameCategory && (!keyword || text.indexOf(keyword) !== -1);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (category) {
      category.addEventListener('change', apply);
    }

    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('keyword');
    if (keyword && input) {
      input.value = keyword;
    }
    apply();
  });
});
