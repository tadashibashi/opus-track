/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/WebAA/index.ts":
/*!****************************!*\
  !*** ./lib/WebAA/index.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Please make sure to add all new source files to this barrel file
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./src/AudioEffect */ "./lib/WebAA/src/AudioEffect.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/AudioEngine */ "./lib/WebAA/src/AudioEngine.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Bus */ "./lib/WebAA/src/Bus.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/BusMgr */ "./lib/WebAA/src/BusMgr.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Delegate */ "./lib/WebAA/src/Delegate.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/EffectChain */ "./lib/WebAA/src/EffectChain.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Envelope */ "./lib/WebAA/src/Envelope.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Interaction */ "./lib/WebAA/src/Interaction.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Interfaces */ "./lib/WebAA/src/Interfaces.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Loading */ "./lib/WebAA/src/Loading.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/MonoSynth */ "./lib/WebAA/src/MonoSynth.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Music */ "./lib/WebAA/src/Music.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Send */ "./lib/WebAA/src/Send.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/Sound */ "./lib/WebAA/src/Sound.ts"), exports);
__exportStar(__webpack_require__(/*! ./src/SoundEffect */ "./lib/WebAA/src/SoundEffect.ts"), exports);


/***/ }),

/***/ "./lib/WebAA/src/AudioEffect.ts":
/*!**************************************!*\
  !*** ./lib/WebAA/src/AudioEffect.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioEffect = void 0;
/**
 * AudioEffect class wraps an AudioNode effect unit, adding dry/wet controls, and
 * pre-post gain for gain-staging.
 *
 * AudioNode Graph:
 *             /dry           \
 * inputGain <                 > outputGain -> target
 *             \wet -> effect /
 */
class AudioEffect {
    get effect() {
        return this.mEffect;
    }
    get input() {
        return this.mInput;
    }
    get output() {
        return this.mOutput;
    }
    // Direct access to dry gain
    get dry() {
        return this.mDry.gain;
    }
    // Direct access to wet gain
    get wet() {
        return this.mWet.gain;
    }
    get preGain() {
        return this.mInput;
    }
    get postGain() {
        return this.mOutput;
    }
    constructor(effect, target) {
        const context = effect.context;
        this.mEffect = effect;
        this.mDry = new GainNode(context);
        this.mDry.gain.value = 0;
        this.mWet = new GainNode(context);
        this.mWet.gain.value = 1;
        this.mInput = new GainNode(context);
        this.mOutput = new GainNode(context);
        this.mInput.connect(this.mDry);
        this.mInput.connect(this.mWet);
        this.mDry.connect(this.mOutput);
        this.mWet.connect(this.mEffect);
        this.mEffect.connect(this.mOutput);
        this.mOutput.connect(target || context.destination);
    }
    connect(audioNode) {
        this.disconnect();
        this.mOutput.connect(audioNode);
    }
    disconnect() {
        this.mOutput.disconnect();
    }
    // Balances wet and dry. Value of wet is set to percent, and dry is set to 1-percent
    setWetDry(percent, rampTime = 0) {
        percent = Math.min(Math.max(percent, 0), 1);
        if (rampTime > 0) {
            const time = this.mEffect.context.currentTime + rampTime;
            this.mDry.gain.linearRampToValueAtTime(1 - percent, time);
            this.mWet.gain.linearRampToValueAtTime(percent, time);
        }
        else {
            this.mDry.gain.value = 1 - percent;
            this.mWet.gain.value = percent;
        }
    }
    setWet(percent, rampTime = 0) {
        percent = Math.max(percent, 0);
        if (rampTime > 0)
            this.mWet.gain.linearRampToValueAtTime(percent, this.mEffect.context.currentTime + rampTime);
        else
            this.mWet.gain.value = percent;
    }
    setDry(percent, rampTime = 0) {
        percent = Math.max(percent, 0);
        if (rampTime > 0)
            this.mDry.gain.linearRampToValueAtTime(percent, this.mEffect.context.currentTime + rampTime);
        else
            this.mDry.gain.value = percent;
    }
    dispose() {
        this.mDry.disconnect();
        this.mWet.disconnect();
        this.mEffect.disconnect();
        this.mInput.disconnect();
        this.mOutput.disconnect();
        this.mDry = null;
        this.mWet = null;
        this.mEffect = null;
        this.mInput = null;
        this.mOutput = null;
    }
}
exports.AudioEffect = AudioEffect;


/***/ }),

/***/ "./lib/WebAA/src/AudioEngine.ts":
/*!**************************************!*\
  !*** ./lib/WebAA/src/AudioEngine.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AudioEngine = void 0;
const BusMgr_1 = __webpack_require__(/*! ./BusMgr */ "./lib/WebAA/src/BusMgr.ts");
const Interaction_1 = __webpack_require__(/*! ./Interaction */ "./lib/WebAA/src/Interaction.ts");
const MonoSynth_1 = __webpack_require__(/*! ./MonoSynth */ "./lib/WebAA/src/MonoSynth.ts");
const Music_1 = __webpack_require__(/*! ./Music */ "./lib/WebAA/src/Music.ts");
const SoundEffect_1 = __webpack_require__(/*! ./SoundEffect */ "./lib/WebAA/src/SoundEffect.ts");
class AudioEngine {
    get listener() { return this.mContext.listener; }
    get busses() { return this.mBusses; }
    get context() { return this.mContext; }
    constructor() {
        this.mContext = null;
        this.mBusses = null;
        this.mSounds = new Map;
        this.mMusic = new Map;
        this.mSynths = new Map;
    }
    getSound(url) {
        return this.mSounds.get(url) || null;
    }
    getMusic(url) {
        return this.mMusic.get(url) || null;
    }
    getSynth(name) {
        return this.mSynths.get(name) || null;
    }
    loadSound(url, busName) {
        let sound = this.mSounds.get(url);
        if (!sound) {
            let bus = busName ? this.mBusses.get(busName) : this.mBusses.master;
            if (!bus)
                bus = this.mBusses.master;
            sound = new SoundEffect_1.SoundEffect(this.context, bus.input);
            this.mSounds.set(url, sound);
            sound.load(url)
                .then(() => {
                return sound;
            })
                .catch(() => {
                return null;
            });
        }
        return sound;
    }
    loadMusic(url, busName) {
        let music = this.mMusic.get(url);
        if (!music) {
            let bus = busName ? this.mBusses.get(busName) : this.mBusses.master;
            if (!bus)
                bus = this.mBusses.master;
            music = new Music_1.Music(this.context, bus.input);
            this.mMusic.set(url, music);
            music.load(url);
        }
        return music;
    }
    loadSynth(name, busName = "master", opts) {
        let synth = this.mSynths.get(name);
        if (!synth) {
            let bus = this.mBusses.get(busName);
            synth = new MonoSynth_1.MonoSynth(this.context, bus.input, opts);
            this.mSynths.set(name, synth);
        }
        return synth;
    }
    wasInit() {
        return this.mContext !== null;
    }
    init() {
        let context = null;
        try {
            // @ts-ignore
            context = new (window.AudioContext || window.webkitAudioContext)();
        }
        catch (e) {
            console.error("AudioContext is not supported in this browser.");
            return false;
        }
        (0, Interaction_1.interactionWorkaround)(context);
        this.mBusses = new BusMgr_1.BusMgr(context);
        this.mContext = context;
        return true;
    }
    dispose() {
        this.mBusses.dispose();
        this.mMusic.forEach(music => music.dispose());
        this.mMusic.clear();
        this.mMusic = null;
        this.mSounds.forEach(sfx => sfx.dispose());
        this.mSounds.clear();
        this.mSounds = null;
        this.mContext = null;
    }
}
exports.AudioEngine = AudioEngine;


/***/ }),

/***/ "./lib/WebAA/src/Bus.ts":
/*!******************************!*\
  !*** ./lib/WebAA/src/Bus.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bus = void 0;
const EffectChain_1 = __webpack_require__(/*! ./EffectChain */ "./lib/WebAA/src/EffectChain.ts");
const SendMgr_1 = __webpack_require__(/*! ./SendMgr */ "./lib/WebAA/src/SendMgr.ts");
// Bus connection graph: -> [fx] -> panner-node -> post-gain
class Bus {
    // To connect a node to this bus, pass this to AudioNode#connect
    get input() { return this.mEffects.input; }
    get effects() { return this.mEffects; }
    get preGain() { return this.mEffects.preGain; }
    get postGain() { return this.mPostGain; }
    get panner() { return this.mPanner; }
    get sends() { return this.mSends; }
    constructor(context, target) {
        this.mPanner = context.createStereoPanner();
        this.mPostGain = context.createGain();
        this.mPanner.connect(this.mPostGain);
        this.mPostGain.connect(target || context.destination);
        this.mEffects = new EffectChain_1.EffectChain(context, this.mPanner);
        this.mSends = new SendMgr_1.SendMgr(context);
        this.mPostGain.connect(this.mSends.input);
    }
    /**
     * Connects the Bus to another target AudioNode
     * @param node node to connect
     */
    connect(node) {
        this.mPostGain.disconnect();
        this.mPostGain.connect(this.mSends.input);
        this.mPostGain.connect(node);
    }
    /**
     * Disconnects the Bus from its target AudioNode
     */
    disconnect() {
        this.mPostGain.disconnect();
        this.mPostGain.connect(this.mSends.input);
    }
    // Call to disconnect and remove all references of inner effects
    dispose() {
        this.mPanner.disconnect();
        this.mPostGain.disconnect();
        this.mEffects.dispose();
        this.mSends.dispose();
        this.mPanner = null;
        this.mPostGain = null;
        this.mEffects = null;
        this.mSends = null;
    }
}
exports.Bus = Bus;


/***/ }),

/***/ "./lib/WebAA/src/BusMgr.ts":
/*!*********************************!*\
  !*** ./lib/WebAA/src/BusMgr.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BusMgr = void 0;
// This file contains the class BusMgr, which manages a set of busses. By default a master bus
// is created, which by default is attached to the AudioContext#destination, unless otherwise
// specified. All busses created by this manager are attached to the master bus by default.
// Created busses are stored in the manager by key, and can be retrieved via BusMgr#get
const Bus_1 = __webpack_require__(/*! ./Bus */ "./lib/WebAA/src/Bus.ts");
class BusMgr {
    get context() { return this.mContext; }
    get master() { return this.mMasterBus; }
    /**
     * @param context - audio context
     * @param target - master bus will connect to this target
     */
    constructor(context, target) {
        this.mContext = context;
        this.mMasterBus = new Bus_1.Bus(context, target);
        this.mBusses = new Map;
        this.mBusses.set("master", this.mMasterBus);
    }
    /**
     * Creates a bus, and stores it in the AudioEngine. It can be retrieved via AudioEngine#getBus
     * @param key key to set and retrieve this new bus. It must be unique, otherwise no bus will be created.
     * @param target Target node to connect the bus to. Left unspecified, will set it to the
     * master bus.
     * @returns created audio bus, or null if the key was not unique.
     */
    create(key, target) {
        if (this.mBusses.has(key))
            return null;
        const newBus = new Bus_1.Bus(this.context, target || this.mMasterBus.input);
        this.mBusses.set(key, newBus);
        return newBus;
    }
    get(key) {
        const bus = this.mBusses.get(key);
        return bus ? bus : null;
    }
    remove(key) {
        const bus = this.mBusses.get(key);
        if (bus)
            bus;
        return this.mBusses.delete(key);
    }
    dispose() {
        this.mBusses.forEach(bus => bus.dispose());
        this.mBusses.clear();
        this.mBusses = null;
        this.mMasterBus = null;
    }
}
exports.BusMgr = BusMgr;


/***/ }),

/***/ "./lib/WebAA/src/Delegate.ts":
/*!***********************************!*\
  !*** ./lib/WebAA/src/Delegate.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Delegate = void 0;
/**
 * Class that stores and invokes callback. Similar to the subject in the Observer pattern.
 * Can store 'this' context, if needed, e.g. class function performed on an instance.
 */
class Delegate {
    constructor() {
        this.callbacks = [];
    }
    addListener(callback, context = null) {
        this.callbacks.push({ context, callback });
    }
    /**
     * Removes listener. Must be called with the same arguments called from Delegate.addListener.
     * @param callback Function to set
     * @param context 'this' context. (Arrow functions automatically capture 'this', and do not
     * need this parameter set.)
     */
    removeListener(callback, context = null) {
        for (let i = 0; i < this.callbacks.length; ++i) {
            if (Object.is(this.callbacks[i].callback, callback) &&
                (context ? Object.is(this.callbacks[i].context, context) : true)) {
                this.callbacks.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    invoke(...args) {
        for (let i = 0; i < this.callbacks.length; ++i) {
            if (this.callbacks[i].context)
                this.callbacks[i].callback.call(this.callbacks[i].context, ...args);
            else
                this.callbacks[i].callback(...args);
        }
    }
    get length() {
        return this.callbacks.length;
    }
    clear() {
        this.callbacks = [];
    }
}
exports.Delegate = Delegate;


/***/ }),

/***/ "./lib/WebAA/src/EffectChain.ts":
/*!**************************************!*\
  !*** ./lib/WebAA/src/EffectChain.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EffectChain = void 0;
const AudioEffect_1 = __webpack_require__(/*! ./AudioEffect */ "./lib/WebAA/src/AudioEffect.ts");
// Manages an array of audio FX chained together
class EffectChain {
    get input() {
        return this.mPreGain;
    }
    get output() {
        return this.mPostGain;
    }
    connect(newTarget) {
        this.output.disconnect();
        this.output.connect(newTarget);
    }
    get context() {
        return this.mPreGain.context;
    }
    get preGain() {
        return this.mPreGain;
    }
    get gain() {
        return this.mPostGain;
    }
    // the size of the effect chain not including preGain and target nodes.
    get length() {
        return this.mEffects.length;
    }
    /**
     *
     * @param context
     * @param target Target end-point to connect to. If no target is explicitly given,
     * it will be set to the context's destination output
     */
    constructor(context, target) {
        this.mContext = context;
        this.mPreGain = new GainNode(context);
        this.mPostGain = new GainNode(context);
        this.mPreGain.connect(this.mPostGain);
        this.mPostGain.connect(target || context.destination);
        this.mEffects = [];
    }
    // /**
    //  * Push an effect onto the
    //  * @param effectType
    //  * @param options
    //  */
    // push<T extends AudioEffect<any>>(effectType: new(p?: any) => T, options?: any): T {
    //     let newFX: T = (options) ? new effectType(options) : new effectType;
    //     return this.pushExisting(newFX);
    // }
    pushEffect(node) {
        // AudioNode wrapped and target set
        const newFx = new AudioEffect_1.AudioEffect(node, this.output);
        // connect last effect to the newFX
        const before = (this.mEffects.length === 0) ? this.input :
            this.mEffects[this.mEffects.length - 1].output;
        before.disconnect();
        before.connect(newFx.input);
        // done, commit changes
        this.mEffects.push(newFx);
        return newFx;
    }
    push(type, opts) {
        const node = opts ? new type(this.context, opts) : new type(this.context);
        return this.pushEffect(node);
    }
    insertEffect(node, idx = 0) {
        // wrap AudioNode
        const newFx = new AudioEffect_1.AudioEffect(node);
        // clamp index
        idx = (this.mEffects.length === 0) ? 0 :
            Math.min(Math.max(0, idx), this.mEffects.length - 1);
        // splice connections
        const before = idx === 0 ? this.input : this.mEffects[idx - 1].output;
        const after = idx >= this.mEffects.length - 1 ? this.output : this.mEffects[idx].input;
        before.disconnect();
        before.connect(newFx.input);
        newFx.connect(after);
        // done, commit changes
        this.mEffects.splice(idx, 0, newFx);
        return newFx;
    }
    insert(type, idx = 0, opts) {
        const node = (opts) ? new type(this.context, opts) : new type(this.context);
        return this.insertEffect(node, idx);
    }
    /**
     * Remove first occurrence of effect type from the FX chain.
     * @param effectType type of effect to remove.
     * @returns disconnected effect if one was found, or null if none found.
     */
    remove(effectType) {
        // visit effects to find one to remove
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i].effect instanceof effectType) { // found matching type!
                // reconnect nodes
                const effect = this.mEffects[i];
                const before = (i === 0) ? this.input : this.mEffects[i - 1].output;
                const after = (i === this.mEffects.length - 1) ? this.output : this.mEffects[i + 1].input;
                effect.dispose();
                before.disconnect();
                before.connect(after);
                // done, commit changes
                this.mEffects.splice(i, 1);
                return effect;
            }
        }
        // no effect removed
        return null;
    }
    // Get first effect of effectType. Returns null if none exists.
    // (Does not include preGain node or target end point)
    get(effectType) {
        return this.getNth(effectType, 1);
    }
    // Get all effects of effectType.
    getAllOf(effectType) {
        return this.mEffects.filter(fx => fx.effect instanceof effectType);
    }
    // Get the nth effect of effectType.
    getNth(effectType, n) {
        for (let i = 0; i < this.mEffects.length; ++i) {
            if (this.mEffects[i].effect instanceof effectType && --n <= 0)
                return this.mEffects[i];
        }
        return null;
    }
    dispose() {
        this.mPreGain.disconnect();
        this.mPostGain.disconnect();
        this.mEffects.forEach(effect => effect.dispose());
        this.mPostGain = null;
        this.mPreGain = null;
        this.mEffects = null;
    }
}
exports.EffectChain = EffectChain;


