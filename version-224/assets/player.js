(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var cover = document.getElementById("playCover");
        var hls = null;
        var ready = false;

        if (!video || !streamUrl) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = streamUrl;
        }

        function start() {
            prepare();
            var playPromise = video.play();

            if (cover) {
                cover.classList.add("is-hidden");
            }

            if (playPromise && playPromise.catch) {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (cover && !video.ended) {
                cover.classList.remove("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (cover) {
                cover.classList.remove("is-hidden");
            }
        });

        prepare();
    };
})();
