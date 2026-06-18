(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector(".play-layer");
      var stream = shell.getAttribute("data-stream");
      var hls = null;
      var prepared = false;

      function prepare() {
        if (!video || !stream || prepared) {
          return;
        }

        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        prepare();
        shell.classList.add("is-playing");
        if (video) {
          video.controls = true;
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
