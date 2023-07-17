import {AudioEngine, Music} from "../../../lib/WebAA";

const audio = new AudioEngine();
audio.init();

const music = new Music(audio.context, audio.busses.master.input);

window.addEventListener("load", main);

function main() {
    const addCreditBtn = document.getElementById("add-credit");
    const remCreditBtn = document.getElementById("remove-credit");

    addCreditBtn.addEventListener("click", evt => {
        const div = document.createElement("div");

        const nameLabel = document.createElement("label");
        nameLabel.innerHTML = "<input class='form-control' type='text' name='credits-name'/>";
        div.appendChild(nameLabel);

        const roleLabel = document.createElement("label");
        roleLabel.innerHTML = "<input class='form-control' type='text' name='credits-role'/>";
        div.appendChild(roleLabel);

        const credits = document.getElementById("credits");
        credits.appendChild(div);
    });

    remCreditBtn.addEventListener("click", evt => {
         const credits = document.getElementById("credits");
         if (credits.children.length > 2)
            credits.removeChild(credits.children[credits.children.length-1]);
    });


    const audioRegionBackgroundColor = "#ececec";

    const _URL = window.URL || window.webkitURL;

    const canvas = document.querySelector(".audio-player canvas") as HTMLCanvasElement;
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
    let interval = -1;
    music.source.mediaElement.onloadstart = evt => {
        (playButtonEl.children[0] as HTMLImageElement).src = "/images/feather/play.svg";
    };
    music.source.mediaElement.onplaying = evt => {
        const el = evt.target as HTMLAudioElement;
        (playButtonEl.children[0] as HTMLImageElement).src = "/images/feather/pause.svg";
        interval = setInterval(evt => {
            ctx.fillStyle = audioRegionBackgroundColor;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (musicImage.src)
                ctx.drawImage(musicImage, 0, 0);
            ctx.fillStyle = "rgba(0,0,0,0.11)";
            const xPosition = el.currentTime / el.duration * canvas.width;
            ctx.fillRect(0, 0, xPosition, canvas.height);
            ctx.fillStyle = "rgba(17,42,197,0.59)"
            ctx.fillRect(xPosition-1, 0, 2, canvas.height);
        }, 250);
    };

    music.source.mediaElement.onpause = evt => {
        (playButtonEl.children[0] as HTMLImageElement).src = "/images/feather/play.svg";
        if (interval !== -1) {
            clearInterval(interval);
            interval = -1;
        }
    }

    canvas.addEventListener("click", async evt => {
        const rect = canvas.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;

        const percent = x / rect.width;
        console.log(percent);
        const el = music.source.mediaElement;
        if (el.duration > 0) {
            el.pause();
            el.currentTime = el.duration * percent;
            await el.play();
        }
    });



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
                    music.load(url);

                    const buffer = await music.context.decodeAudioData(await file.arrayBuffer());
                    const lChan = buffer.getChannelData(0);
                    const rChan = buffer.getChannelData(1);

                    ctx.beginPath();
                    ctx.fillStyle = audioRegionBackgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fill();
                    const numSticks = 150;
                    const width = canvas.width/numSticks;
                    ctx.fillStyle = "gray";
                    for (let i = 0; i < numSticks; i += 1) {
                        const idx = Math.floor(buffer.length / numSticks * i)
                        const cur = ((lChan[idx] + rChan[idx]) / 2.0);
                        const height = Math.min(Math.abs(cur) * canvas.height * 1.5, canvas.height);
                        const x = width * i;
                        const y = canvas.height / 2 - height;
                        ctx.fillRect(x, y, 1, height * 2);
                    }
                    ctx.fill();
                    ctx.closePath();
                    musicImage.src = canvas.toDataURL("image/png");
                }
            }
        });
    } else {
        console.error("Could not find audioUploadEl!");
    }

    const playButtonEl = document.querySelector(".audio-player .play-button");
    if (playButtonEl) {
        playButtonEl.addEventListener("click", async evt => {
            if (music.source.mediaElement.duration > 0) {
                if (music.paused) {
                    await music.play();

                } else {
                    music.setPause(true);

                }
            }
        });
    } else {
        console.error("Could not find playButtonEl!");
    }


    const playerEl = document.getElementById("audio-player");

}