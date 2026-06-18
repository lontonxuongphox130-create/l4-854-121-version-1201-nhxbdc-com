(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll(".js-hero").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length > 0) {
      show(0);
      start();
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
  });

  document.querySelectorAll("[data-filter-toolbar]").forEach(function (toolbar) {
    var target = document.querySelector(toolbar.getAttribute("data-target"));
    var input = toolbar.querySelector(".js-search-input");
    var chips = Array.prototype.slice.call(toolbar.querySelectorAll("[data-filter-value]"));
    var active = "all";
    var empty = target ? target.parentElement.querySelector(".empty-state") : null;

    function apply() {
      if (!target) {
        return;
      }

      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchText = !query || text.indexOf(query) !== -1;
        var matchFilter = active === "all" || text.indexOf(active.toLowerCase()) !== -1;
        var show = matchText && matchFilter;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    chips.forEach(function (chip) {
      if (chip.getAttribute("data-filter-value") === "all") {
        chip.classList.add("is-active");
      }

      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }
  });
})();
