(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    all("[data-carousel]").forEach(function (carousel) {
      var slides = all("[data-slide]", carousel);
      var dots = all("[data-carousel-dot]", carousel);
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
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

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });
      show(0);
      restart();
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function currentCards() {
    return all(".movie-card, .horizontal-card, .rank-card");
  }

  function applySearch() {
    var inputs = all(".site-search");
    var query = "";
    inputs.forEach(function (input) {
      if (input.value.trim()) {
        query = input.value.trim();
      }
    });
    var q = normalize(query);
    var cards = currentCards();
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var match = !q || haystack.indexOf(q) !== -1;
      card.hidden = !match;
      if (match) {
        visible += 1;
      }
    });
    all(".no-results").forEach(function (box) {
      box.hidden = !q || visible > 0;
    });
  }

  function initSearch() {
    all(".site-search").forEach(function (input) {
      input.addEventListener("input", function () {
        all(".site-search").forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        applySearch();
      });
    });
    all(".wide-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
      });
    });
  }

  function initFilters() {
    all("[data-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter");
        all("[data-filter]").forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        var visible = 0;
        currentCards().forEach(function (card) {
          var tags = card.getAttribute("data-tags") || "";
          var match = value === "all" || tags.indexOf(value) !== -1;
          card.hidden = !match;
          if (match) {
            visible += 1;
          }
        });
        all(".no-results").forEach(function (box) {
          box.hidden = visible > 0;
        });
      });
    });
  }

  window.setupMoviePlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !streamUrl) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }
      video.src = streamUrl;
    }

    function startPlayback() {
      loadStream();
      overlay.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initCarousel();
    initSearch();
    initFilters();
  });
})();
