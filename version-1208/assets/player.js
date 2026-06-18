(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-play]');
        if (!video || !overlay) {
            return;
        }
        var source = video.getAttribute('data-source');
        var started = false;
        var hls = null;

        function attachSource() {
            if (!source || started) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute('controls', 'controls');
        }

        function play() {
            attachSource();
            overlay.classList.add('is-hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        shell.addEventListener('dblclick', play);
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
})();
