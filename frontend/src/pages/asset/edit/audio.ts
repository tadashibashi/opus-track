// TODO: refactor this to use new AudioPlayer, same as frontend/src/pages/portfolio/assets
import {AudioEngine, Music} from "../../../../lib/WebAA";

window.addEventListener("load", main);


async function main() {

    const audio = new AudioEngine();
    audio.init();

    const music = new Music(audio.context, audio.busses.master.input);

    const addCreditBtn = document.getElementById("add-credit");
    const remCreditBtn = document.getElementById("remove-credit");

    addCreditBtn.addEventListener("click", evt => {
        const div = document.createElement("div");

        const nameLabel = document.createElement("label");
        nameLabel.innerHTML = "<input class='form-control' type='text' name='credits-name' required/>";
        div.appendChild(nameLabel);

        const roleLabel = document.createElement("label");
        roleLabel.innerHTML = "<input class='form-control' type='text' name='credits-role' required/>";
        div.appendChild(roleLabel);

        const credits = document.getElementById("credits");
        credits.appendChild(div);
    });

    remCreditBtn.addEventListener("click", evt => {
        const credits = document.getElementById("credits");
        if (credits.children.length > 1)
            credits.removeChild(credits.children[credits.children.length-1]);
    });


    const audioRegionBackgroundColor = "#ececec";

    const _URL = window.URL || window.webkitURL;

    const canvas = document.querySelector(".audio-player canvas") as HTMLCanvasElement;
    const canvasRect = canvas.getBoundingClientRect();
    canvas.width = canvasRect.width * 2;
    canvas.height = canvasRect.height * 2;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = audioRegionBackgroundColor;
    ctx.beginPath();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fill();
    ctx.closePath();

    const coverUploadEl = document.getElementById("imageFile") as HTMLInputElement;
    const coverImageEl = document.getElementById("cover-image") as HTMLImageElement;
    if (coverUploadEl && coverImageEl) {
        coverUploadEl.addEventListener("change", evt => {
            const files = coverUploadEl.files;
            if (files?.length) {
                let file: File | null;
                if ((file = files.item(0))) {
                    const image = new Image();

                    const url = _URL.createObjectURL(file);

                    image.onload = function() {
                        coverImageEl.src = url;
                        _URL.revokeObjectURL(url);
                        image.onload = null;
                    }

                    image.src = url;
                }
            }
        });
    } else {
        console.error("Could not find coverUploadEl or coverImageEl!");
    }
    const musicImage = new Image();

    music.source.mediaElement.addEventListener("loadstart", evt => {
        onMusicPlayPauseHandler();
    });
    music.source.mediaElement.addEventListener("playing", evt => {
        onMusicPlayPauseHandler();
    });
    music.source.mediaElement.addEventListener("pause", evt => {
        onMusicPlayPauseHandler();
    });

    canvas.addEventListener("click", async evt => {
        const rect = canvas.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;

        const percent = x / rect.width;
        const el = music.source.mediaElement;
        if (el.duration > 0) {
            el.pause();
            el.currentTime = el.duration * percent;
            await el.play();

            onMusicPlayPauseHandler();
        }
    });

    async function renderWaveform(arrayBuffer: ArrayBuffer) {
        const buffer = await music.context.decodeAudioData(arrayBuffer);
        const lChan = buffer.getChannelData(0);
        const rChan = buffer.getChannelData(1);

        ctx.beginPath();
        ctx.fillStyle = audioRegionBackgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill();
        const numSticks = 250;
        const width = canvas.width/numSticks;
        ctx.fillStyle = "gray";
        for (let i = 0; i < numSticks; i += 1) {
            const idx = Math.floor(buffer.length / numSticks * i)
            const cur = ((lChan[idx] + rChan[idx]) / 2.0);
            const height = Math.min(Math.abs(cur) * canvas.height * 1.25, (canvas.height-24)/2);
            const x = width * i;
            const y = canvas.height / 2 - height;
            ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(Math.floor(width * .75), 1), Math.floor(height * 2));
        }
        ctx.fill();
        ctx.closePath();
        musicImage.src = canvas.toDataURL("image/png");
    }


    // audio input setup
    const audioUploadEl = document.getElementById("audioFile") as HTMLInputElement;
    if (audioUploadEl) {
        audioUploadEl.addEventListener("change", async evt => {
            if (audioUploadEl.files) {
                if (music.source.mediaElement.src)
                    _URL.revokeObjectURL(music.source.mediaElement.src);
                let file: File | null = null;
                if ((file = audioUploadEl.files.item(0))) {
                    const url = _URL.createObjectURL(file);
                    music.source.mediaElement.src = url;
                    await renderWaveform(await file.arrayBuffer());
                }
            }

        });
    } else {
        console.error("Could not find audioUploadEl!");
    }

    let interval: number | null = null;
    const playButtonEl = document.querySelector(".audio-player .play-button");
    if (playButtonEl) {
        playButtonEl.addEventListener("click", async evt => {
            if (music.source.mediaElement.duration > 0) {
                if (music.paused) {
                    try {
                        await music.play();
                    } catch(err) {
                        console.error("Music failed to play");
                        return;
                    }

                    onMusicPlayPauseHandler();

                } else {
                    music.setPause(true);
                    onMusicPlayPauseHandler();
                }
            }
        });
    } else {
        console.error("Could not find playButtonEl!");
    }

    function onMusicPlayPauseHandler() {

        const el = music.source.mediaElement as HTMLAudioElement;
        const playBtn = playButtonEl.children[0] as HTMLImageElement;
        if (el.paused) {
            const playSrc = "/images/feather/play.svg";
            if (playBtn.src !== playSrc)
                playBtn.src = playSrc;
            if (interval !== null) {
                clearInterval(interval);
                interval = null;
            }
        } else {
            const pauseSrc = "/images/feather/pause.svg";
            if (playBtn.src !== pauseSrc)
                playBtn.src = pauseSrc;

            if (interval === null) {
                interval = setInterval(evt => {
                    ctx.fillStyle = audioRegionBackgroundColor;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (musicImage.src)
                        ctx.drawImage(musicImage, 0, 0);
                    ctx.fillStyle = "rgba(0,0,0,0.11)";
                    const xPosition = el.currentTime / el.duration * canvas.width;
                    ctx.fillRect(0, 0, xPosition, canvas.height);
                    ctx.fillStyle = "rgba(17,42,197,0.59)"
                    ctx.fillRect(Math.round(xPosition), 0, 4, canvas.height);
                }, 250);
            }
        }
    }


    const playerEl = document.querySelector(".audio-player") as HTMLElement;
    if (!playerEl) {
        console.error("audio player element could not be found!");
    } else {
        const musicSrc = playerEl.dataset.src;
        if (!music.load(musicSrc))
            console.error("Music failed to load");

        const response = await fetch(musicSrc);
        const buffer = await response.arrayBuffer();
        await renderWaveform(buffer);
    }
}
