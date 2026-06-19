import { H as Hls } from "./hls-module.js";

export function setupPlayer(videoId, source, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var loaded = false;
    var hls = null;

    if (!video) {
        return;
    }

    function markPlaying() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    function loadSource() {
        if (loaded) {
            return Promise.resolve();
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1600);
            });
        }

        video.src = source;
        video.load();
        return Promise.resolve();
    }

    function startPlayback() {
        markPlaying();
        loadSource().then(function () {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        });
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", markPlaying);

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