/***/ }),

/***/ "./lib/WebAA/src/Envelope.ts":
/*!***********************************!*\
  !*** ./lib/WebAA/src/Envelope.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Envelope = void 0;
// ADSHR Envelope
class Envelope {
    get attackTime() { return this.mAttackTime; }
    get attackLevel() { return this.mAttackLevel; }
    get decayTime() { return this.mDecayTime; }
    get sustainLevel() { return this.mSustainLevel; }
    get holdTime() { return this.mHoldTime; }
    get releaseTime() { return this.mReleaseTime; }
    set attackTime(value) { this.mAttackTime = Math.max(0, value); }
    set attackLevel(value) { this.mAttackLevel = Math.max(0, value); }
    set decayTime(value) { this.mDecayTime = Math.max(0, value); }
    set sustainLevel(value) { this.mSustainLevel = Math.max(0, value); }
    set holdTime(value) { this.mHoldTime = Math.max(0, value); }
    set releaseTime(value) { this.mReleaseTime = Math.max(0, value); }
    constructor(context, opts) {
        this.mContext = context;
        this.mTargets = [];
        if (opts)
            this.set(opts);
        else { // defaults
            this.mAttackTime = 0;
            this.mAttackLevel = 1;
            this.mDecayTime = .5;
            this.mSustainLevel = .25;
            this.mHoldTime = .25;
            this.mReleaseTime = .5;
        }
    }
    /**
     * Add a parameter to the envelope's targets.
     * @param param
     */
    addTarget(param) {
        this.mTargets.push(param);
    }
    /**
     * Remove a parameter from the envelope's targets
     * @param param
     */
    removeTarget(param) {
        for (let i = 0; i < this.mTargets.length; ++i) {
            if (Object.is(this.mTargets[i], param)) {
                this.mTargets.splice(i, 1);
                break;
            }
        }
    }
    /**
     * Set the envelope via an EnvelopeOptions object.
     * @param opts
     */
    set(opts) {
        var _a, _b, _c, _d, _e, _f;
        this.mAttackTime = (_a = opts.attackTime) !== null && _a !== void 0 ? _a : this.mAttackTime;
        this.mAttackLevel = (_b = opts.attackLevel) !== null && _b !== void 0 ? _b : this.mAttackLevel;
        this.mDecayTime = (_c = opts.decayTime) !== null && _c !== void 0 ? _c : this.mDecayTime;
        this.mSustainLevel = (_d = opts.sustainLevel) !== null && _d !== void 0 ? _d : this.mSustainLevel;
        this.mHoldTime = (_e = opts.holdTime) !== null && _e !== void 0 ? _e : this.mHoldTime;
        this.mReleaseTime = (_f = opts.releaseTime) !== null && _f !== void 0 ? _f : this.mReleaseTime;
    }
    /**
     * Triggers the envelope on all target parameters.
     * @param when - When to trigger/activate the envelope, relative to now, in seconds.
     */
    activate(when = 0) {
        // Grab timings
        // .02 extra seconds to give time for gain to snap back to zero without popping
        const currentTime = this.mContext.currentTime + when + .02;
        const startDecay = currentTime + this.mAttackTime;
        const startRelease = currentTime + this.mAttackTime + this.mDecayTime + this.mHoldTime;
        // Set envelope for each target param
        this.mTargets.forEach(param => {
            // init value
            param.cancelScheduledValues(currentTime);
            param.linearRampToValueAtTime(0, currentTime);
            // attack
            param.setTargetAtTime(this.mAttackLevel, currentTime, this.mAttackTime * .1);
            // decay
            param.setTargetAtTime(this.mSustainLevel, startDecay, this.mDecayTime * .1);
            // release
            param.setTargetAtTime(0, startRelease, this.mReleaseTime * .1);
        });
    }
    /**
     * Cancel effects of a triggered envelope (side effect: will also cancel any other scheduled
     * changes to the target parameters).
     * @param when - Time after which all events will be cancelled, relative to now in seconds.
     */
    cancel(when = 0) {
        this.mTargets.forEach(param => {
            param.cancelScheduledValues(this.mContext.currentTime + when);
        });
    }
}
exports.Envelope = Envelope;


/***/ }),

/***/ "./lib/WebAA/src/Interaction.ts":
/*!**************************************!*\
  !*** ./lib/WebAA/src/Interaction.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {


// This file contains a function `interactionWorkaround`, which automatically resumes an AudioContext
// when the user first interacts with the page ("pointerdown" event). This is necessary on many modern
// browsers, which requires this gesture from the user to protect them from unwanted annoying audio.
// It is automatically called by the AudioEngine, but is available for use without any dependency on it.
// Author: Aaron Ishibashi, a.ishibashi.music@gmail.com
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.interactionWorkaround = void 0;
const InteractionWorkaroundEventType = "pointerdown";
// On most major browsers, audio contexts must be resumed or created once the user interacts with the page.
// Sets proper listeners to resume the context if the context has been suspended due to this caveat.
function interactionWorkaround(context) {
    if (context.state === "running")
        return; // no need to execute if running properly
    window.addEventListener(InteractionWorkaroundEventType, callback);
    function callback() {
        context.resume()
            .then(() => {
            console.log("Resumed AudioContext.");
            window.removeEventListener(InteractionWorkaroundEventType, callback);
        })
            .catch(err => {
            console.log("Failed to resume AudioContext:", err);
        });
    }
}
exports.interactionWorkaround = interactionWorkaround;


/***/ }),

/***/ "./lib/WebAA/src/Interfaces.ts":
/*!*************************************!*\
  !*** ./lib/WebAA/src/Interfaces.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./lib/WebAA/src/Loading.ts":
/*!**********************************!*\
  !*** ./lib/WebAA/src/Loading.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadAudioBuffer = void 0;
function loadAudioBuffer(context, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        const buf = yield res.arrayBuffer();
        return context.decodeAudioData(buf);
    });
}
exports.loadAudioBuffer = loadAudioBuffer;


/***/ }),

/***/ "./lib/WebAA/src/MonoSynth.ts":
/*!************************************!*\
  !*** ./lib/WebAA/src/MonoSynth.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MonoSynth = void 0;
const Sound_1 = __webpack_require__(/*! ./Sound */ "./lib/WebAA/src/Sound.ts");
const Envelope_1 = __webpack_require__(/*! ./Envelope */ "./lib/WebAA/src/Envelope.ts");
// TODO: Create SynthVoice class which can make multiple voices easier.
class MonoSynth extends Sound_1.Sound {
    constructor(context, target, opts) {
        const node = opts ? new OscillatorNode(context, opts) :
            new OscillatorNode(context);
        super(context, node, target);
        this.envelope = new Envelope_1.Envelope(context);
        this.envelope.addTarget(this.gain);
        this.gain.value = 0;
        this.source.start(context.currentTime);
    }
    get type() { return this.source.type; }
    set type(type) {
        this.source.type = type;
    }
    get frequency() { return this.source.frequency; }
    /**
     * Synth does not need to be loaded!
     * @param url
     */
    load(url) {
        throw "Synth#load should not be called!";
    }
    play(when = 0) {
        this.envelope.activate(when);
        return this.source;
    }
    unload() {
        throw "Synth#unload should not be called!";
    }
}
exports.MonoSynth = MonoSynth;


/***/ }),

/***/ "./lib/WebAA/src/Music.ts":
/*!********************************!*\
  !*** ./lib/WebAA/src/Music.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Music = void 0;
const Sound_1 = __webpack_require__(/*! ./Sound */ "./lib/WebAA/src/Sound.ts");
// Class meant for longer sounds like music, ambience, etc.
// AudioNode graph: source -> gainNode
class Music extends Sound_1.Sound {
    constructor(context, target, url) {
        const source = new MediaElementAudioSourceNode(context, {
            mediaElement: url ? new Audio(url) : new Audio()
        });
        super(context, source, target);
    }
    load(url) {
        this.source.mediaElement.src = url;
        this.source.mediaElement.load();
        return true;
    }
    unload() {
        this.source.mediaElement.src = "";
    }
    play() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.source.mediaElement.play()
                .then(() => this.source)
                .catch(() => null);
        });
    }
    // Pauses audio and sets currentTime to 0
    stop() {
        this.source.mediaElement.pause();
        this.source.mediaElement.currentTime = 0;
    }
    setPause(pause) {
        if (pause)
            this.source.mediaElement.pause();
        else
            this.source.mediaElement.play();
    }
    get paused() {
        return this.source.mediaElement.paused;
    }
    dispose() {
        this.source.mediaElement.src = "";
        super.dispose();
    }
}
exports.Music = Music;


/***/ }),

/***/ "./lib/WebAA/src/Send.ts":
/*!*******************************!*\
  !*** ./lib/WebAA/src/Send.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {


// The Send class represents audio routing that clones its signal and sends it at varying levels to
// other audio inputs. These are usually sent to other buses or effects.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Send = void 0;
class Send {
    get gain() {
        return this.mNode.gain;
    }
    get input() {
        return this.mNode;
    }
    set target(value) {
        this.mTarget = value;
        this.mNode.disconnect();
        this.mNode.connect(value);
    }
    get target() {
        return this.mTarget;
    }
    get hasTarget() {
        return this.mTarget !== null;
    }
    constructor(context, target) {
        this.mNode = context.createGain();
        this.mTarget = target || null;
    }
    /**
     * Connect send to a target node
     * @param target
     */
    connect(target) {
        this.target = target;
    }
    /**
     * Disconnect send from current target
     */
    disconnect() {
        this.mNode.disconnect();
        this.mTarget = null;
    }
}
exports.Send = Send;


/***/ }),

/***/ "./lib/WebAA/src/SendMgr.ts":
/*!**********************************!*\
  !*** ./lib/WebAA/src/SendMgr.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SendMgr = void 0;
// The SendMgr manages a list of Sends, useful to broadcast input signals to other sources.
const Send_1 = __webpack_require__(/*! ./Send */ "./lib/WebAA/src/Send.ts");
class SendMgr {
    constructor(context) {
        this.mContext = context;
        this.mSends = [];
        this.mInput = new GainNode(context);
    }
    get input() { return this.mInput; }
    create(target) {
        const newSend = new Send_1.Send(this.mContext, target);
        this.mInput.connect(newSend.input);
        this.mSends.push(newSend);
        return newSend;
    }
    /**
     * Get a Send previously created on this send manager
     * @param idxOrTarget if index, it must be a value between 0 and SendMgr#length. If an AudioNode target,
     * it will return the first Send that is targeting the AudioNode. If none exists, null is returned.
     */
    get(idxOrTarget) {
        return (typeof idxOrTarget === "number") ?
            this.mSends[idxOrTarget] || null :
            this.mSends.find(send => Object.is(send.target, idxOrTarget)) || null;
    }
    /**
     * Remove a send belonging to this SendMgr, cached by the user.
     * @param send
     * @returns true: if send was successfully removed;
     * false: if it did not exist in the container.
     */
    remove(send) {
        for (let i = 0; i < this.mSends.length; ++i) {
            if (Object.is(this.mSends[i], send)) {
                this.cleanSend(send);
                this.mSends.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    /**
     * Remove all sends
     */
    removeAll() {
        this.mSends.forEach(send => this.cleanSend(send));
        this.mSends = [];
    }
    /**
     * Call when "destructing" the SendMgr
     */
    dispose() {
        this.removeAll();
    }
    /**
     * Get number of sends stored
     */
    get length() {
        return this.mSends.length;
    }
    /**
     * Removes all sends that have a specified target
     * @param target
     */
    removeIfTargeting(target) {
        let i = 0;
        while (i < this.mSends.length) {
            if (Object.is(this.mSends[i].target, target)) {
                this.cleanSend(this.mSends[i]);
                this.mSends.splice(i, 1);
            }
            else {
                ++i;
            }
        }
    }
    // Helper: cleans/removes all connections in an internal Send
    cleanSend(send) {
        send.disconnect();
        this.mInput.disconnect(send.input);
    }
}
exports.SendMgr = SendMgr;


/***/ }),

/***/ "./lib/WebAA/src/Sound.ts":
/*!********************************!*\
  !*** ./lib/WebAA/src/Sound.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sound = void 0;
const EffectChain_1 = __webpack_require__(/*! ./EffectChain */ "./lib/WebAA/src/EffectChain.ts");
class Sound {
    // Effect Chain
    get effects() { return this.mEffects; }
    // AudioContext
    get context() { return this.mEffects.context; }
    // The inner sound node
    get source() { return this.mSound; }
    // Shortcut to post-gain parameter
    get gain() { return this.mEffects.gain.gain; }
    constructor(context, soundNode, target) {
        this.mEffects = new EffectChain_1.EffectChain(context, target);
        this.mSound = soundNode;
        if (this.mSound) // some Sounds do not have an inner source object
            this.mSound.connect(this.mEffects.input);
    }
    dispose() {
        var _a;
        (_a = this.mSound) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.mSound = null;
        this.mEffects.dispose();
        this.mEffects = null;
    }
    connect(target) {
        this.mEffects.connect(target);
    }
}
exports.Sound = Sound;


/***/ }),

