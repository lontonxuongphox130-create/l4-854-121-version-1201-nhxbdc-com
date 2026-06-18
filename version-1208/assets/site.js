(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dotsWrap = qs('[data-hero-dots]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            if (dotsWrap) {
                qsa('button', dotsWrap).forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }
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
                timer = null;
            }
        }

        if (dotsWrap) {
            slides.forEach(function (_, slideIndex) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换到第' + (slideIndex + 1) + '屏');
                dot.addEventListener('click', function () {
                    show(slideIndex);
                    start();
                });
                dotsWrap.appendChild(dot);
            });
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
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = qs('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var input = qs('[data-filter-input]', panel);
        var year = qs('[data-filter-year]', panel);
        var region = qs('[data-filter-region]', panel);
        var clear = qs('[data-filter-clear]', panel);
        var cards = qsa('[data-card]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear.indexOf(yearValue) === -1) {
                    matched = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    matched = false;
                }
                card.classList.toggle('is-hidden', !matched);
            });
        }

        [input, year, region].forEach(function (element) {
            if (!element) {
                return;
            }
            element.addEventListener('input', apply);
            element.addEventListener('change', apply);
        });

        if (clear) {
            clear.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                apply();
            });
        }

        apply();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
