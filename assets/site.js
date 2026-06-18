(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var type = scope.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty]");

      function update() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedType = type ? type.value.trim() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var matchText = !keyword || text.indexOf(keyword) !== -1;
          var matchType = !selectedType || cardType.indexOf(selectedType) !== -1;
          var show = matchText && matchType;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }
      if (type) {
        type.addEventListener("change", update);
      }
      update();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }
      var stream = video.getAttribute("data-hls");
      var loaded = false;
      var hls = null;

      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.hidden = false;
            shell.classList.remove("is-playing");
          });
        }
      }

      function loadAndPlay() {
        if (!stream) {
          return;
        }
        overlay.hidden = true;
        shell.classList.add("is-playing");
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            playVideo();
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              playVideo();
            });
            playVideo();
          } else {
            video.src = stream;
            playVideo();
          }
        } else {
          playVideo();
        }
      }

      overlay.addEventListener("click", loadAndPlay);
      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener("play", function () {
        overlay.hidden = true;
        shell.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        overlay.hidden = false;
        shell.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFiltering();
    setupPlayers();
  });
})();
