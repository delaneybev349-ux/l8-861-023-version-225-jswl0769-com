(function () {
    function startPlayer(root) {
        var video = root.querySelector("video");
        var button = root.querySelector("[data-play-button]");
        var streamUrl = root.getAttribute("data-stream-url");
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded || !video || !streamUrl) return;
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            load();
            root.classList.add("is-playing");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                root.classList.add("is-playing");
            });
            video.addEventListener("ended", function () {
                if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
                    hlsInstance.stopLoad();
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            document.querySelectorAll("[data-player]").forEach(startPlayer);
        });
    } else {
        document.querySelectorAll("[data-player]").forEach(startPlayer);
    }
})();
