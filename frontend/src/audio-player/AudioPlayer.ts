import "soundmanager2";


export class AudioPlayer {
    sounds: Map<string, soundmanager.SMSound>;
    current: number;

    constructor() {
        this.current = 0;
        this.sounds = new Map;

    }
}
