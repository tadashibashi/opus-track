import {AudioEngine, Music} from "../../lib/WebAA";

/**
 * Manages sound for an entire page
 */
class AudioPlayer {
    engine: AudioEngine;
    current: Music | null;
    last: Music | null;

    constructor() {
        this.engine = new AudioEngine();
        this.engine.init();

        this.current = null;
        this.last = null;
    }

    load(path: string) {
        return this.engine.loadMusic(path);
    }
}