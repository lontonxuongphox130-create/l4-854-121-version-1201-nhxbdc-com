(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    var play = function () {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    play();
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().trim();
  };

  var filterCards = function (scope, keyword, type) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var query = normalize(keyword);
    var filterType = normalize(type || 'all');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var categoryText = normalize(card.getAttribute('data-tags'));
      var matchesSearch = !query || haystack.indexOf(query) !== -1;
      var matchesType = filterType === 'all' || categoryText.indexOf(filterType) !== -1;
      card.classList.toggle('hidden-by-search', !(matchesSearch && matchesType));
    });
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(function (input) {
    var scopeSelector = input.getAttribute('data-search-scope');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var panel = input.closest('.search-panel');
    var clear = panel ? panel.querySelector('[data-clear-search]') : null;

    if (!scope) {
      return;
    }

    input.addEventListener('input', function () {
      filterCards(scope, input.value, scope.getAttribute('data-active-filter'));
    });

    if (clear) {
      clear.addEventListener('click', function () {
        input.value = '';
        filterCards(scope, '', scope.getAttribute('data-active-filter'));
        input.focus();
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var scope = document.querySelector(button.getAttribute('data-filter-scope'));
      var filter = button.getAttribute('data-filter-value') || 'all';
      var group = button.closest('.filter-tabs');
      var input = document.querySelector('[data-search-scope="' + button.getAttribute('data-filter-scope') + '"]');

      if (!scope) {
        return;
      }

      scope.setAttribute('data-active-filter', filter);

      if (group) {
        Array.prototype.slice.call(group.querySelectorAll('button')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
      }

      filterCards(scope, input ? input.value : '', filter);
    });
  });
})();
