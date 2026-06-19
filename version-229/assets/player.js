(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector("[data-player]");

        if (!shell) {
            return;
        }

        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-button");

        if (!video) {
            return;
        }

        var stream = video.getAttribute("data-stream") || "";
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            prepared = true;
        }

        function play() {
            prepare();
            shell.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    shell.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        shell.addEventListener("click", function (event) {
            if (event.target === video && !prepared) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    });
})();
