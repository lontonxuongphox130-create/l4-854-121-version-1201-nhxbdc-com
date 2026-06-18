(function () {
  window.initMoviePlayer = function (streamUrl) {
    var frame = document.querySelector('[data-player-frame]');
    if (!frame || !streamUrl) {
      return;
    }
    var video = frame.querySelector('video');
    var overlay = frame.querySelector('[data-player-overlay]');
    var playButton = frame.querySelector('[data-play-button]');
    if (!video) {
      return;
    }

    function bindStream() {
      if (frame.dataset.ready === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        frame._hls = hls;
      } else {
        video.src = streamUrl;
      }
      frame.dataset.ready = '1';
    }

    function startPlayback() {
      bindStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }
    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
    video.addEventListener('click', function () {
      if (frame.dataset.ready !== '1') {
        startPlayback();
      }
    });
  };
})();
