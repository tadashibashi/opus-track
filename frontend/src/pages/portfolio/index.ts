import {AudioEngine} from "../../../lib/WebAA";
import {AudioPlayer} from "../../audio-player/AudioPlayer";



// ===== main driver =====
window.addEventListener("load", main);
const players: AudioPlayer[] = [];
function playCallback() {
    players.forEach(player => {
        player.pause();
    });
}

function main() {
    const engine = new AudioEngine();
    engine.init();

    const playerEls = document.querySelectorAll(".audio-player");
    const playBtns = document.querySelectorAll(".audio-player .play-button");
    const canvases = document.querySelectorAll(".audio-player canvas");
    const timeEls = document.querySelectorAll(".audio-player .time-display");

    playerEls.forEach((player: HTMLElement, i) => {
        players.push(new AudioPlayer(engine,
            player.dataset.src,
            playBtns[i] as HTMLButtonElement,
            canvases[i] as HTMLCanvasElement,
            timeEls[i] as HTMLElement,
            playCallback));
    });
}
