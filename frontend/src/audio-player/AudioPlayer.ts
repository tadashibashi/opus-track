import {AudioEngine, Music} from "../../lib/WebAA";

const PLAY_BTN_IMG_SRC = "/images/feather/play.svg";
const PAUSE_BTN_IMG_SRC = "/images/feather/pause.svg";
const AUDIO_CANVAS_UPDATE_PERIOD = 250;
const AUDIO_REGION_BACKGROUND_COLOR =  "#ececec";


async function fetchAudio(url): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => resolve(request.response);
        request.onerror = (e) => reject(e);
        request.send();
    });
}

export class AudioPlayer {
    music: Music;
    interval: NodeJS.Timer | null;
    musicImage: HTMLImageElement;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    playBtn: HTMLButtonElement;
    playBtnImage: HTMLImageElement;
    timeEl: HTMLElement;
    filePath: string;
    haltAll: ()=>void;

    pause() {
        this.music.setPause(true);
        this.onMusicPlayerHandler();
    }

    async play() {
        this.haltAll();
        await this.music.play();
        this.onMusicPlayerHandler();
    }

    constructor(engine: AudioEngine, filePath: string, playButton: HTMLButtonElement, canvas: HTMLCanvasElement,
                timeEl: HTMLElement, haltAll: ()=>void) {
        const music = new Music(engine.context, engine.busses.master.input);

        this.music = music;
        this.haltAll = haltAll;
        this.onMusicPlayerHandler = this.onMusicPlayerHandler.bind(this);
        this.playBtn = playButton;
        this.playBtnImage = playButton.children[0] as HTMLImageElement; // TODO: unsafe, check later.

        const canvasRect = canvas.getBoundingClientRect();
        canvas.width = canvasRect.width * 2;
        canvas.height = canvasRect.height * 2;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.ctx.fillStyle = AUDIO_REGION_BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fill();

        this.interval = null;
        this.musicImage = new Image();
        this.filePath = filePath;

        this.timeEl = timeEl;


        // ===== set up listeners =====

        music.source.mediaElement.addEventListener("loadstart", this.onMusicPlayerHandler);
        music.source.mediaElement.addEventListener("loadedmetadata", () => {
            const duration = music.source.mediaElement.duration;
            timeEl.children[1].innerHTML = Math.floor(duration/60).toString().padStart(1, "0") + ":" +
                (Math.floor(duration) % 60).toString().padStart(2, "0");
        });
        music.source.mediaElement.addEventListener("playing", this.onMusicPlayerHandler);
        music.source.mediaElement.addEventListener("pause", this.onMusicPlayerHandler);
        music.load(filePath);

        // canvas click listener
        canvas.addEventListener("click", async evt => {
            const rect = canvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;

            const percent = x / rect.width;
            const el = music.source.mediaElement;
            if (el.duration > 0) {
                this.pause();
                el.currentTime = el.duration * percent;
                await this.play();
            }
        });

        // set up play button click listener
        playButton.addEventListener("click", async evt => {
            if (music.source.mediaElement.duration > 0) {
                if (music.source.mediaElement.paused) {
                    try {
                        await this.play();
                    } catch(err) {
                        console.error("Music failed to play");
                        return;
                    }

                } else {
                    this.pause();
                }
            }
        });

        this.genImage()
            .catch(err => console.error(err));
    }

    async genImage() {
        const arrayBuffer = await fetchAudio(this.filePath);
        const buffer = await this.music.context.decodeAudioData(arrayBuffer);
        const lChan = buffer.getChannelData(0);
        const rChan = buffer.getChannelData(1);
        const ctx = this.ctx;
        const canvas = this.canvas;

        ctx.fillStyle = AUDIO_REGION_BACKGROUND_COLOR;
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
        this.musicImage.src = canvas.toDataURL("image/png");
    }

    // Triggers or cancels playhead animation when player plays/pauses
    onMusicPlayerHandler() {
        const el = this.music.source.mediaElement;
        const playBtnImage = this.playBtnImage;

        if (el.paused) { // audio is paused
            if (playBtnImage.src !== PLAY_BTN_IMG_SRC) {
                playBtnImage.src = PLAY_BTN_IMG_SRC;
            }

            if (this.interval !== null) {
                clearInterval(this.interval);
                this.interval = null;
            }
        } else { // audio is not paused
            if (playBtnImage.src !== PAUSE_BTN_IMG_SRC)
                playBtnImage.src = PAUSE_BTN_IMG_SRC;

            if (this.interval === null) {
                this.interval = setInterval(() =>{
                    const ctx = this.ctx;
                    const canvas = this.canvas;
                    const musicImage = this.musicImage;

                    ctx.fillStyle = AUDIO_REGION_BACKGROUND_COLOR;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (musicImage.src)
                        ctx.drawImage(musicImage, 0, 0);
                    ctx.fillStyle = "rgba(0,0,0,0.11)";
                    const xPosition = el.currentTime / el.duration * canvas.width;
                    ctx.fillRect(0, 0, xPosition, canvas.height);
                    ctx.fillStyle = "rgba(17,42,197,0.59)"
                    ctx.fillRect(Math.round(xPosition), 0, 4, canvas.height);

                    const seconds = this.music.source.mediaElement.currentTime;
                    this.timeEl.children[0].innerHTML =
                        Math.floor(seconds/60).toString().padStart(1, "0") + ":" +
                        (Math.floor(seconds) % 60).toString().padStart(2, "0");


                }, AUDIO_CANVAS_UPDATE_PERIOD);
            }
        }
    }
}