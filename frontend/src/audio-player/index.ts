import {AudioCache} from "./AudioPlayer";

const SoundManagerTimeout = 10000;

function preload() {

    // SoundManager2 promise
    const soundManagerLoaded = new Promise((resolve, reject) => {
        // check for timeout error
        const timeout = setTimeout(() => {
            reject(new Error("SoundManager2 load timeout."));
        }, SoundManagerTimeout);

        soundManager.onready = () => {
            soundManager.onready = undefined; // cleanup
            clearTimeout(timeout);
            resolve(true);
        };
    });

    // Window load promise
    const windowLoaded = new Promise((resolve, reject) => {
        let cb = () => {
            window.removeEventListener("load", cb); // cleanup
            resolve(true);
        };
        window.addEventListener("load", cb);
    });

    // Wait for it...
    return Promise.all([windowLoaded, soundManagerLoaded]);
}

async function main() {
    await preload();
    const audio = new AudioCache();
    console.log(audio);
}

main()
    .catch(err => console.error(err));
