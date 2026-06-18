import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('[data-player-overlay]');
  const stream = player.getAttribute('data-stream');
  let hlsInstance = null;
  let ready = false;

  async function playVideo() {
    try {
      await video.play();
    } catch (error) {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    }
  }

  function attachStream() {
    if (!video || !stream || ready) {
      return;
    }

    ready = true;
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, playVideo);
      hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal && overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
      return;
    }

    video.src = stream;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
  }

  function start() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    attachStream();
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
});
