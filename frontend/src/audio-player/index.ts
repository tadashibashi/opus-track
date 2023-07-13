import {AudioPlayer} from "./AudioPlayer";

function preload() {
    const soundManagerLoaded = new Promise((resolve, reject) => {
        soundManager.onready = () => {
            resolve(true);
        };
    });

    const windowLoaded = new Promise((resolve, reject) => {
        let cb = () => {
            window.removeEventListener("load", cb);
            resolve(true);
        };
        window.addEventListener("load", cb);
    });
    return Promise.all([windowLoaded, soundManagerLoaded]);
}

async function main() {
    await preload();
    const audio = new AudioPlayer();
    console.log(audio);
}

main()
    .catch(err => console.error(err));
