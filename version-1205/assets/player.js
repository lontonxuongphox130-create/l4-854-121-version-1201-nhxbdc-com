(function () {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playerOverlay');
  var playButton = document.getElementById('playButton');

  if (!video || typeof streamUrl === 'undefined') {
    return;
  }

  var loaded = false;
  var hls = null;

  var loadVideo = function () {
    if (loaded) {
      return;
    }

    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  };

  var startPlayback = function () {
    loadVideo();

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }

    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  };

  if (overlay) {
    overlay.addEventListener('click', function () {
      startPlayback();
    });
  }

  if (playButton) {
    playButton.addEventListener('click', function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && !video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
