
class AudioAnalyzer {
    analyzer: AnalyserNode;
    buffer: Float32Array;

    constructor(ctx: AudioContext, fftSize: number = 2048) {
        fftSize = Math.max(Math.floor(fftSize), 1);

        this.analyzer = new AnalyserNode(ctx, {fftSize});
        this.buffer = new Float32Array(this.analyzer.fftSize);
        this.fftSize = this.analyzer.fftSize;
    }

    get context() { return this.analyzer.context; }

    // plug audio signal into the visualizer
    attach(node: AudioNode) {
        node.connect(this.analyzer);
        return this;
    }

    set fftSize(val: number) {
        val = Math.max(Math.floor(val), 1);
        this.analyzer.fftSize = val;

        this.buffer = new Float32Array(this.analyzer.fftSize);
    }

    get fftSize() {
        return this.analyzer.fftSize;
    }

    detach(node: AudioNode) {
        node.disconnect(this.analyzer);
    }

    // update internal buffer with latest audio data
    update() {
        this.analyzer.getFloatFrequencyData(this.buffer);
    }

    get fft() {
        return this.buffer;
    }
}