/***/ "./lib/WebAA/src/SoundEffect.ts":
/*!**************************************!*\
  !*** ./lib/WebAA/src/SoundEffect.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoundEffect = void 0;
// Class intended for short one-shot sound effects.
// If you need longer audio with more controls for music or ambience, please use the `Music` class.
const Delegate_1 = __webpack_require__(/*! ./Delegate */ "./lib/WebAA/src/Delegate.ts");
const Loading_1 = __webpack_require__(/*! ./Loading */ "./lib/WebAA/src/Loading.ts");
const Sound_1 = __webpack_require__(/*! ./Sound */ "./lib/WebAA/src/Sound.ts");
class SoundEffect extends Sound_1.Sound {
    constructor(context, target, url) {
        super(context, null, target);
        this.defaults = {
            buffer: null,
            loop: false,
            playbackRate: 1,
            detune: 0,
            loopStart: 0,
            loopEnd: 0
        };
        this.onended = new Delegate_1.Delegate;
        this.onendedHandler = this.onendedHandler.bind(this);
        if (url)
            this.load(url);
    }
    get isLoaded() { return this.defaults.buffer !== null; }
    set looping(value) { this.defaults.loop = value; }
    get looping() { return this.defaults.loop; }
    set loopStart(value) { this.defaults.loopStart = value; }
    set loopEnd(value) { this.defaults.loopEnd = value; }
    get loopStart() { return this.defaults.loopStart; }
    get loopEnd() { return this.defaults.loopEnd; }
    set playbackRate(value) { this.defaults.playbackRate = value; }
    get playbackRate() { return this.defaults.playbackRate; }
    set detune(value) { this.defaults.detune = value; }
    get detune() { return this.defaults.detune; }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, Loading_1.loadAudioBuffer)(this.context, url)
                .then(aBuf => {
                this.defaults.buffer = aBuf;
                return true;
            })
                .catch(err => {
                console.error(err);
                return false;
            });
        });
    }
    onendedHandler(evt) {
        this.onended.invoke(evt.target, this);
    }
    unload() { this.defaults.buffer = null; }
    /**
     * Fire and forget. Please do not call start on the returned AudioBufferSourceNode.
     * @param when when to start playing, in seconds, relative to now
     * @param offset where in the audio file to start playing, in seconds
     * @param duration how long to play the file, in seconds. If not specified, plays the whole file.
     */
    play(when = 0, offset = 0, duration) {
        const srcNode = (this.defaults) ?
            new AudioBufferSourceNode(this.context, this.defaults) :
            new AudioBufferSourceNode(this.context);
        srcNode.connect(this.effects.input);
        srcNode.onended = this.onendedHandler;
        if (duration === undefined)
            srcNode.start(this.context.currentTime + when, offset);
        else
            srcNode.start(this.context.currentTime + when, offset, duration);
        return srcNode;
    }
}
exports.SoundEffect = SoundEffect;


/***/ }),

/***/ "./src/pages/asset/edit/audio.ts":
/*!***************************************!*\
  !*** ./src/pages/asset/edit/audio.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// TODO: refactor this to use new AudioPlayer, same as frontend/src/pages/portfolio/assets
const WebAA_1 = __webpack_require__(/*! ../../../../lib/WebAA */ "./lib/WebAA/index.ts");
window.addEventListener("load", main);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const audio = new WebAA_1.AudioEngine();
        audio.init();
        const music = new WebAA_1.Music(audio.context, audio.busses.master.input);
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
                credits.removeChild(credits.children[credits.children.length - 1]);
        });
        const audioRegionBackgroundColor = "#ececec";
        const _URL = window.URL || window.webkitURL;
        const canvas = document.querySelector(".audio-player canvas");
        const canvasRect = canvas.getBoundingClientRect();
        canvas.width = canvasRect.width * 2;
        canvas.height = canvasRect.height * 2;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = audioRegionBackgroundColor;
        ctx.beginPath();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill();
        ctx.closePath();
        const coverUploadEl = document.getElementById("imageFile");
        const coverImageEl = document.getElementById("cover-image");
        if (coverUploadEl && coverImageEl) {
            coverUploadEl.addEventListener("change", evt => {
                const files = coverUploadEl.files;
                if (files === null || files === void 0 ? void 0 : files.length) {
                    let file;
                    if ((file = files.item(0))) {
                        const image = new Image();
                        const url = _URL.createObjectURL(file);
                        image.onload = function () {
                            coverImageEl.src = url;
                            _URL.revokeObjectURL(url);
                            image.onload = null;
                        };
                        image.src = url;
                    }
                }
            });
        }
        else {
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
        canvas.addEventListener("click", (evt) => __awaiter(this, void 0, void 0, function* () {
            const rect = canvas.getBoundingClientRect();
            const x = evt.clientX - rect.left;
            const y = evt.clientY - rect.top;
            const percent = x / rect.width;
            const el = music.source.mediaElement;
            if (el.duration > 0) {
                el.pause();
                el.currentTime = el.duration * percent;
                yield el.play();
                onMusicPlayPauseHandler();
            }
        }));
        function renderWaveform(arrayBuffer) {
            return __awaiter(this, void 0, void 0, function* () {
                const buffer = yield music.context.decodeAudioData(arrayBuffer);
                const lChan = buffer.getChannelData(0);
                const rChan = buffer.getChannelData(1);
                ctx.beginPath();
                ctx.fillStyle = audioRegionBackgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fill();
                const numSticks = 250;
                const width = canvas.width / numSticks;
                ctx.fillStyle = "gray";
                for (let i = 0; i < numSticks; i += 1) {
                    const idx = Math.floor(buffer.length / numSticks * i);
                    const cur = ((lChan[idx] + rChan[idx]) / 2.0);
                    const height = Math.min(Math.abs(cur) * canvas.height * 1.25, (canvas.height - 24) / 2);
                    const x = width * i;
                    const y = canvas.height / 2 - height;
                    ctx.fillRect(Math.floor(x), Math.floor(y), Math.max(Math.floor(width * .75), 1), Math.floor(height * 2));
                }
                ctx.fill();
                ctx.closePath();
                musicImage.src = canvas.toDataURL("image/png");
            });
        }
        // audio input setup
        const audioUploadEl = document.getElementById("audioFile");
        if (audioUploadEl) {
            audioUploadEl.addEventListener("change", (evt) => __awaiter(this, void 0, void 0, function* () {
                if (audioUploadEl.files) {
                    if (music.source.mediaElement.src)
                        _URL.revokeObjectURL(music.source.mediaElement.src);
                    let file = null;
                    if ((file = audioUploadEl.files.item(0))) {
                        const url = _URL.createObjectURL(file);
                        music.source.mediaElement.src = url;
                        yield renderWaveform(yield file.arrayBuffer());
                    }
                }
            }));
        }
        else {
            console.error("Could not find audioUploadEl!");
        }
        let interval = null;
        const playButtonEl = document.querySelector(".audio-player .play-button");
        if (playButtonEl) {
            playButtonEl.addEventListener("click", (evt) => __awaiter(this, void 0, void 0, function* () {
                if (music.source.mediaElement.duration > 0) {
                    if (music.paused) {
                        try {
                            yield music.play();
                        }
                        catch (err) {
                            console.error("Music failed to play");
                            return;
                        }
                        onMusicPlayPauseHandler();
                    }
                    else {
                        music.setPause(true);
                        onMusicPlayPauseHandler();
                    }
                }
            }));
        }
        else {
            console.error("Could not find playButtonEl!");
        }
        function onMusicPlayPauseHandler() {
            const el = music.source.mediaElement;
            const playBtn = playButtonEl.children[0];
            if (el.paused) {
                const playSrc = "/images/feather/play.svg";
                if (playBtn.src !== playSrc)
                    playBtn.src = playSrc;
                if (interval !== null) {
                    clearInterval(interval);
                    interval = null;
                }
            }
            else {
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
                        ctx.fillStyle = "rgba(17,42,197,0.59)";
                        ctx.fillRect(Math.round(xPosition), 0, 4, canvas.height);
                    }, 250);
                }
            }
        }
        const playerEl = document.querySelector(".audio-player");
        if (!playerEl) {
            console.error("audio player element could not be found!");
        }
        else {
            const musicSrc = playerEl.dataset.src;
            if (!music.load(musicSrc))
                console.error("Music failed to load");
            const response = yield fetch(musicSrc);
            const buffer = yield response.arrayBuffer();
            yield renderWaveform(buffer);
        }
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/pages/asset/edit/audio.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsZUFBZTtBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7OztVQ2hOQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9pbmRleC50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9BdWRpb0VmZmVjdC50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9BdWRpb0VuZ2luZS50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9CdXMudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvQnVzTWdyLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0RlbGVnYXRlLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0VmZmVjdENoYWluLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0VudmVsb3BlLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0ludGVyYWN0aW9uLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0ludGVyZmFjZXMudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvTG9hZGluZy50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9Nb25vU3ludGgudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvTXVzaWMudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvU2VuZC50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9TZW5kTWdyLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL1NvdW5kLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL1NvdW5kRWZmZWN0LnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9zcmMvcGFnZXMvYXNzZXQvZWRpdC9hdWRpby50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbi8vIFBsZWFzZSBtYWtlIHN1cmUgdG8gYWRkIGFsbCBuZXcgc291cmNlIGZpbGVzIHRvIHRoaXMgYmFycmVsIGZpbGVcbnZhciBfX2NyZWF0ZUJpbmRpbmcgPSAodGhpcyAmJiB0aGlzLl9fY3JlYXRlQmluZGluZykgfHwgKE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xuICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIGsyLCBkZXNjKTtcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICBvW2syXSA9IG1ba107XG59KSk7XG52YXIgX19leHBvcnRTdGFyID0gKHRoaXMgJiYgdGhpcy5fX2V4cG9ydFN0YXIpIHx8IGZ1bmN0aW9uKG0sIGV4cG9ydHMpIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGV4cG9ydHMsIHApKSBfX2NyZWF0ZUJpbmRpbmcoZXhwb3J0cywgbSwgcCk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9BdWRpb0VmZmVjdFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0F1ZGlvRW5naW5lXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvQnVzXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvQnVzTWdyXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvRGVsZWdhdGVcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9FZmZlY3RDaGFpblwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0VudmVsb3BlXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvSW50ZXJhY3Rpb25cIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9JbnRlcmZhY2VzXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvTG9hZGluZ1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL01vbm9TeW50aFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL011c2ljXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvU2VuZFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL1NvdW5kXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvU291bmRFZmZlY3RcIiksIGV4cG9ydHMpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkF1ZGlvRWZmZWN0ID0gdm9pZCAwO1xuLyoqXG4gKiBBdWRpb0VmZmVjdCBjbGFzcyB3cmFwcyBhbiBBdWRpb05vZGUgZWZmZWN0IHVuaXQsIGFkZGluZyBkcnkvd2V0IGNvbnRyb2xzLCBhbmRcbiAqIHByZS1wb3N0IGdhaW4gZm9yIGdhaW4tc3RhZ2luZy5cbiAqXG4gKiBBdWRpb05vZGUgR3JhcGg6XG4gKiAgICAgICAgICAgICAvZHJ5ICAgICAgICAgICBcXFxuICogaW5wdXRHYWluIDwgICAgICAgICAgICAgICAgID4gb3V0cHV0R2FpbiAtPiB0YXJnZXRcbiAqICAgICAgICAgICAgIFxcd2V0IC0+IGVmZmVjdCAvXG4gKi9cbmNsYXNzIEF1ZGlvRWZmZWN0IHtcbiAgICBnZXQgZWZmZWN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tRWZmZWN0O1xuICAgIH1cbiAgICBnZXQgaW5wdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1JbnB1dDtcbiAgICB9XG4gICAgZ2V0IG91dHB1dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubU91dHB1dDtcbiAgICB9XG4gICAgLy8gRGlyZWN0IGFjY2VzcyB0byBkcnkgZ2FpblxuICAgIGdldCBkcnkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1EcnkuZ2FpbjtcbiAgICB9XG4gICAgLy8gRGlyZWN0IGFjY2VzcyB0byB3ZXQgZ2FpblxuICAgIGdldCB3ZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1XZXQuZ2FpbjtcbiAgICB9XG4gICAgZ2V0IHByZUdhaW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1JbnB1dDtcbiAgICB9XG4gICAgZ2V0IHBvc3RHYWluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tT3V0cHV0O1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihlZmZlY3QsIHRhcmdldCkge1xuICAgICAgICBjb25zdCBjb250ZXh0ID0gZWZmZWN0LmNvbnRleHQ7XG4gICAgICAgIHRoaXMubUVmZmVjdCA9IGVmZmVjdDtcbiAgICAgICAgdGhpcy5tRHJ5ID0gbmV3IEdhaW5Ob2RlKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1EcnkuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgIHRoaXMubVdldCA9IG5ldyBHYWluTm9kZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tV2V0LmdhaW4udmFsdWUgPSAxO1xuICAgICAgICB0aGlzLm1JbnB1dCA9IG5ldyBHYWluTm9kZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tT3V0cHV0ID0gbmV3IEdhaW5Ob2RlKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1JbnB1dC5jb25uZWN0KHRoaXMubURyeSk7XG4gICAgICAgIHRoaXMubUlucHV0LmNvbm5lY3QodGhpcy5tV2V0KTtcbiAgICAgICAgdGhpcy5tRHJ5LmNvbm5lY3QodGhpcy5tT3V0cHV0KTtcbiAgICAgICAgdGhpcy5tV2V0LmNvbm5lY3QodGhpcy5tRWZmZWN0KTtcbiAgICAgICAgdGhpcy5tRWZmZWN0LmNvbm5lY3QodGhpcy5tT3V0cHV0KTtcbiAgICAgICAgdGhpcy5tT3V0cHV0LmNvbm5lY3QodGFyZ2V0IHx8IGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIH1cbiAgICBjb25uZWN0KGF1ZGlvTm9kZSkge1xuICAgICAgICB0aGlzLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tT3V0cHV0LmNvbm5lY3QoYXVkaW9Ob2RlKTtcbiAgICB9XG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5tT3V0cHV0LmRpc2Nvbm5lY3QoKTtcbiAgICB9XG4gICAgLy8gQmFsYW5jZXMgd2V0IGFuZCBkcnkuIFZhbHVlIG9mIHdldCBpcyBzZXQgdG8gcGVyY2VudCwgYW5kIGRyeSBpcyBzZXQgdG8gMS1wZXJjZW50XG4gICAgc2V0V2V0RHJ5KHBlcmNlbnQsIHJhbXBUaW1lID0gMCkge1xuICAgICAgICBwZXJjZW50ID0gTWF0aC5taW4oTWF0aC5tYXgocGVyY2VudCwgMCksIDEpO1xuICAgICAgICBpZiAocmFtcFRpbWUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB0aW1lID0gdGhpcy5tRWZmZWN0LmNvbnRleHQuY3VycmVudFRpbWUgKyByYW1wVGltZTtcbiAgICAgICAgICAgIHRoaXMubURyeS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEgLSBwZXJjZW50LCB0aW1lKTtcbiAgICAgICAgICAgIHRoaXMubVdldC5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHBlcmNlbnQsIHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5tRHJ5LmdhaW4udmFsdWUgPSAxIC0gcGVyY2VudDtcbiAgICAgICAgICAgIHRoaXMubVdldC5nYWluLnZhbHVlID0gcGVyY2VudDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzZXRXZXQocGVyY2VudCwgcmFtcFRpbWUgPSAwKSB7XG4gICAgICAgIHBlcmNlbnQgPSBNYXRoLm1heChwZXJjZW50LCAwKTtcbiAgICAgICAgaWYgKHJhbXBUaW1lID4gMClcbiAgICAgICAgICAgIHRoaXMubVdldC5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHBlcmNlbnQsIHRoaXMubUVmZmVjdC5jb250ZXh0LmN1cnJlbnRUaW1lICsgcmFtcFRpbWUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLm1XZXQuZ2Fpbi52YWx1ZSA9IHBlcmNlbnQ7XG4gICAgfVxuICAgIHNldERyeShwZXJjZW50LCByYW1wVGltZSA9IDApIHtcbiAgICAgICAgcGVyY2VudCA9IE1hdGgubWF4KHBlcmNlbnQsIDApO1xuICAgICAgICBpZiAocmFtcFRpbWUgPiAwKVxuICAgICAgICAgICAgdGhpcy5tRHJ5LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUocGVyY2VudCwgdGhpcy5tRWZmZWN0LmNvbnRleHQuY3VycmVudFRpbWUgKyByYW1wVGltZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMubURyeS5nYWluLnZhbHVlID0gcGVyY2VudDtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tRHJ5LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tV2V0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tSW5wdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1PdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1EcnkgPSBudWxsO1xuICAgICAgICB0aGlzLm1XZXQgPSBudWxsO1xuICAgICAgICB0aGlzLm1FZmZlY3QgPSBudWxsO1xuICAgICAgICB0aGlzLm1JbnB1dCA9IG51bGw7XG4gICAgICAgIHRoaXMubU91dHB1dCA9IG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5BdWRpb0VmZmVjdCA9IEF1ZGlvRWZmZWN0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkF1ZGlvRW5naW5lID0gdm9pZCAwO1xuY29uc3QgQnVzTWdyXzEgPSByZXF1aXJlKFwiLi9CdXNNZ3JcIik7XG5jb25zdCBJbnRlcmFjdGlvbl8xID0gcmVxdWlyZShcIi4vSW50ZXJhY3Rpb25cIik7XG5jb25zdCBNb25vU3ludGhfMSA9IHJlcXVpcmUoXCIuL01vbm9TeW50aFwiKTtcbmNvbnN0IE11c2ljXzEgPSByZXF1aXJlKFwiLi9NdXNpY1wiKTtcbmNvbnN0IFNvdW5kRWZmZWN0XzEgPSByZXF1aXJlKFwiLi9Tb3VuZEVmZmVjdFwiKTtcbmNsYXNzIEF1ZGlvRW5naW5lIHtcbiAgICBnZXQgbGlzdGVuZXIoKSB7IHJldHVybiB0aGlzLm1Db250ZXh0Lmxpc3RlbmVyOyB9XG4gICAgZ2V0IGJ1c3NlcygpIHsgcmV0dXJuIHRoaXMubUJ1c3NlczsgfVxuICAgIGdldCBjb250ZXh0KCkgeyByZXR1cm4gdGhpcy5tQ29udGV4dDsgfVxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5tQnVzc2VzID0gbnVsbDtcbiAgICAgICAgdGhpcy5tU291bmRzID0gbmV3IE1hcDtcbiAgICAgICAgdGhpcy5tTXVzaWMgPSBuZXcgTWFwO1xuICAgICAgICB0aGlzLm1TeW50aHMgPSBuZXcgTWFwO1xuICAgIH1cbiAgICBnZXRTb3VuZCh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubVNvdW5kcy5nZXQodXJsKSB8fCBudWxsO1xuICAgIH1cbiAgICBnZXRNdXNpYyh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubU11c2ljLmdldCh1cmwpIHx8IG51bGw7XG4gICAgfVxuICAgIGdldFN5bnRoKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubVN5bnRocy5nZXQobmFtZSkgfHwgbnVsbDtcbiAgICB9XG4gICAgbG9hZFNvdW5kKHVybCwgYnVzTmFtZSkge1xuICAgICAgICBsZXQgc291bmQgPSB0aGlzLm1Tb3VuZHMuZ2V0KHVybCk7XG4gICAgICAgIGlmICghc291bmQpIHtcbiAgICAgICAgICAgIGxldCBidXMgPSBidXNOYW1lID8gdGhpcy5tQnVzc2VzLmdldChidXNOYW1lKSA6IHRoaXMubUJ1c3Nlcy5tYXN0ZXI7XG4gICAgICAgICAgICBpZiAoIWJ1cylcbiAgICAgICAgICAgICAgICBidXMgPSB0aGlzLm1CdXNzZXMubWFzdGVyO1xuICAgICAgICAgICAgc291bmQgPSBuZXcgU291bmRFZmZlY3RfMS5Tb3VuZEVmZmVjdCh0aGlzLmNvbnRleHQsIGJ1cy5pbnB1dCk7XG4gICAgICAgICAgICB0aGlzLm1Tb3VuZHMuc2V0KHVybCwgc291bmQpO1xuICAgICAgICAgICAgc291bmQubG9hZCh1cmwpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBzb3VuZDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3VuZDtcbiAgICB9XG4gICAgbG9hZE11c2ljKHVybCwgYnVzTmFtZSkge1xuICAgICAgICBsZXQgbXVzaWMgPSB0aGlzLm1NdXNpYy5nZXQodXJsKTtcbiAgICAgICAgaWYgKCFtdXNpYykge1xuICAgICAgICAgICAgbGV0IGJ1cyA9IGJ1c05hbWUgPyB0aGlzLm1CdXNzZXMuZ2V0KGJ1c05hbWUpIDogdGhpcy5tQnVzc2VzLm1hc3RlcjtcbiAgICAgICAgICAgIGlmICghYnVzKVxuICAgICAgICAgICAgICAgIGJ1cyA9IHRoaXMubUJ1c3Nlcy5tYXN0ZXI7XG4gICAgICAgICAgICBtdXNpYyA9IG5ldyBNdXNpY18xLk11c2ljKHRoaXMuY29udGV4dCwgYnVzLmlucHV0KTtcbiAgICAgICAgICAgIHRoaXMubU11c2ljLnNldCh1cmwsIG11c2ljKTtcbiAgICAgICAgICAgIG11c2ljLmxvYWQodXJsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbXVzaWM7XG4gICAgfVxuICAgIGxvYWRTeW50aChuYW1lLCBidXNOYW1lID0gXCJtYXN0ZXJcIiwgb3B0cykge1xuICAgICAgICBsZXQgc3ludGggPSB0aGlzLm1TeW50aHMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoIXN5bnRoKSB7XG4gICAgICAgICAgICBsZXQgYnVzID0gdGhpcy5tQnVzc2VzLmdldChidXNOYW1lKTtcbiAgICAgICAgICAgIHN5bnRoID0gbmV3IE1vbm9TeW50aF8xLk1vbm9TeW50aCh0aGlzLmNvbnRleHQsIGJ1cy5pbnB1dCwgb3B0cyk7XG4gICAgICAgICAgICB0aGlzLm1TeW50aHMuc2V0KG5hbWUsIHN5bnRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3ludGg7XG4gICAgfVxuICAgIHdhc0luaXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1Db250ZXh0ICE9PSBudWxsO1xuICAgIH1cbiAgICBpbml0KCkge1xuICAgICAgICBsZXQgY29udGV4dCA9IG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb250ZXh0ID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKCk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJBdWRpb0NvbnRleHQgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXIuXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgICgwLCBJbnRlcmFjdGlvbl8xLmludGVyYWN0aW9uV29ya2Fyb3VuZCkoY29udGV4dCk7XG4gICAgICAgIHRoaXMubUJ1c3NlcyA9IG5ldyBCdXNNZ3JfMS5CdXNNZ3IoY29udGV4dCk7XG4gICAgICAgIHRoaXMubUNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tQnVzc2VzLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5tTXVzaWMuZm9yRWFjaChtdXNpYyA9PiBtdXNpYy5kaXNwb3NlKCkpO1xuICAgICAgICB0aGlzLm1NdXNpYy5jbGVhcigpO1xuICAgICAgICB0aGlzLm1NdXNpYyA9IG51bGw7XG4gICAgICAgIHRoaXMubVNvdW5kcy5mb3JFYWNoKHNmeCA9PiBzZnguZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5tU291bmRzLmNsZWFyKCk7XG4gICAgICAgIHRoaXMubVNvdW5kcyA9IG51bGw7XG4gICAgICAgIHRoaXMubUNvbnRleHQgPSBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9FbmdpbmUgPSBBdWRpb0VuZ2luZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5CdXMgPSB2b2lkIDA7XG5jb25zdCBFZmZlY3RDaGFpbl8xID0gcmVxdWlyZShcIi4vRWZmZWN0Q2hhaW5cIik7XG5jb25zdCBTZW5kTWdyXzEgPSByZXF1aXJlKFwiLi9TZW5kTWdyXCIpO1xuLy8gQnVzIGNvbm5lY3Rpb24gZ3JhcGg6IC0+IFtmeF0gLT4gcGFubmVyLW5vZGUgLT4gcG9zdC1nYWluXG5jbGFzcyBCdXMge1xuICAgIC8vIFRvIGNvbm5lY3QgYSBub2RlIHRvIHRoaXMgYnVzLCBwYXNzIHRoaXMgdG8gQXVkaW9Ob2RlI2Nvbm5lY3RcbiAgICBnZXQgaW5wdXQoKSB7IHJldHVybiB0aGlzLm1FZmZlY3RzLmlucHV0OyB9XG4gICAgZ2V0IGVmZmVjdHMoKSB7IHJldHVybiB0aGlzLm1FZmZlY3RzOyB9XG4gICAgZ2V0IHByZUdhaW4oKSB7IHJldHVybiB0aGlzLm1FZmZlY3RzLnByZUdhaW47IH1cbiAgICBnZXQgcG9zdEdhaW4oKSB7IHJldHVybiB0aGlzLm1Qb3N0R2FpbjsgfVxuICAgIGdldCBwYW5uZXIoKSB7IHJldHVybiB0aGlzLm1QYW5uZXI7IH1cbiAgICBnZXQgc2VuZHMoKSB7IHJldHVybiB0aGlzLm1TZW5kczsgfVxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCkge1xuICAgICAgICB0aGlzLm1QYW5uZXIgPSBjb250ZXh0LmNyZWF0ZVN0ZXJlb1Bhbm5lcigpO1xuICAgICAgICB0aGlzLm1Qb3N0R2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLm1QYW5uZXIuY29ubmVjdCh0aGlzLm1Qb3N0R2Fpbik7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmNvbm5lY3QodGFyZ2V0IHx8IGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgICB0aGlzLm1FZmZlY3RzID0gbmV3IEVmZmVjdENoYWluXzEuRWZmZWN0Q2hhaW4oY29udGV4dCwgdGhpcy5tUGFubmVyKTtcbiAgICAgICAgdGhpcy5tU2VuZHMgPSBuZXcgU2VuZE1ncl8xLlNlbmRNZ3IoY29udGV4dCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmNvbm5lY3QodGhpcy5tU2VuZHMuaW5wdXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0cyB0aGUgQnVzIHRvIGFub3RoZXIgdGFyZ2V0IEF1ZGlvTm9kZVxuICAgICAqIEBwYXJhbSBub2RlIG5vZGUgdG8gY29ubmVjdFxuICAgICAqL1xuICAgIGNvbm5lY3Qobm9kZSkge1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmNvbm5lY3QodGhpcy5tU2VuZHMuaW5wdXQpO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KG5vZGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEaXNjb25uZWN0cyB0aGUgQnVzIGZyb20gaXRzIHRhcmdldCBBdWRpb05vZGVcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmNvbm5lY3QodGhpcy5tU2VuZHMuaW5wdXQpO1xuICAgIH1cbiAgICAvLyBDYWxsIHRvIGRpc2Nvbm5lY3QgYW5kIHJlbW92ZSBhbGwgcmVmZXJlbmNlcyBvZiBpbm5lciBlZmZlY3RzXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tUGFubmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1FZmZlY3RzLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5tU2VuZHMuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLm1QYW5uZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1Qb3N0R2FpbiA9IG51bGw7XG4gICAgICAgIHRoaXMubUVmZmVjdHMgPSBudWxsO1xuICAgICAgICB0aGlzLm1TZW5kcyA9IG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5CdXMgPSBCdXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQnVzTWdyID0gdm9pZCAwO1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBjbGFzcyBCdXNNZ3IsIHdoaWNoIG1hbmFnZXMgYSBzZXQgb2YgYnVzc2VzLiBCeSBkZWZhdWx0IGEgbWFzdGVyIGJ1c1xuLy8gaXMgY3JlYXRlZCwgd2hpY2ggYnkgZGVmYXVsdCBpcyBhdHRhY2hlZCB0byB0aGUgQXVkaW9Db250ZXh0I2Rlc3RpbmF0aW9uLCB1bmxlc3Mgb3RoZXJ3aXNlXG4vLyBzcGVjaWZpZWQuIEFsbCBidXNzZXMgY3JlYXRlZCBieSB0aGlzIG1hbmFnZXIgYXJlIGF0dGFjaGVkIHRvIHRoZSBtYXN0ZXIgYnVzIGJ5IGRlZmF1bHQuXG4vLyBDcmVhdGVkIGJ1c3NlcyBhcmUgc3RvcmVkIGluIHRoZSBtYW5hZ2VyIGJ5IGtleSwgYW5kIGNhbiBiZSByZXRyaWV2ZWQgdmlhIEJ1c01nciNnZXRcbmNvbnN0IEJ1c18xID0gcmVxdWlyZShcIi4vQnVzXCIpO1xuY2xhc3MgQnVzTWdyIHtcbiAgICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMubUNvbnRleHQ7IH1cbiAgICBnZXQgbWFzdGVyKCkgeyByZXR1cm4gdGhpcy5tTWFzdGVyQnVzOyB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIGNvbnRleHQgLSBhdWRpbyBjb250ZXh0XG4gICAgICogQHBhcmFtIHRhcmdldCAtIG1hc3RlciBidXMgd2lsbCBjb25uZWN0IHRvIHRoaXMgdGFyZ2V0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgdGFyZ2V0KSB7XG4gICAgICAgIHRoaXMubUNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLm1NYXN0ZXJCdXMgPSBuZXcgQnVzXzEuQnVzKGNvbnRleHQsIHRhcmdldCk7XG4gICAgICAgIHRoaXMubUJ1c3NlcyA9IG5ldyBNYXA7XG4gICAgICAgIHRoaXMubUJ1c3Nlcy5zZXQoXCJtYXN0ZXJcIiwgdGhpcy5tTWFzdGVyQnVzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJ1cywgYW5kIHN0b3JlcyBpdCBpbiB0aGUgQXVkaW9FbmdpbmUuIEl0IGNhbiBiZSByZXRyaWV2ZWQgdmlhIEF1ZGlvRW5naW5lI2dldEJ1c1xuICAgICAqIEBwYXJhbSBrZXkga2V5IHRvIHNldCBhbmQgcmV0cmlldmUgdGhpcyBuZXcgYnVzLiBJdCBtdXN0IGJlIHVuaXF1ZSwgb3RoZXJ3aXNlIG5vIGJ1cyB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHRhcmdldCBUYXJnZXQgbm9kZSB0byBjb25uZWN0IHRoZSBidXMgdG8uIExlZnQgdW5zcGVjaWZpZWQsIHdpbGwgc2V0IGl0IHRvIHRoZVxuICAgICAqIG1hc3RlciBidXMuXG4gICAgICogQHJldHVybnMgY3JlYXRlZCBhdWRpbyBidXMsIG9yIG51bGwgaWYgdGhlIGtleSB3YXMgbm90IHVuaXF1ZS5cbiAgICAgKi9cbiAgICBjcmVhdGUoa2V5LCB0YXJnZXQpIHtcbiAgICAgICAgaWYgKHRoaXMubUJ1c3Nlcy5oYXMoa2V5KSlcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBuZXdCdXMgPSBuZXcgQnVzXzEuQnVzKHRoaXMuY29udGV4dCwgdGFyZ2V0IHx8IHRoaXMubU1hc3RlckJ1cy5pbnB1dCk7XG4gICAgICAgIHRoaXMubUJ1c3Nlcy5zZXQoa2V5LCBuZXdCdXMpO1xuICAgICAgICByZXR1cm4gbmV3QnVzO1xuICAgIH1cbiAgICBnZXQoa2V5KSB7XG4gICAgICAgIGNvbnN0IGJ1cyA9IHRoaXMubUJ1c3Nlcy5nZXQoa2V5KTtcbiAgICAgICAgcmV0dXJuIGJ1cyA/IGJ1cyA6IG51bGw7XG4gICAgfVxuICAgIHJlbW92ZShrZXkpIHtcbiAgICAgICAgY29uc3QgYnVzID0gdGhpcy5tQnVzc2VzLmdldChrZXkpO1xuICAgICAgICBpZiAoYnVzKVxuICAgICAgICAgICAgYnVzO1xuICAgICAgICByZXR1cm4gdGhpcy5tQnVzc2VzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLm1CdXNzZXMuZm9yRWFjaChidXMgPT4gYnVzLmRpc3Bvc2UoKSk7XG4gICAgICAgIHRoaXMubUJ1c3Nlcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm1CdXNzZXMgPSBudWxsO1xuICAgICAgICB0aGlzLm1NYXN0ZXJCdXMgPSBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuQnVzTWdyID0gQnVzTWdyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkRlbGVnYXRlID0gdm9pZCAwO1xuLyoqXG4gKiBDbGFzcyB0aGF0IHN0b3JlcyBhbmQgaW52b2tlcyBjYWxsYmFjay4gU2ltaWxhciB0byB0aGUgc3ViamVjdCBpbiB0aGUgT2JzZXJ2ZXIgcGF0dGVybi5cbiAqIENhbiBzdG9yZSAndGhpcycgY29udGV4dCwgaWYgbmVlZGVkLCBlLmcuIGNsYXNzIGZ1bmN0aW9uIHBlcmZvcm1lZCBvbiBhbiBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgRGVsZWdhdGUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIH1cbiAgICBhZGRMaXN0ZW5lcihjYWxsYmFjaywgY29udGV4dCA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MucHVzaCh7IGNvbnRleHQsIGNhbGxiYWNrIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGxpc3RlbmVyLiBNdXN0IGJlIGNhbGxlZCB3aXRoIHRoZSBzYW1lIGFyZ3VtZW50cyBjYWxsZWQgZnJvbSBEZWxlZ2F0ZS5hZGRMaXN0ZW5lci5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gc2V0XG4gICAgICogQHBhcmFtIGNvbnRleHQgJ3RoaXMnIGNvbnRleHQuIChBcnJvdyBmdW5jdGlvbnMgYXV0b21hdGljYWxseSBjYXB0dXJlICd0aGlzJywgYW5kIGRvIG5vdFxuICAgICAqIG5lZWQgdGhpcyBwYXJhbWV0ZXIgc2V0LilcbiAgICAgKi9cbiAgICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaywgY29udGV4dCA9IG51bGwpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5pcyh0aGlzLmNhbGxiYWNrc1tpXS5jYWxsYmFjaywgY2FsbGJhY2spICYmXG4gICAgICAgICAgICAgICAgKGNvbnRleHQgPyBPYmplY3QuaXModGhpcy5jYWxsYmFja3NbaV0uY29udGV4dCwgY29udGV4dCkgOiB0cnVlKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGludm9rZSguLi5hcmdzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYWxsYmFja3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbGxiYWNrc1tpXS5jb250ZXh0KVxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW2ldLmNhbGxiYWNrLmNhbGwodGhpcy5jYWxsYmFja3NbaV0uY29udGV4dCwgLi4uYXJncyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja3NbaV0uY2FsbGJhY2soLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGJhY2tzLmxlbmd0aDtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzID0gW107XG4gICAgfVxufVxuZXhwb3J0cy5EZWxlZ2F0ZSA9IERlbGVnYXRlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkVmZmVjdENoYWluID0gdm9pZCAwO1xuY29uc3QgQXVkaW9FZmZlY3RfMSA9IHJlcXVpcmUoXCIuL0F1ZGlvRWZmZWN0XCIpO1xuLy8gTWFuYWdlcyBhbiBhcnJheSBvZiBhdWRpbyBGWCBjaGFpbmVkIHRvZ2V0aGVyXG5jbGFzcyBFZmZlY3RDaGFpbiB7XG4gICAgZ2V0IGlucHV0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tUHJlR2FpbjtcbiAgICB9XG4gICAgZ2V0IG91dHB1dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubVBvc3RHYWluO1xuICAgIH1cbiAgICBjb25uZWN0KG5ld1RhcmdldCkge1xuICAgICAgICB0aGlzLm91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMub3V0cHV0LmNvbm5lY3QobmV3VGFyZ2V0KTtcbiAgICB9XG4gICAgZ2V0IGNvbnRleHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1QcmVHYWluLmNvbnRleHQ7XG4gICAgfVxuICAgIGdldCBwcmVHYWluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tUHJlR2FpbjtcbiAgICB9XG4gICAgZ2V0IGdhaW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1Qb3N0R2FpbjtcbiAgICB9XG4gICAgLy8gdGhlIHNpemUgb2YgdGhlIGVmZmVjdCBjaGFpbiBub3QgaW5jbHVkaW5nIHByZUdhaW4gYW5kIHRhcmdldCBub2Rlcy5cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tRWZmZWN0cy5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRleHRcbiAgICAgKiBAcGFyYW0gdGFyZ2V0IFRhcmdldCBlbmQtcG9pbnQgdG8gY29ubmVjdCB0by4gSWYgbm8gdGFyZ2V0IGlzIGV4cGxpY2l0bHkgZ2l2ZW4sXG4gICAgICogaXQgd2lsbCBiZSBzZXQgdG8gdGhlIGNvbnRleHQncyBkZXN0aW5hdGlvbiBvdXRwdXRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0LCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5tQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMubVByZUdhaW4gPSBuZXcgR2Fpbk5vZGUoY29udGV4dCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluID0gbmV3IEdhaW5Ob2RlKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1QcmVHYWluLmNvbm5lY3QodGhpcy5tUG9zdEdhaW4pO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KHRhcmdldCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0cyA9IFtdO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBQdXNoIGFuIGVmZmVjdCBvbnRvIHRoZVxuICAgIC8vICAqIEBwYXJhbSBlZmZlY3RUeXBlXG4gICAgLy8gICogQHBhcmFtIG9wdGlvbnNcbiAgICAvLyAgKi9cbiAgICAvLyBwdXNoPFQgZXh0ZW5kcyBBdWRpb0VmZmVjdDxhbnk+PihlZmZlY3RUeXBlOiBuZXcocD86IGFueSkgPT4gVCwgb3B0aW9ucz86IGFueSk6IFQge1xuICAgIC8vICAgICBsZXQgbmV3Rlg6IFQgPSAob3B0aW9ucykgPyBuZXcgZWZmZWN0VHlwZShvcHRpb25zKSA6IG5ldyBlZmZlY3RUeXBlO1xuICAgIC8vICAgICByZXR1cm4gdGhpcy5wdXNoRXhpc3RpbmcobmV3RlgpO1xuICAgIC8vIH1cbiAgICBwdXNoRWZmZWN0KG5vZGUpIHtcbiAgICAgICAgLy8gQXVkaW9Ob2RlIHdyYXBwZWQgYW5kIHRhcmdldCBzZXRcbiAgICAgICAgY29uc3QgbmV3RnggPSBuZXcgQXVkaW9FZmZlY3RfMS5BdWRpb0VmZmVjdChub2RlLCB0aGlzLm91dHB1dCk7XG4gICAgICAgIC8vIGNvbm5lY3QgbGFzdCBlZmZlY3QgdG8gdGhlIG5ld0ZYXG4gICAgICAgIGNvbnN0IGJlZm9yZSA9ICh0aGlzLm1FZmZlY3RzLmxlbmd0aCA9PT0gMCkgPyB0aGlzLmlucHV0IDpcbiAgICAgICAgICAgIHRoaXMubUVmZmVjdHNbdGhpcy5tRWZmZWN0cy5sZW5ndGggLSAxXS5vdXRwdXQ7XG4gICAgICAgIGJlZm9yZS5kaXNjb25uZWN0KCk7XG4gICAgICAgIGJlZm9yZS5jb25uZWN0KG5ld0Z4LmlucHV0KTtcbiAgICAgICAgLy8gZG9uZSwgY29tbWl0IGNoYW5nZXNcbiAgICAgICAgdGhpcy5tRWZmZWN0cy5wdXNoKG5ld0Z4KTtcbiAgICAgICAgcmV0dXJuIG5ld0Z4O1xuICAgIH1cbiAgICBwdXNoKHR5cGUsIG9wdHMpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG9wdHMgPyBuZXcgdHlwZSh0aGlzLmNvbnRleHQsIG9wdHMpIDogbmV3IHR5cGUodGhpcy5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaEVmZmVjdChub2RlKTtcbiAgICB9XG4gICAgaW5zZXJ0RWZmZWN0KG5vZGUsIGlkeCA9IDApIHtcbiAgICAgICAgLy8gd3JhcCBBdWRpb05vZGVcbiAgICAgICAgY29uc3QgbmV3RnggPSBuZXcgQXVkaW9FZmZlY3RfMS5BdWRpb0VmZmVjdChub2RlKTtcbiAgICAgICAgLy8gY2xhbXAgaW5kZXhcbiAgICAgICAgaWR4ID0gKHRoaXMubUVmZmVjdHMubGVuZ3RoID09PSAwKSA/IDAgOlxuICAgICAgICAgICAgTWF0aC5taW4oTWF0aC5tYXgoMCwgaWR4KSwgdGhpcy5tRWZmZWN0cy5sZW5ndGggLSAxKTtcbiAgICAgICAgLy8gc3BsaWNlIGNvbm5lY3Rpb25zXG4gICAgICAgIGNvbnN0IGJlZm9yZSA9IGlkeCA9PT0gMCA/IHRoaXMuaW5wdXQgOiB0aGlzLm1FZmZlY3RzW2lkeCAtIDFdLm91dHB1dDtcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSBpZHggPj0gdGhpcy5tRWZmZWN0cy5sZW5ndGggLSAxID8gdGhpcy5vdXRwdXQgOiB0aGlzLm1FZmZlY3RzW2lkeF0uaW5wdXQ7XG4gICAgICAgIGJlZm9yZS5kaXNjb25uZWN0KCk7XG4gICAgICAgIGJlZm9yZS5jb25uZWN0KG5ld0Z4LmlucHV0KTtcbiAgICAgICAgbmV3RnguY29ubmVjdChhZnRlcik7XG4gICAgICAgIC8vIGRvbmUsIGNvbW1pdCBjaGFuZ2VzXG4gICAgICAgIHRoaXMubUVmZmVjdHMuc3BsaWNlKGlkeCwgMCwgbmV3RngpO1xuICAgICAgICByZXR1cm4gbmV3Rng7XG4gICAgfVxuICAgIGluc2VydCh0eXBlLCBpZHggPSAwLCBvcHRzKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSAob3B0cykgPyBuZXcgdHlwZSh0aGlzLmNvbnRleHQsIG9wdHMpIDogbmV3IHR5cGUodGhpcy5jb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0RWZmZWN0KG5vZGUsIGlkeCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGVmZmVjdCB0eXBlIGZyb20gdGhlIEZYIGNoYWluLlxuICAgICAqIEBwYXJhbSBlZmZlY3RUeXBlIHR5cGUgb2YgZWZmZWN0IHRvIHJlbW92ZS5cbiAgICAgKiBAcmV0dXJucyBkaXNjb25uZWN0ZWQgZWZmZWN0IGlmIG9uZSB3YXMgZm91bmQsIG9yIG51bGwgaWYgbm9uZSBmb3VuZC5cbiAgICAgKi9cbiAgICByZW1vdmUoZWZmZWN0VHlwZSkge1xuICAgICAgICAvLyB2aXNpdCBlZmZlY3RzIHRvIGZpbmQgb25lIHRvIHJlbW92ZVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubUVmZmVjdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1FZmZlY3RzW2ldLmVmZmVjdCBpbnN0YW5jZW9mIGVmZmVjdFR5cGUpIHsgLy8gZm91bmQgbWF0Y2hpbmcgdHlwZSFcbiAgICAgICAgICAgICAgICAvLyByZWNvbm5lY3Qgbm9kZXNcbiAgICAgICAgICAgICAgICBjb25zdCBlZmZlY3QgPSB0aGlzLm1FZmZlY3RzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJlZm9yZSA9IChpID09PSAwKSA/IHRoaXMuaW5wdXQgOiB0aGlzLm1FZmZlY3RzW2kgLSAxXS5vdXRwdXQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYWZ0ZXIgPSAoaSA9PT0gdGhpcy5tRWZmZWN0cy5sZW5ndGggLSAxKSA/IHRoaXMub3V0cHV0IDogdGhpcy5tRWZmZWN0c1tpICsgMV0uaW5wdXQ7XG4gICAgICAgICAgICAgICAgZWZmZWN0LmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgICBiZWZvcmUuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgICAgIGJlZm9yZS5jb25uZWN0KGFmdGVyKTtcbiAgICAgICAgICAgICAgICAvLyBkb25lLCBjb21taXQgY2hhbmdlc1xuICAgICAgICAgICAgICAgIHRoaXMubUVmZmVjdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlZmZlY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gbm8gZWZmZWN0IHJlbW92ZWRcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIC8vIEdldCBmaXJzdCBlZmZlY3Qgb2YgZWZmZWN0VHlwZS4gUmV0dXJucyBudWxsIGlmIG5vbmUgZXhpc3RzLlxuICAgIC8vIChEb2VzIG5vdCBpbmNsdWRlIHByZUdhaW4gbm9kZSBvciB0YXJnZXQgZW5kIHBvaW50KVxuICAgIGdldChlZmZlY3RUeXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE50aChlZmZlY3RUeXBlLCAxKTtcbiAgICB9XG4gICAgLy8gR2V0IGFsbCBlZmZlY3RzIG9mIGVmZmVjdFR5cGUuXG4gICAgZ2V0QWxsT2YoZWZmZWN0VHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tRWZmZWN0cy5maWx0ZXIoZnggPT4gZnguZWZmZWN0IGluc3RhbmNlb2YgZWZmZWN0VHlwZSk7XG4gICAgfVxuICAgIC8vIEdldCB0aGUgbnRoIGVmZmVjdCBvZiBlZmZlY3RUeXBlLlxuICAgIGdldE50aChlZmZlY3RUeXBlLCBuKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tRWZmZWN0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKHRoaXMubUVmZmVjdHNbaV0uZWZmZWN0IGluc3RhbmNlb2YgZWZmZWN0VHlwZSAmJiAtLW4gPD0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5tRWZmZWN0c1tpXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tUHJlR2Fpbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0cy5mb3JFYWNoKGVmZmVjdCA9PiBlZmZlY3QuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4gPSBudWxsO1xuICAgICAgICB0aGlzLm1QcmVHYWluID0gbnVsbDtcbiAgICAgICAgdGhpcy5tRWZmZWN0cyA9IG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5FZmZlY3RDaGFpbiA9IEVmZmVjdENoYWluO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkVudmVsb3BlID0gdm9pZCAwO1xuLy8gQURTSFIgRW52ZWxvcGVcbmNsYXNzIEVudmVsb3BlIHtcbiAgICBnZXQgYXR0YWNrVGltZSgpIHsgcmV0dXJuIHRoaXMubUF0dGFja1RpbWU7IH1cbiAgICBnZXQgYXR0YWNrTGV2ZWwoKSB7IHJldHVybiB0aGlzLm1BdHRhY2tMZXZlbDsgfVxuICAgIGdldCBkZWNheVRpbWUoKSB7IHJldHVybiB0aGlzLm1EZWNheVRpbWU7IH1cbiAgICBnZXQgc3VzdGFpbkxldmVsKCkgeyByZXR1cm4gdGhpcy5tU3VzdGFpbkxldmVsOyB9XG4gICAgZ2V0IGhvbGRUaW1lKCkgeyByZXR1cm4gdGhpcy5tSG9sZFRpbWU7IH1cbiAgICBnZXQgcmVsZWFzZVRpbWUoKSB7IHJldHVybiB0aGlzLm1SZWxlYXNlVGltZTsgfVxuICAgIHNldCBhdHRhY2tUaW1lKHZhbHVlKSB7IHRoaXMubUF0dGFja1RpbWUgPSBNYXRoLm1heCgwLCB2YWx1ZSk7IH1cbiAgICBzZXQgYXR0YWNrTGV2ZWwodmFsdWUpIHsgdGhpcy5tQXR0YWNrTGV2ZWwgPSBNYXRoLm1heCgwLCB2YWx1ZSk7IH1cbiAgICBzZXQgZGVjYXlUaW1lKHZhbHVlKSB7IHRoaXMubURlY2F5VGltZSA9IE1hdGgubWF4KDAsIHZhbHVlKTsgfVxuICAgIHNldCBzdXN0YWluTGV2ZWwodmFsdWUpIHsgdGhpcy5tU3VzdGFpbkxldmVsID0gTWF0aC5tYXgoMCwgdmFsdWUpOyB9XG4gICAgc2V0IGhvbGRUaW1lKHZhbHVlKSB7IHRoaXMubUhvbGRUaW1lID0gTWF0aC5tYXgoMCwgdmFsdWUpOyB9XG4gICAgc2V0IHJlbGVhc2VUaW1lKHZhbHVlKSB7IHRoaXMubVJlbGVhc2VUaW1lID0gTWF0aC5tYXgoMCwgdmFsdWUpOyB9XG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgb3B0cykge1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5tVGFyZ2V0cyA9IFtdO1xuICAgICAgICBpZiAob3B0cylcbiAgICAgICAgICAgIHRoaXMuc2V0KG9wdHMpO1xuICAgICAgICBlbHNlIHsgLy8gZGVmYXVsdHNcbiAgICAgICAgICAgIHRoaXMubUF0dGFja1RpbWUgPSAwO1xuICAgICAgICAgICAgdGhpcy5tQXR0YWNrTGV2ZWwgPSAxO1xuICAgICAgICAgICAgdGhpcy5tRGVjYXlUaW1lID0gLjU7XG4gICAgICAgICAgICB0aGlzLm1TdXN0YWluTGV2ZWwgPSAuMjU7XG4gICAgICAgICAgICB0aGlzLm1Ib2xkVGltZSA9IC4yNTtcbiAgICAgICAgICAgIHRoaXMubVJlbGVhc2VUaW1lID0gLjU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGEgcGFyYW1ldGVyIHRvIHRoZSBlbnZlbG9wZSdzIHRhcmdldHMuXG4gICAgICogQHBhcmFtIHBhcmFtXG4gICAgICovXG4gICAgYWRkVGFyZ2V0KHBhcmFtKSB7XG4gICAgICAgIHRoaXMubVRhcmdldHMucHVzaChwYXJhbSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHBhcmFtZXRlciBmcm9tIHRoZSBlbnZlbG9wZSdzIHRhcmdldHNcbiAgICAgKiBAcGFyYW0gcGFyYW1cbiAgICAgKi9cbiAgICByZW1vdmVUYXJnZXQocGFyYW0pIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1UYXJnZXRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmlzKHRoaXMubVRhcmdldHNbaV0sIHBhcmFtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMubVRhcmdldHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgZW52ZWxvcGUgdmlhIGFuIEVudmVsb3BlT3B0aW9ucyBvYmplY3QuXG4gICAgICogQHBhcmFtIG9wdHNcbiAgICAgKi9cbiAgICBzZXQob3B0cykge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZjtcbiAgICAgICAgdGhpcy5tQXR0YWNrVGltZSA9IChfYSA9IG9wdHMuYXR0YWNrVGltZSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogdGhpcy5tQXR0YWNrVGltZTtcbiAgICAgICAgdGhpcy5tQXR0YWNrTGV2ZWwgPSAoX2IgPSBvcHRzLmF0dGFja0xldmVsKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiB0aGlzLm1BdHRhY2tMZXZlbDtcbiAgICAgICAgdGhpcy5tRGVjYXlUaW1lID0gKF9jID0gb3B0cy5kZWNheVRpbWUpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IHRoaXMubURlY2F5VGltZTtcbiAgICAgICAgdGhpcy5tU3VzdGFpbkxldmVsID0gKF9kID0gb3B0cy5zdXN0YWluTGV2ZWwpICE9PSBudWxsICYmIF9kICE9PSB2b2lkIDAgPyBfZCA6IHRoaXMubVN1c3RhaW5MZXZlbDtcbiAgICAgICAgdGhpcy5tSG9sZFRpbWUgPSAoX2UgPSBvcHRzLmhvbGRUaW1lKSAhPT0gbnVsbCAmJiBfZSAhPT0gdm9pZCAwID8gX2UgOiB0aGlzLm1Ib2xkVGltZTtcbiAgICAgICAgdGhpcy5tUmVsZWFzZVRpbWUgPSAoX2YgPSBvcHRzLnJlbGVhc2VUaW1lKSAhPT0gbnVsbCAmJiBfZiAhPT0gdm9pZCAwID8gX2YgOiB0aGlzLm1SZWxlYXNlVGltZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJpZ2dlcnMgdGhlIGVudmVsb3BlIG9uIGFsbCB0YXJnZXQgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0gd2hlbiAtIFdoZW4gdG8gdHJpZ2dlci9hY3RpdmF0ZSB0aGUgZW52ZWxvcGUsIHJlbGF0aXZlIHRvIG5vdywgaW4gc2Vjb25kcy5cbiAgICAgKi9cbiAgICBhY3RpdmF0ZSh3aGVuID0gMCkge1xuICAgICAgICAvLyBHcmFiIHRpbWluZ3NcbiAgICAgICAgLy8gLjAyIGV4dHJhIHNlY29uZHMgdG8gZ2l2ZSB0aW1lIGZvciBnYWluIHRvIHNuYXAgYmFjayB0byB6ZXJvIHdpdGhvdXQgcG9wcGluZ1xuICAgICAgICBjb25zdCBjdXJyZW50VGltZSA9IHRoaXMubUNvbnRleHQuY3VycmVudFRpbWUgKyB3aGVuICsgLjAyO1xuICAgICAgICBjb25zdCBzdGFydERlY2F5ID0gY3VycmVudFRpbWUgKyB0aGlzLm1BdHRhY2tUaW1lO1xuICAgICAgICBjb25zdCBzdGFydFJlbGVhc2UgPSBjdXJyZW50VGltZSArIHRoaXMubUF0dGFja1RpbWUgKyB0aGlzLm1EZWNheVRpbWUgKyB0aGlzLm1Ib2xkVGltZTtcbiAgICAgICAgLy8gU2V0IGVudmVsb3BlIGZvciBlYWNoIHRhcmdldCBwYXJhbVxuICAgICAgICB0aGlzLm1UYXJnZXRzLmZvckVhY2gocGFyYW0gPT4ge1xuICAgICAgICAgICAgLy8gaW5pdCB2YWx1ZVxuICAgICAgICAgICAgcGFyYW0uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIHBhcmFtLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIC8vIGF0dGFja1xuICAgICAgICAgICAgcGFyYW0uc2V0VGFyZ2V0QXRUaW1lKHRoaXMubUF0dGFja0xldmVsLCBjdXJyZW50VGltZSwgdGhpcy5tQXR0YWNrVGltZSAqIC4xKTtcbiAgICAgICAgICAgIC8vIGRlY2F5XG4gICAgICAgICAgICBwYXJhbS5zZXRUYXJnZXRBdFRpbWUodGhpcy5tU3VzdGFpbkxldmVsLCBzdGFydERlY2F5LCB0aGlzLm1EZWNheVRpbWUgKiAuMSk7XG4gICAgICAgICAgICAvLyByZWxlYXNlXG4gICAgICAgICAgICBwYXJhbS5zZXRUYXJnZXRBdFRpbWUoMCwgc3RhcnRSZWxlYXNlLCB0aGlzLm1SZWxlYXNlVGltZSAqIC4xKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbmNlbCBlZmZlY3RzIG9mIGEgdHJpZ2dlcmVkIGVudmVsb3BlIChzaWRlIGVmZmVjdDogd2lsbCBhbHNvIGNhbmNlbCBhbnkgb3RoZXIgc2NoZWR1bGVkXG4gICAgICogY2hhbmdlcyB0byB0aGUgdGFyZ2V0IHBhcmFtZXRlcnMpLlxuICAgICAqIEBwYXJhbSB3aGVuIC0gVGltZSBhZnRlciB3aGljaCBhbGwgZXZlbnRzIHdpbGwgYmUgY2FuY2VsbGVkLCByZWxhdGl2ZSB0byBub3cgaW4gc2Vjb25kcy5cbiAgICAgKi9cbiAgICBjYW5jZWwod2hlbiA9IDApIHtcbiAgICAgICAgdGhpcy5tVGFyZ2V0cy5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgICAgICAgIHBhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyh0aGlzLm1Db250ZXh0LmN1cnJlbnRUaW1lICsgd2hlbik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuRW52ZWxvcGUgPSBFbnZlbG9wZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuLy8gVGhpcyBmaWxlIGNvbnRhaW5zIGEgZnVuY3Rpb24gYGludGVyYWN0aW9uV29ya2Fyb3VuZGAsIHdoaWNoIGF1dG9tYXRpY2FsbHkgcmVzdW1lcyBhbiBBdWRpb0NvbnRleHRcbi8vIHdoZW4gdGhlIHVzZXIgZmlyc3QgaW50ZXJhY3RzIHdpdGggdGhlIHBhZ2UgKFwicG9pbnRlcmRvd25cIiBldmVudCkuIFRoaXMgaXMgbmVjZXNzYXJ5IG9uIG1hbnkgbW9kZXJuXG4vLyBicm93c2Vycywgd2hpY2ggcmVxdWlyZXMgdGhpcyBnZXN0dXJlIGZyb20gdGhlIHVzZXIgdG8gcHJvdGVjdCB0aGVtIGZyb20gdW53YW50ZWQgYW5ub3lpbmcgYXVkaW8uXG4vLyBJdCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSB0aGUgQXVkaW9FbmdpbmUsIGJ1dCBpcyBhdmFpbGFibGUgZm9yIHVzZSB3aXRob3V0IGFueSBkZXBlbmRlbmN5IG9uIGl0LlxuLy8gQXV0aG9yOiBBYXJvbiBJc2hpYmFzaGksIGEuaXNoaWJhc2hpLm11c2ljQGdtYWlsLmNvbVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5pbnRlcmFjdGlvbldvcmthcm91bmQgPSB2b2lkIDA7XG5jb25zdCBJbnRlcmFjdGlvbldvcmthcm91bmRFdmVudFR5cGUgPSBcInBvaW50ZXJkb3duXCI7XG4vLyBPbiBtb3N0IG1ham9yIGJyb3dzZXJzLCBhdWRpbyBjb250ZXh0cyBtdXN0IGJlIHJlc3VtZWQgb3IgY3JlYXRlZCBvbmNlIHRoZSB1c2VyIGludGVyYWN0cyB3aXRoIHRoZSBwYWdlLlxuLy8gU2V0cyBwcm9wZXIgbGlzdGVuZXJzIHRvIHJlc3VtZSB0aGUgY29udGV4dCBpZiB0aGUgY29udGV4dCBoYXMgYmVlbiBzdXNwZW5kZWQgZHVlIHRvIHRoaXMgY2F2ZWF0LlxuZnVuY3Rpb24gaW50ZXJhY3Rpb25Xb3JrYXJvdW5kKGNvbnRleHQpIHtcbiAgICBpZiAoY29udGV4dC5zdGF0ZSA9PT0gXCJydW5uaW5nXCIpXG4gICAgICAgIHJldHVybjsgLy8gbm8gbmVlZCB0byBleGVjdXRlIGlmIHJ1bm5pbmcgcHJvcGVybHlcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihJbnRlcmFjdGlvbldvcmthcm91bmRFdmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICBmdW5jdGlvbiBjYWxsYmFjaygpIHtcbiAgICAgICAgY29udGV4dC5yZXN1bWUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJSZXN1bWVkIEF1ZGlvQ29udGV4dC5cIik7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihJbnRlcmFjdGlvbldvcmthcm91bmRFdmVudFR5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGYWlsZWQgdG8gcmVzdW1lIEF1ZGlvQ29udGV4dDpcIiwgZXJyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5pbnRlcmFjdGlvbldvcmthcm91bmQgPSBpbnRlcmFjdGlvbldvcmthcm91bmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmxvYWRBdWRpb0J1ZmZlciA9IHZvaWQgMDtcbmZ1bmN0aW9uIGxvYWRBdWRpb0J1ZmZlcihjb250ZXh0LCB1cmwpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICBjb25zdCByZXMgPSB5aWVsZCBmZXRjaCh1cmwpO1xuICAgICAgICBjb25zdCBidWYgPSB5aWVsZCByZXMuYXJyYXlCdWZmZXIoKTtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKGJ1Zik7XG4gICAgfSk7XG59XG5leHBvcnRzLmxvYWRBdWRpb0J1ZmZlciA9IGxvYWRBdWRpb0J1ZmZlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Nb25vU3ludGggPSB2b2lkIDA7XG5jb25zdCBTb3VuZF8xID0gcmVxdWlyZShcIi4vU291bmRcIik7XG5jb25zdCBFbnZlbG9wZV8xID0gcmVxdWlyZShcIi4vRW52ZWxvcGVcIik7XG4vLyBUT0RPOiBDcmVhdGUgU3ludGhWb2ljZSBjbGFzcyB3aGljaCBjYW4gbWFrZSBtdWx0aXBsZSB2b2ljZXMgZWFzaWVyLlxuY2xhc3MgTW9ub1N5bnRoIGV4dGVuZHMgU291bmRfMS5Tb3VuZCB7XG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgdGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBvcHRzID8gbmV3IE9zY2lsbGF0b3JOb2RlKGNvbnRleHQsIG9wdHMpIDpcbiAgICAgICAgICAgIG5ldyBPc2NpbGxhdG9yTm9kZShjb250ZXh0KTtcbiAgICAgICAgc3VwZXIoY29udGV4dCwgbm9kZSwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5lbnZlbG9wZSA9IG5ldyBFbnZlbG9wZV8xLkVudmVsb3BlKGNvbnRleHQpO1xuICAgICAgICB0aGlzLmVudmVsb3BlLmFkZFRhcmdldCh0aGlzLmdhaW4pO1xuICAgICAgICB0aGlzLmdhaW4udmFsdWUgPSAwO1xuICAgICAgICB0aGlzLnNvdXJjZS5zdGFydChjb250ZXh0LmN1cnJlbnRUaW1lKTtcbiAgICB9XG4gICAgZ2V0IHR5cGUoKSB7IHJldHVybiB0aGlzLnNvdXJjZS50eXBlOyB9XG4gICAgc2V0IHR5cGUodHlwZSkge1xuICAgICAgICB0aGlzLnNvdXJjZS50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgZ2V0IGZyZXF1ZW5jeSgpIHsgcmV0dXJuIHRoaXMuc291cmNlLmZyZXF1ZW5jeTsgfVxuICAgIC8qKlxuICAgICAqIFN5bnRoIGRvZXMgbm90IG5lZWQgdG8gYmUgbG9hZGVkIVxuICAgICAqIEBwYXJhbSB1cmxcbiAgICAgKi9cbiAgICBsb2FkKHVybCkge1xuICAgICAgICB0aHJvdyBcIlN5bnRoI2xvYWQgc2hvdWxkIG5vdCBiZSBjYWxsZWQhXCI7XG4gICAgfVxuICAgIHBsYXkod2hlbiA9IDApIHtcbiAgICAgICAgdGhpcy5lbnZlbG9wZS5hY3RpdmF0ZSh3aGVuKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlO1xuICAgIH1cbiAgICB1bmxvYWQoKSB7XG4gICAgICAgIHRocm93IFwiU3ludGgjdW5sb2FkIHNob3VsZCBub3QgYmUgY2FsbGVkIVwiO1xuICAgIH1cbn1cbmV4cG9ydHMuTW9ub1N5bnRoID0gTW9ub1N5bnRoO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTXVzaWMgPSB2b2lkIDA7XG5jb25zdCBTb3VuZF8xID0gcmVxdWlyZShcIi4vU291bmRcIik7XG4vLyBDbGFzcyBtZWFudCBmb3IgbG9uZ2VyIHNvdW5kcyBsaWtlIG11c2ljLCBhbWJpZW5jZSwgZXRjLlxuLy8gQXVkaW9Ob2RlIGdyYXBoOiBzb3VyY2UgLT4gZ2Fpbk5vZGVcbmNsYXNzIE11c2ljIGV4dGVuZHMgU291bmRfMS5Tb3VuZCB7XG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgdGFyZ2V0LCB1cmwpIHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gbmV3IE1lZGlhRWxlbWVudEF1ZGlvU291cmNlTm9kZShjb250ZXh0LCB7XG4gICAgICAgICAgICBtZWRpYUVsZW1lbnQ6IHVybCA/IG5ldyBBdWRpbyh1cmwpIDogbmV3IEF1ZGlvKClcbiAgICAgICAgfSk7XG4gICAgICAgIHN1cGVyKGNvbnRleHQsIHNvdXJjZSwgdGFyZ2V0KTtcbiAgICB9XG4gICAgbG9hZCh1cmwpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnNyYyA9IHVybDtcbiAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LmxvYWQoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHVubG9hZCgpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnNyYyA9IFwiXCI7XG4gICAgfVxuICAgIHBsYXkoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnBsYXkoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuc291cmNlKVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFBhdXNlcyBhdWRpbyBhbmQgc2V0cyBjdXJyZW50VGltZSB0byAwXG4gICAgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnBhdXNlKCk7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5jdXJyZW50VGltZSA9IDA7XG4gICAgfVxuICAgIHNldFBhdXNlKHBhdXNlKSB7XG4gICAgICAgIGlmIChwYXVzZSlcbiAgICAgICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5wYXVzZSgpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5tZWRpYUVsZW1lbnQucGxheSgpO1xuICAgIH1cbiAgICBnZXQgcGF1c2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnBhdXNlZDtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnNyYyA9IFwiXCI7XG4gICAgICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgICB9XG59XG5leHBvcnRzLk11c2ljID0gTXVzaWM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIFRoZSBTZW5kIGNsYXNzIHJlcHJlc2VudHMgYXVkaW8gcm91dGluZyB0aGF0IGNsb25lcyBpdHMgc2lnbmFsIGFuZCBzZW5kcyBpdCBhdCB2YXJ5aW5nIGxldmVscyB0b1xuLy8gb3RoZXIgYXVkaW8gaW5wdXRzLiBUaGVzZSBhcmUgdXN1YWxseSBzZW50IHRvIG90aGVyIGJ1c2VzIG9yIGVmZmVjdHMuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlbmQgPSB2b2lkIDA7XG5jbGFzcyBTZW5kIHtcbiAgICBnZXQgZ2FpbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubU5vZGUuZ2FpbjtcbiAgICB9XG4gICAgZ2V0IGlucHV0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tTm9kZTtcbiAgICB9XG4gICAgc2V0IHRhcmdldCh2YWx1ZSkge1xuICAgICAgICB0aGlzLm1UYXJnZXQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5tTm9kZS5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubU5vZGUuY29ubmVjdCh2YWx1ZSk7XG4gICAgfVxuICAgIGdldCB0YXJnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1UYXJnZXQ7XG4gICAgfVxuICAgIGdldCBoYXNUYXJnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1UYXJnZXQgIT09IG51bGw7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCkge1xuICAgICAgICB0aGlzLm1Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHRoaXMubVRhcmdldCA9IHRhcmdldCB8fCBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb25uZWN0IHNlbmQgdG8gYSB0YXJnZXQgbm9kZVxuICAgICAqIEBwYXJhbSB0YXJnZXRcbiAgICAgKi9cbiAgICBjb25uZWN0KHRhcmdldCkge1xuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzY29ubmVjdCBzZW5kIGZyb20gY3VycmVudCB0YXJnZXRcbiAgICAgKi9cbiAgICBkaXNjb25uZWN0KCkge1xuICAgICAgICB0aGlzLm1Ob2RlLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tVGFyZ2V0ID0gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLlNlbmQgPSBTZW5kO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNlbmRNZ3IgPSB2b2lkIDA7XG4vLyBUaGUgU2VuZE1nciBtYW5hZ2VzIGEgbGlzdCBvZiBTZW5kcywgdXNlZnVsIHRvIGJyb2FkY2FzdCBpbnB1dCBzaWduYWxzIHRvIG90aGVyIHNvdXJjZXMuXG5jb25zdCBTZW5kXzEgPSByZXF1aXJlKFwiLi9TZW5kXCIpO1xuY2xhc3MgU2VuZE1nciB7XG4gICAgY29uc3RydWN0b3IoY29udGV4dCkge1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5tU2VuZHMgPSBbXTtcbiAgICAgICAgdGhpcy5tSW5wdXQgPSBuZXcgR2Fpbk5vZGUoY29udGV4dCk7XG4gICAgfVxuICAgIGdldCBpbnB1dCgpIHsgcmV0dXJuIHRoaXMubUlucHV0OyB9XG4gICAgY3JlYXRlKHRhcmdldCkge1xuICAgICAgICBjb25zdCBuZXdTZW5kID0gbmV3IFNlbmRfMS5TZW5kKHRoaXMubUNvbnRleHQsIHRhcmdldCk7XG4gICAgICAgIHRoaXMubUlucHV0LmNvbm5lY3QobmV3U2VuZC5pbnB1dCk7XG4gICAgICAgIHRoaXMubVNlbmRzLnB1c2gobmV3U2VuZCk7XG4gICAgICAgIHJldHVybiBuZXdTZW5kO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgYSBTZW5kIHByZXZpb3VzbHkgY3JlYXRlZCBvbiB0aGlzIHNlbmQgbWFuYWdlclxuICAgICAqIEBwYXJhbSBpZHhPclRhcmdldCBpZiBpbmRleCwgaXQgbXVzdCBiZSBhIHZhbHVlIGJldHdlZW4gMCBhbmQgU2VuZE1nciNsZW5ndGguIElmIGFuIEF1ZGlvTm9kZSB0YXJnZXQsXG4gICAgICogaXQgd2lsbCByZXR1cm4gdGhlIGZpcnN0IFNlbmQgdGhhdCBpcyB0YXJnZXRpbmcgdGhlIEF1ZGlvTm9kZS4gSWYgbm9uZSBleGlzdHMsIG51bGwgaXMgcmV0dXJuZWQuXG4gICAgICovXG4gICAgZ2V0KGlkeE9yVGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiAodHlwZW9mIGlkeE9yVGFyZ2V0ID09PSBcIm51bWJlclwiKSA/XG4gICAgICAgICAgICB0aGlzLm1TZW5kc1tpZHhPclRhcmdldF0gfHwgbnVsbCA6XG4gICAgICAgICAgICB0aGlzLm1TZW5kcy5maW5kKHNlbmQgPT4gT2JqZWN0LmlzKHNlbmQudGFyZ2V0LCBpZHhPclRhcmdldCkpIHx8IG51bGw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIHNlbmQgYmVsb25naW5nIHRvIHRoaXMgU2VuZE1nciwgY2FjaGVkIGJ5IHRoZSB1c2VyLlxuICAgICAqIEBwYXJhbSBzZW5kXG4gICAgICogQHJldHVybnMgdHJ1ZTogaWYgc2VuZCB3YXMgc3VjY2Vzc2Z1bGx5IHJlbW92ZWQ7XG4gICAgICogZmFsc2U6IGlmIGl0IGRpZCBub3QgZXhpc3QgaW4gdGhlIGNvbnRhaW5lci5cbiAgICAgKi9cbiAgICByZW1vdmUoc2VuZCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubVNlbmRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmlzKHRoaXMubVNlbmRzW2ldLCBzZW5kKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW5TZW5kKHNlbmQpO1xuICAgICAgICAgICAgICAgIHRoaXMubVNlbmRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgc2VuZHNcbiAgICAgKi9cbiAgICByZW1vdmVBbGwoKSB7XG4gICAgICAgIHRoaXMubVNlbmRzLmZvckVhY2goc2VuZCA9PiB0aGlzLmNsZWFuU2VuZChzZW5kKSk7XG4gICAgICAgIHRoaXMubVNlbmRzID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENhbGwgd2hlbiBcImRlc3RydWN0aW5nXCIgdGhlIFNlbmRNZ3JcbiAgICAgKi9cbiAgICBkaXNwb3NlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUFsbCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgbnVtYmVyIG9mIHNlbmRzIHN0b3JlZFxuICAgICAqL1xuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1TZW5kcy5sZW5ndGg7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHNlbmRzIHRoYXQgaGF2ZSBhIHNwZWNpZmllZCB0YXJnZXRcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgcmVtb3ZlSWZUYXJnZXRpbmcodGFyZ2V0KSB7XG4gICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLm1TZW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuaXModGhpcy5tU2VuZHNbaV0udGFyZ2V0LCB0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhblNlbmQodGhpcy5tU2VuZHNbaV0pO1xuICAgICAgICAgICAgICAgIHRoaXMubVNlbmRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICsraTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBIZWxwZXI6IGNsZWFucy9yZW1vdmVzIGFsbCBjb25uZWN0aW9ucyBpbiBhbiBpbnRlcm5hbCBTZW5kXG4gICAgY2xlYW5TZW5kKHNlbmQpIHtcbiAgICAgICAgc2VuZC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubUlucHV0LmRpc2Nvbm5lY3Qoc2VuZC5pbnB1dCk7XG4gICAgfVxufVxuZXhwb3J0cy5TZW5kTWdyID0gU2VuZE1ncjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Tb3VuZCA9IHZvaWQgMDtcbmNvbnN0IEVmZmVjdENoYWluXzEgPSByZXF1aXJlKFwiLi9FZmZlY3RDaGFpblwiKTtcbmNsYXNzIFNvdW5kIHtcbiAgICAvLyBFZmZlY3QgQ2hhaW5cbiAgICBnZXQgZWZmZWN0cygpIHsgcmV0dXJuIHRoaXMubUVmZmVjdHM7IH1cbiAgICAvLyBBdWRpb0NvbnRleHRcbiAgICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMubUVmZmVjdHMuY29udGV4dDsgfVxuICAgIC8vIFRoZSBpbm5lciBzb3VuZCBub2RlXG4gICAgZ2V0IHNvdXJjZSgpIHsgcmV0dXJuIHRoaXMubVNvdW5kOyB9XG4gICAgLy8gU2hvcnRjdXQgdG8gcG9zdC1nYWluIHBhcmFtZXRlclxuICAgIGdldCBnYWluKCkgeyByZXR1cm4gdGhpcy5tRWZmZWN0cy5nYWluLmdhaW47IH1cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0LCBzb3VuZE5vZGUsIHRhcmdldCkge1xuICAgICAgICB0aGlzLm1FZmZlY3RzID0gbmV3IEVmZmVjdENoYWluXzEuRWZmZWN0Q2hhaW4oY29udGV4dCwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5tU291bmQgPSBzb3VuZE5vZGU7XG4gICAgICAgIGlmICh0aGlzLm1Tb3VuZCkgLy8gc29tZSBTb3VuZHMgZG8gbm90IGhhdmUgYW4gaW5uZXIgc291cmNlIG9iamVjdFxuICAgICAgICAgICAgdGhpcy5tU291bmQuY29ubmVjdCh0aGlzLm1FZmZlY3RzLmlucHV0KTtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAoX2EgPSB0aGlzLm1Tb3VuZCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tU291bmQgPSBudWxsO1xuICAgICAgICB0aGlzLm1FZmZlY3RzLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0cyA9IG51bGw7XG4gICAgfVxuICAgIGNvbm5lY3QodGFyZ2V0KSB7XG4gICAgICAgIHRoaXMubUVmZmVjdHMuY29ubmVjdCh0YXJnZXQpO1xuICAgIH1cbn1cbmV4cG9ydHMuU291bmQgPSBTb3VuZDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlNvdW5kRWZmZWN0ID0gdm9pZCAwO1xuLy8gQ2xhc3MgaW50ZW5kZWQgZm9yIHNob3J0IG9uZS1zaG90IHNvdW5kIGVmZmVjdHMuXG4vLyBJZiB5b3UgbmVlZCBsb25nZXIgYXVkaW8gd2l0aCBtb3JlIGNvbnRyb2xzIGZvciBtdXNpYyBvciBhbWJpZW5jZSwgcGxlYXNlIHVzZSB0aGUgYE11c2ljYCBjbGFzcy5cbmNvbnN0IERlbGVnYXRlXzEgPSByZXF1aXJlKFwiLi9EZWxlZ2F0ZVwiKTtcbmNvbnN0IExvYWRpbmdfMSA9IHJlcXVpcmUoXCIuL0xvYWRpbmdcIik7XG5jb25zdCBTb3VuZF8xID0gcmVxdWlyZShcIi4vU291bmRcIik7XG5jbGFzcyBTb3VuZEVmZmVjdCBleHRlbmRzIFNvdW5kXzEuU291bmQge1xuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCwgdXJsKSB7XG4gICAgICAgIHN1cGVyKGNvbnRleHQsIG51bGwsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICAgICAgICBidWZmZXI6IG51bGwsXG4gICAgICAgICAgICBsb29wOiBmYWxzZSxcbiAgICAgICAgICAgIHBsYXliYWNrUmF0ZTogMSxcbiAgICAgICAgICAgIGRldHVuZTogMCxcbiAgICAgICAgICAgIGxvb3BTdGFydDogMCxcbiAgICAgICAgICAgIGxvb3BFbmQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbmVuZGVkID0gbmV3IERlbGVnYXRlXzEuRGVsZWdhdGU7XG4gICAgICAgIHRoaXMub25lbmRlZEhhbmRsZXIgPSB0aGlzLm9uZW5kZWRIYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgICAgIGlmICh1cmwpXG4gICAgICAgICAgICB0aGlzLmxvYWQodXJsKTtcbiAgICB9XG4gICAgZ2V0IGlzTG9hZGVkKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cy5idWZmZXIgIT09IG51bGw7IH1cbiAgICBzZXQgbG9vcGluZyh2YWx1ZSkgeyB0aGlzLmRlZmF1bHRzLmxvb3AgPSB2YWx1ZTsgfVxuICAgIGdldCBsb29waW5nKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cy5sb29wOyB9XG4gICAgc2V0IGxvb3BTdGFydCh2YWx1ZSkgeyB0aGlzLmRlZmF1bHRzLmxvb3BTdGFydCA9IHZhbHVlOyB9XG4gICAgc2V0IGxvb3BFbmQodmFsdWUpIHsgdGhpcy5kZWZhdWx0cy5sb29wRW5kID0gdmFsdWU7IH1cbiAgICBnZXQgbG9vcFN0YXJ0KCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cy5sb29wU3RhcnQ7IH1cbiAgICBnZXQgbG9vcEVuZCgpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHMubG9vcEVuZDsgfVxuICAgIHNldCBwbGF5YmFja1JhdGUodmFsdWUpIHsgdGhpcy5kZWZhdWx0cy5wbGF5YmFja1JhdGUgPSB2YWx1ZTsgfVxuICAgIGdldCBwbGF5YmFja1JhdGUoKSB7IHJldHVybiB0aGlzLmRlZmF1bHRzLnBsYXliYWNrUmF0ZTsgfVxuICAgIHNldCBkZXR1bmUodmFsdWUpIHsgdGhpcy5kZWZhdWx0cy5kZXR1bmUgPSB2YWx1ZTsgfVxuICAgIGdldCBkZXR1bmUoKSB7IHJldHVybiB0aGlzLmRlZmF1bHRzLmRldHVuZTsgfVxuICAgIGxvYWQodXJsKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKDAsIExvYWRpbmdfMS5sb2FkQXVkaW9CdWZmZXIpKHRoaXMuY29udGV4dCwgdXJsKVxuICAgICAgICAgICAgICAgIC50aGVuKGFCdWYgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdHMuYnVmZmVyID0gYUJ1ZjtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgb25lbmRlZEhhbmRsZXIoZXZ0KSB7XG4gICAgICAgIHRoaXMub25lbmRlZC5pbnZva2UoZXZ0LnRhcmdldCwgdGhpcyk7XG4gICAgfVxuICAgIHVubG9hZCgpIHsgdGhpcy5kZWZhdWx0cy5idWZmZXIgPSBudWxsOyB9XG4gICAgLyoqXG4gICAgICogRmlyZSBhbmQgZm9yZ2V0LiBQbGVhc2UgZG8gbm90IGNhbGwgc3RhcnQgb24gdGhlIHJldHVybmVkIEF1ZGlvQnVmZmVyU291cmNlTm9kZS5cbiAgICAgKiBAcGFyYW0gd2hlbiB3aGVuIHRvIHN0YXJ0IHBsYXlpbmcsIGluIHNlY29uZHMsIHJlbGF0aXZlIHRvIG5vd1xuICAgICAqIEBwYXJhbSBvZmZzZXQgd2hlcmUgaW4gdGhlIGF1ZGlvIGZpbGUgdG8gc3RhcnQgcGxheWluZywgaW4gc2Vjb25kc1xuICAgICAqIEBwYXJhbSBkdXJhdGlvbiBob3cgbG9uZyB0byBwbGF5IHRoZSBmaWxlLCBpbiBzZWNvbmRzLiBJZiBub3Qgc3BlY2lmaWVkLCBwbGF5cyB0aGUgd2hvbGUgZmlsZS5cbiAgICAgKi9cbiAgICBwbGF5KHdoZW4gPSAwLCBvZmZzZXQgPSAwLCBkdXJhdGlvbikge1xuICAgICAgICBjb25zdCBzcmNOb2RlID0gKHRoaXMuZGVmYXVsdHMpID9cbiAgICAgICAgICAgIG5ldyBBdWRpb0J1ZmZlclNvdXJjZU5vZGUodGhpcy5jb250ZXh0LCB0aGlzLmRlZmF1bHRzKSA6XG4gICAgICAgICAgICBuZXcgQXVkaW9CdWZmZXJTb3VyY2VOb2RlKHRoaXMuY29udGV4dCk7XG4gICAgICAgIHNyY05vZGUuY29ubmVjdCh0aGlzLmVmZmVjdHMuaW5wdXQpO1xuICAgICAgICBzcmNOb2RlLm9uZW5kZWQgPSB0aGlzLm9uZW5kZWRIYW5kbGVyO1xuICAgICAgICBpZiAoZHVyYXRpb24gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHNyY05vZGUuc3RhcnQodGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lICsgd2hlbiwgb2Zmc2V0KTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3JjTm9kZS5zdGFydCh0aGlzLmNvbnRleHQuY3VycmVudFRpbWUgKyB3aGVuLCBvZmZzZXQsIGR1cmF0aW9uKTtcbiAgICAgICAgcmV0dXJuIHNyY05vZGU7XG4gICAgfVxufVxuZXhwb3J0cy5Tb3VuZEVmZmVjdCA9IFNvdW5kRWZmZWN0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIFRPRE86IHJlZmFjdG9yIHRoaXMgdG8gdXNlIG5ldyBBdWRpb1BsYXllciwgc2FtZSBhcyBmcm9udGVuZC9zcmMvcGFnZXMvcG9ydGZvbGlvL2Fzc2V0c1xuY29uc3QgV2ViQUFfMSA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9saWIvV2ViQUFcIik7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbWFpbik7XG5mdW5jdGlvbiBtYWluKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvID0gbmV3IFdlYkFBXzEuQXVkaW9FbmdpbmUoKTtcbiAgICAgICAgYXVkaW8uaW5pdCgpO1xuICAgICAgICBjb25zdCBtdXNpYyA9IG5ldyBXZWJBQV8xLk11c2ljKGF1ZGlvLmNvbnRleHQsIGF1ZGlvLmJ1c3Nlcy5tYXN0ZXIuaW5wdXQpO1xuICAgICAgICBjb25zdCBhZGRDcmVkaXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1jcmVkaXRcIik7XG4gICAgICAgIGNvbnN0IHJlbUNyZWRpdEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVtb3ZlLWNyZWRpdFwiKTtcbiAgICAgICAgYWRkQ3JlZGl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgICAgIG5hbWVMYWJlbC5pbm5lckhUTUwgPSBcIjxpbnB1dCBjbGFzcz0nZm9ybS1jb250cm9sJyB0eXBlPSd0ZXh0JyBuYW1lPSdjcmVkaXRzLW5hbWUnIHJlcXVpcmVkLz5cIjtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChuYW1lTGFiZWwpO1xuICAgICAgICAgICAgY29uc3Qgcm9sZUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgICAgICAgICAgcm9sZUxhYmVsLmlubmVySFRNTCA9IFwiPGlucHV0IGNsYXNzPSdmb3JtLWNvbnRyb2wnIHR5cGU9J3RleHQnIG5hbWU9J2NyZWRpdHMtcm9sZScgcmVxdWlyZWQvPlwiO1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKHJvbGVMYWJlbCk7XG4gICAgICAgICAgICBjb25zdCBjcmVkaXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcmVkaXRzXCIpO1xuICAgICAgICAgICAgY3JlZGl0cy5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmVtQ3JlZGl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3JlZGl0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlZGl0c1wiKTtcbiAgICAgICAgICAgIGlmIChjcmVkaXRzLmNoaWxkcmVuLmxlbmd0aCA+IDEpXG4gICAgICAgICAgICAgICAgY3JlZGl0cy5yZW1vdmVDaGlsZChjcmVkaXRzLmNoaWxkcmVuW2NyZWRpdHMuY2hpbGRyZW4ubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYXVkaW9SZWdpb25CYWNrZ3JvdW5kQ29sb3IgPSBcIiNlY2VjZWNcIjtcbiAgICAgICAgY29uc3QgX1VSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hdWRpby1wbGF5ZXIgY2FudmFzXCIpO1xuICAgICAgICBjb25zdCBjYW52YXNSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXNSZWN0LndpZHRoICogMjtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc1JlY3QuaGVpZ2h0ICogMjtcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGF1ZGlvUmVnaW9uQmFja2dyb3VuZENvbG9yO1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIGNvbnN0IGNvdmVyVXBsb2FkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlRmlsZVwiKTtcbiAgICAgICAgY29uc3QgY292ZXJJbWFnZUVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3Zlci1pbWFnZVwiKTtcbiAgICAgICAgaWYgKGNvdmVyVXBsb2FkRWwgJiYgY292ZXJJbWFnZUVsKSB7XG4gICAgICAgICAgICBjb3ZlclVwbG9hZEVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZXZ0ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlcyA9IGNvdmVyVXBsb2FkRWwuZmlsZXM7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGVzID09PSBudWxsIHx8IGZpbGVzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGU7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoZmlsZSA9IGZpbGVzLml0ZW0oMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gX1VSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY292ZXJJbWFnZUVsLnNyYyA9IHVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfVVJMLnJldm9rZU9iamVjdFVSTCh1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2Uuc3JjID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ291bGQgbm90IGZpbmQgY292ZXJVcGxvYWRFbCBvciBjb3ZlckltYWdlRWwhXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG11c2ljSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgbXVzaWMuc291cmNlLm1lZGlhRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZHN0YXJ0XCIsIGV2dCA9PiB7XG4gICAgICAgICAgICBvbk11c2ljUGxheVBhdXNlSGFuZGxlcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgbXVzaWMuc291cmNlLm1lZGlhRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwicGxheWluZ1wiLCBldnQgPT4ge1xuICAgICAgICAgICAgb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInBhdXNlXCIsIGV2dCA9PiB7XG4gICAgICAgICAgICBvbk11c2ljUGxheVBhdXNlSGFuZGxlcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgICAgY29uc3QgeSA9IGV2dC5jbGllbnRZIC0gcmVjdC50b3A7XG4gICAgICAgICAgICBjb25zdCBwZXJjZW50ID0geCAvIHJlY3Qud2lkdGg7XG4gICAgICAgICAgICBjb25zdCBlbCA9IG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoZWwuZHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICAgICAgZWwucGF1c2UoKTtcbiAgICAgICAgICAgICAgICBlbC5jdXJyZW50VGltZSA9IGVsLmR1cmF0aW9uICogcGVyY2VudDtcbiAgICAgICAgICAgICAgICB5aWVsZCBlbC5wbGF5KCk7XG4gICAgICAgICAgICAgICAgb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgICAgICBmdW5jdGlvbiByZW5kZXJXYXZlZm9ybShhcnJheUJ1ZmZlcikge1xuICAgICAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSB5aWVsZCBtdXNpYy5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YShhcnJheUJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgY29uc3QgbENoYW4gPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICAgICAgICAgICAgY29uc3QgckNoYW4gPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7XG4gICAgICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBhdWRpb1JlZ2lvbkJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG51bVN0aWNrcyA9IDI1MDtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IGNhbnZhcy53aWR0aCAvIG51bVN0aWNrcztcbiAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJncmF5XCI7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1TdGlja3M7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBNYXRoLmZsb29yKGJ1ZmZlci5sZW5ndGggLyBudW1TdGlja3MgKiBpKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VyID0gKChsQ2hhbltpZHhdICsgckNoYW5baWR4XSkgLyAyLjApO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1pbihNYXRoLmFicyhjdXIpICogY2FudmFzLmhlaWdodCAqIDEuMjUsIChjYW52YXMuaGVpZ2h0IC0gMjQpIC8gMik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHggPSB3aWR0aCAqIGk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHkgPSBjYW52YXMuaGVpZ2h0IC8gMiAtIGhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KE1hdGguZmxvb3IoeCksIE1hdGguZmxvb3IoeSksIE1hdGgubWF4KE1hdGguZmxvb3Iod2lkdGggKiAuNzUpLCAxKSwgTWF0aC5mbG9vcihoZWlnaHQgKiAyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgICAgIG11c2ljSW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGF1ZGlvIGlucHV0IHNldHVwXG4gICAgICAgIGNvbnN0IGF1ZGlvVXBsb2FkRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1ZGlvRmlsZVwiKTtcbiAgICAgICAgaWYgKGF1ZGlvVXBsb2FkRWwpIHtcbiAgICAgICAgICAgIGF1ZGlvVXBsb2FkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZ0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGF1ZGlvVXBsb2FkRWwuZmlsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQuc3JjKVxuICAgICAgICAgICAgICAgICAgICAgICAgX1VSTC5yZXZva2VPYmplY3RVUkwobXVzaWMuc291cmNlLm1lZGlhRWxlbWVudC5zcmMpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoZmlsZSA9IGF1ZGlvVXBsb2FkRWwuZmlsZXMuaXRlbSgwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IF9VUkwuY3JlYXRlT2JqZWN0VVJMKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbXVzaWMuc291cmNlLm1lZGlhRWxlbWVudC5zcmMgPSB1cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCByZW5kZXJXYXZlZm9ybSh5aWVsZCBmaWxlLmFycmF5QnVmZmVyKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBmaW5kIGF1ZGlvVXBsb2FkRWwhXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIGNvbnN0IHBsYXlCdXR0b25FbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuYXVkaW8tcGxheWVyIC5wbGF5LWJ1dHRvblwiKTtcbiAgICAgICAgaWYgKHBsYXlCdXR0b25FbCkge1xuICAgICAgICAgICAgcGxheUJ1dHRvbkVsLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZ0KSA9PiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQuZHVyYXRpb24gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtdXNpYy5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgbXVzaWMucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJNdXNpYyBmYWlsZWQgdG8gcGxheVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk11c2ljUGxheVBhdXNlSGFuZGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXVzaWMuc2V0UGF1c2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk11c2ljUGxheVBhdXNlSGFuZGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBmaW5kIHBsYXlCdXR0b25FbCFcIik7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQ7XG4gICAgICAgICAgICBjb25zdCBwbGF5QnRuID0gcGxheUJ1dHRvbkVsLmNoaWxkcmVuWzBdO1xuICAgICAgICAgICAgaWYgKGVsLnBhdXNlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBsYXlTcmMgPSBcIi9pbWFnZXMvZmVhdGhlci9wbGF5LnN2Z1wiO1xuICAgICAgICAgICAgICAgIGlmIChwbGF5QnRuLnNyYyAhPT0gcGxheVNyYylcbiAgICAgICAgICAgICAgICAgICAgcGxheUJ0bi5zcmMgPSBwbGF5U3JjO1xuICAgICAgICAgICAgICAgIGlmIChpbnRlcnZhbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdXNlU3JjID0gXCIvaW1hZ2VzL2ZlYXRoZXIvcGF1c2Uuc3ZnXCI7XG4gICAgICAgICAgICAgICAgaWYgKHBsYXlCdG4uc3JjICE9PSBwYXVzZVNyYylcbiAgICAgICAgICAgICAgICAgICAgcGxheUJ0bi5zcmMgPSBwYXVzZVNyYztcbiAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChldnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGF1ZGlvUmVnaW9uQmFja2dyb3VuZENvbG9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG11c2ljSW1hZ2Uuc3JjKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UobXVzaWNJbWFnZSwgMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMTEpXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB4UG9zaXRpb24gPSBlbC5jdXJyZW50VGltZSAvIGVsLmR1cmF0aW9uICogY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIHhQb3NpdGlvbiwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDE3LDQyLDE5NywwLjU5KVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxSZWN0KE1hdGgucm91bmQoeFBvc2l0aW9uKSwgMCwgNCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBsYXllckVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hdWRpby1wbGF5ZXJcIik7XG4gICAgICAgIGlmICghcGxheWVyRWwpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJhdWRpbyBwbGF5ZXIgZWxlbWVudCBjb3VsZCBub3QgYmUgZm91bmQhXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgbXVzaWNTcmMgPSBwbGF5ZXJFbC5kYXRhc2V0LnNyYztcbiAgICAgICAgICAgIGlmICghbXVzaWMubG9hZChtdXNpY1NyYykpXG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk11c2ljIGZhaWxlZCB0byBsb2FkXCIpO1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaChtdXNpY1NyYyk7XG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSB5aWVsZCByZXNwb25zZS5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgeWllbGQgcmVuZGVyV2F2ZWZvcm0oYnVmZmVyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL3BhZ2VzL2Fzc2V0L2VkaXQvYXVkaW8udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=