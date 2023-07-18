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

/***/ "./src/pages/portfolio/asset.ts":
/*!**************************************!*\
  !*** ./src/pages/portfolio/asset.ts ***!
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
const WebAA_1 = __webpack_require__(/*! ../../../lib/WebAA */ "./lib/WebAA/index.ts");
window.addEventListener("load", main);
function main() {
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
        if (credits.children.length > 2)
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
                    const buffer = yield music.context.decodeAudioData(yield file.arrayBuffer());
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
    const playerEl = document.getElementById("audio-player");
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/pages/portfolio/asset.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZXMvcG9ydGZvbGlvL2Fzc2V0LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9DQUFvQztBQUNuRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGFBQWEsbUJBQU8sQ0FBQyx5REFBbUI7QUFDeEMsYUFBYSxtQkFBTyxDQUFDLHlEQUFtQjtBQUN4QyxhQUFhLG1CQUFPLENBQUMseUNBQVc7QUFDaEMsYUFBYSxtQkFBTyxDQUFDLCtDQUFjO0FBQ25DLGFBQWEsbUJBQU8sQ0FBQyxtREFBZ0I7QUFDckMsYUFBYSxtQkFBTyxDQUFDLHlEQUFtQjtBQUN4QyxhQUFhLG1CQUFPLENBQUMsbURBQWdCO0FBQ3JDLGFBQWEsbUJBQU8sQ0FBQyx5REFBbUI7QUFDeEMsYUFBYSxtQkFBTyxDQUFDLHVEQUFrQjtBQUN2QyxhQUFhLG1CQUFPLENBQUMsaURBQWU7QUFDcEMsYUFBYSxtQkFBTyxDQUFDLHFEQUFpQjtBQUN0QyxhQUFhLG1CQUFPLENBQUMsNkNBQWE7QUFDbEMsYUFBYSxtQkFBTyxDQUFDLDJDQUFZO0FBQ2pDLGFBQWEsbUJBQU8sQ0FBQyw2Q0FBYTtBQUNsQyxhQUFhLG1CQUFPLENBQUMseURBQW1COzs7Ozs7Ozs7OztBQy9CM0I7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7Ozs7Ozs7Ozs7QUNuR047QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsbUJBQW1CO0FBQ25CLGlCQUFpQixtQkFBTyxDQUFDLDJDQUFVO0FBQ25DLHNCQUFzQixtQkFBTyxDQUFDLHFEQUFlO0FBQzdDLG9CQUFvQixtQkFBTyxDQUFDLGlEQUFhO0FBQ3pDLGdCQUFnQixtQkFBTyxDQUFDLHlDQUFTO0FBQ2pDLHNCQUFzQixtQkFBTyxDQUFDLHFEQUFlO0FBQzdDO0FBQ0EscUJBQXFCO0FBQ3JCLG1CQUFtQjtBQUNuQixvQkFBb0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7Ozs7Ozs7Ozs7QUNoR047QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsV0FBVztBQUNYLHNCQUFzQixtQkFBTyxDQUFDLHFEQUFlO0FBQzdDLGtCQUFrQixtQkFBTyxDQUFDLDZDQUFXO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQixvQkFBb0I7QUFDcEIsb0JBQW9CO0FBQ3BCLHFCQUFxQjtBQUNyQixtQkFBbUI7QUFDbkIsa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVzs7Ozs7Ozs7Ozs7QUNuREU7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxtQkFBTyxDQUFDLHFDQUFPO0FBQzdCO0FBQ0Esb0JBQW9CO0FBQ3BCLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYzs7Ozs7Ozs7Ozs7QUNwREQ7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixtQkFBbUI7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QiwyQkFBMkI7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLDJCQUEyQjtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjs7Ozs7Ozs7Ozs7QUM3Q0g7QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsbUJBQW1CO0FBQ25CLHNCQUFzQixtQkFBTyxDQUFDLHFEQUFlO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLDBCQUEwQjtBQUNsRCxpRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QiwwQkFBMEI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7Ozs7Ozs7Ozs7QUMxSU47QUFDYiw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkIsd0JBQXdCO0FBQ3hCLHNCQUFzQjtBQUN0Qix5QkFBeUI7QUFDekIscUJBQXFCO0FBQ3JCLHdCQUF3QjtBQUN4Qiw0QkFBNEI7QUFDNUIsNkJBQTZCO0FBQzdCLDJCQUEyQjtBQUMzQiw4QkFBOEI7QUFDOUIsMEJBQTBCO0FBQzFCLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsMEJBQTBCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsZ0JBQWdCOzs7Ozs7Ozs7OztBQ2pHSDtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLDZCQUE2Qjs7Ozs7Ozs7Ozs7QUMxQmhCO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDOzs7Ozs7Ozs7OztBQ0RoRDtBQUNiO0FBQ0EsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx1QkFBdUI7Ozs7Ozs7Ozs7O0FDbkJWO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGlCQUFpQjtBQUNqQixnQkFBZ0IsbUJBQU8sQ0FBQyx5Q0FBUztBQUNqQyxtQkFBbUIsbUJBQU8sQ0FBQywrQ0FBWTtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7Ozs7Ozs7Ozs7O0FDcENKO0FBQ2I7QUFDQSw0QkFBNEIsK0RBQStELGlCQUFpQjtBQUM1RztBQUNBLG9DQUFvQyxNQUFNLCtCQUErQixZQUFZO0FBQ3JGLG1DQUFtQyxNQUFNLG1DQUFtQyxZQUFZO0FBQ3hGLGdDQUFnQztBQUNoQztBQUNBLEtBQUs7QUFDTDtBQUNBLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxhQUFhO0FBQ2IsZ0JBQWdCLG1CQUFPLENBQUMseUNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7Ozs7Ozs7Ozs7QUN4REE7QUFDYjtBQUNBO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7Ozs7Ozs7Ozs7O0FDMUNDO0FBQ2IsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELGVBQWU7QUFDZjtBQUNBLGVBQWUsbUJBQU8sQ0FBQyx1Q0FBUTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3Qix3QkFBd0I7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlOzs7Ozs7Ozs7OztBQ3JGRjtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxhQUFhO0FBQ2Isc0JBQXNCLG1CQUFPLENBQUMscURBQWU7QUFDN0M7QUFDQTtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBLG9CQUFvQjtBQUNwQjtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTs7Ozs7Ozs7Ozs7QUM5QkE7QUFDYjtBQUNBLDRCQUE0QiwrREFBK0QsaUJBQWlCO0FBQzVHO0FBQ0Esb0NBQW9DLE1BQU0sK0JBQStCLFlBQVk7QUFDckYsbUNBQW1DLE1BQU0sbUNBQW1DLFlBQVk7QUFDeEYsZ0NBQWdDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsOENBQTZDLEVBQUUsYUFBYSxFQUFDO0FBQzdELG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0EsbUJBQW1CLG1CQUFPLENBQUMsK0NBQVk7QUFDdkMsa0JBQWtCLG1CQUFPLENBQUMsNkNBQVc7QUFDckMsZ0JBQWdCLG1CQUFPLENBQUMseUNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIseUJBQXlCO0FBQ3pCLG9CQUFvQjtBQUNwQiwyQkFBMkI7QUFDM0IseUJBQXlCO0FBQ3pCLHNCQUFzQjtBQUN0QixvQkFBb0I7QUFDcEIsOEJBQThCO0FBQzlCLHlCQUF5QjtBQUN6Qix3QkFBd0I7QUFDeEIsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1COzs7Ozs7Ozs7OztBQ2hGTjtBQUNiO0FBQ0EsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSw4Q0FBNkMsRUFBRSxhQUFhLEVBQUM7QUFDN0QsZ0JBQWdCLG1CQUFPLENBQUMsZ0RBQW9CO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGVBQWU7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDN0xBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL2luZGV4LnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0F1ZGlvRWZmZWN0LnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0F1ZGlvRW5naW5lLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL0J1cy50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9CdXNNZ3IudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvRGVsZWdhdGUudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvRWZmZWN0Q2hhaW4udHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvRW52ZWxvcGUudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvSW50ZXJhY3Rpb24udHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvSW50ZXJmYWNlcy50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9Mb2FkaW5nLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL01vbm9TeW50aC50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9NdXNpYy50cyIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kLy4vbGliL1dlYkFBL3NyYy9TZW5kLnRzIiwid2VicGFjazovL29wdXMtdHJhY2stZnJvbnRlbmQvLi9saWIvV2ViQUEvc3JjL1NlbmRNZ3IudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvU291bmQudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL2xpYi9XZWJBQS9zcmMvU291bmRFZmZlY3QudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC8uL3NyYy9wYWdlcy9wb3J0Zm9saW8vYXNzZXQudHMiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9vcHVzLXRyYWNrLWZyb250ZW5kL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vb3B1cy10cmFjay1mcm9udGVuZC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBQbGVhc2UgbWFrZSBzdXJlIHRvIGFkZCBhbGwgbmV3IHNvdXJjZSBmaWxlcyB0byB0aGlzIGJhcnJlbCBmaWxlXG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvQXVkaW9FZmZlY3RcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9BdWRpb0VuZ2luZVwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0J1c1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0J1c01nclwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0RlbGVnYXRlXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvRWZmZWN0Q2hhaW5cIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9FbnZlbG9wZVwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0ludGVyYWN0aW9uXCIpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihyZXF1aXJlKFwiLi9zcmMvSW50ZXJmYWNlc1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL0xvYWRpbmdcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9Nb25vU3ludGhcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9NdXNpY1wiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL1NlbmRcIiksIGV4cG9ydHMpO1xuX19leHBvcnRTdGFyKHJlcXVpcmUoXCIuL3NyYy9Tb3VuZFwiKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIocmVxdWlyZShcIi4vc3JjL1NvdW5kRWZmZWN0XCIpLCBleHBvcnRzKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BdWRpb0VmZmVjdCA9IHZvaWQgMDtcbi8qKlxuICogQXVkaW9FZmZlY3QgY2xhc3Mgd3JhcHMgYW4gQXVkaW9Ob2RlIGVmZmVjdCB1bml0LCBhZGRpbmcgZHJ5L3dldCBjb250cm9scywgYW5kXG4gKiBwcmUtcG9zdCBnYWluIGZvciBnYWluLXN0YWdpbmcuXG4gKlxuICogQXVkaW9Ob2RlIEdyYXBoOlxuICogICAgICAgICAgICAgL2RyeSAgICAgICAgICAgXFxcbiAqIGlucHV0R2FpbiA8ICAgICAgICAgICAgICAgICA+IG91dHB1dEdhaW4gLT4gdGFyZ2V0XG4gKiAgICAgICAgICAgICBcXHdldCAtPiBlZmZlY3QgL1xuICovXG5jbGFzcyBBdWRpb0VmZmVjdCB7XG4gICAgZ2V0IGVmZmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdDtcbiAgICB9XG4gICAgZ2V0IGlucHV0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tSW5wdXQ7XG4gICAgfVxuICAgIGdldCBvdXRwdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1PdXRwdXQ7XG4gICAgfVxuICAgIC8vIERpcmVjdCBhY2Nlc3MgdG8gZHJ5IGdhaW5cbiAgICBnZXQgZHJ5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tRHJ5LmdhaW47XG4gICAgfVxuICAgIC8vIERpcmVjdCBhY2Nlc3MgdG8gd2V0IGdhaW5cbiAgICBnZXQgd2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tV2V0LmdhaW47XG4gICAgfVxuICAgIGdldCBwcmVHYWluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tSW5wdXQ7XG4gICAgfVxuICAgIGdldCBwb3N0R2FpbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubU91dHB1dDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZWZmZWN0LCB0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGVmZmVjdC5jb250ZXh0O1xuICAgICAgICB0aGlzLm1FZmZlY3QgPSBlZmZlY3Q7XG4gICAgICAgIHRoaXMubURyeSA9IG5ldyBHYWluTm9kZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tRHJ5LmdhaW4udmFsdWUgPSAwO1xuICAgICAgICB0aGlzLm1XZXQgPSBuZXcgR2Fpbk5vZGUoY29udGV4dCk7XG4gICAgICAgIHRoaXMubVdldC5nYWluLnZhbHVlID0gMTtcbiAgICAgICAgdGhpcy5tSW5wdXQgPSBuZXcgR2Fpbk5vZGUoY29udGV4dCk7XG4gICAgICAgIHRoaXMubU91dHB1dCA9IG5ldyBHYWluTm9kZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tSW5wdXQuY29ubmVjdCh0aGlzLm1EcnkpO1xuICAgICAgICB0aGlzLm1JbnB1dC5jb25uZWN0KHRoaXMubVdldCk7XG4gICAgICAgIHRoaXMubURyeS5jb25uZWN0KHRoaXMubU91dHB1dCk7XG4gICAgICAgIHRoaXMubVdldC5jb25uZWN0KHRoaXMubUVmZmVjdCk7XG4gICAgICAgIHRoaXMubUVmZmVjdC5jb25uZWN0KHRoaXMubU91dHB1dCk7XG4gICAgICAgIHRoaXMubU91dHB1dC5jb25uZWN0KHRhcmdldCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICB9XG4gICAgY29ubmVjdChhdWRpb05vZGUpIHtcbiAgICAgICAgdGhpcy5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubU91dHB1dC5jb25uZWN0KGF1ZGlvTm9kZSk7XG4gICAgfVxuICAgIGRpc2Nvbm5lY3QoKSB7XG4gICAgICAgIHRoaXMubU91dHB1dC5kaXNjb25uZWN0KCk7XG4gICAgfVxuICAgIC8vIEJhbGFuY2VzIHdldCBhbmQgZHJ5LiBWYWx1ZSBvZiB3ZXQgaXMgc2V0IHRvIHBlcmNlbnQsIGFuZCBkcnkgaXMgc2V0IHRvIDEtcGVyY2VudFxuICAgIHNldFdldERyeShwZXJjZW50LCByYW1wVGltZSA9IDApIHtcbiAgICAgICAgcGVyY2VudCA9IE1hdGgubWluKE1hdGgubWF4KHBlcmNlbnQsIDApLCAxKTtcbiAgICAgICAgaWYgKHJhbXBUaW1lID4gMCkge1xuICAgICAgICAgICAgY29uc3QgdGltZSA9IHRoaXMubUVmZmVjdC5jb250ZXh0LmN1cnJlbnRUaW1lICsgcmFtcFRpbWU7XG4gICAgICAgICAgICB0aGlzLm1EcnkuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxIC0gcGVyY2VudCwgdGltZSk7XG4gICAgICAgICAgICB0aGlzLm1XZXQuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShwZXJjZW50LCB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubURyeS5nYWluLnZhbHVlID0gMSAtIHBlcmNlbnQ7XG4gICAgICAgICAgICB0aGlzLm1XZXQuZ2Fpbi52YWx1ZSA9IHBlcmNlbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0V2V0KHBlcmNlbnQsIHJhbXBUaW1lID0gMCkge1xuICAgICAgICBwZXJjZW50ID0gTWF0aC5tYXgocGVyY2VudCwgMCk7XG4gICAgICAgIGlmIChyYW1wVGltZSA+IDApXG4gICAgICAgICAgICB0aGlzLm1XZXQuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZShwZXJjZW50LCB0aGlzLm1FZmZlY3QuY29udGV4dC5jdXJyZW50VGltZSArIHJhbXBUaW1lKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5tV2V0LmdhaW4udmFsdWUgPSBwZXJjZW50O1xuICAgIH1cbiAgICBzZXREcnkocGVyY2VudCwgcmFtcFRpbWUgPSAwKSB7XG4gICAgICAgIHBlcmNlbnQgPSBNYXRoLm1heChwZXJjZW50LCAwKTtcbiAgICAgICAgaWYgKHJhbXBUaW1lID4gMClcbiAgICAgICAgICAgIHRoaXMubURyeS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHBlcmNlbnQsIHRoaXMubUVmZmVjdC5jb250ZXh0LmN1cnJlbnRUaW1lICsgcmFtcFRpbWUpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLm1EcnkuZ2Fpbi52YWx1ZSA9IHBlcmNlbnQ7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMubURyeS5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVdldC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubUVmZmVjdC5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubUlucHV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tT3V0cHV0LmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tRHJ5ID0gbnVsbDtcbiAgICAgICAgdGhpcy5tV2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5tRWZmZWN0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5tSW5wdXQgPSBudWxsO1xuICAgICAgICB0aGlzLm1PdXRwdXQgPSBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuQXVkaW9FZmZlY3QgPSBBdWRpb0VmZmVjdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BdWRpb0VuZ2luZSA9IHZvaWQgMDtcbmNvbnN0IEJ1c01ncl8xID0gcmVxdWlyZShcIi4vQnVzTWdyXCIpO1xuY29uc3QgSW50ZXJhY3Rpb25fMSA9IHJlcXVpcmUoXCIuL0ludGVyYWN0aW9uXCIpO1xuY29uc3QgTW9ub1N5bnRoXzEgPSByZXF1aXJlKFwiLi9Nb25vU3ludGhcIik7XG5jb25zdCBNdXNpY18xID0gcmVxdWlyZShcIi4vTXVzaWNcIik7XG5jb25zdCBTb3VuZEVmZmVjdF8xID0gcmVxdWlyZShcIi4vU291bmRFZmZlY3RcIik7XG5jbGFzcyBBdWRpb0VuZ2luZSB7XG4gICAgZ2V0IGxpc3RlbmVyKCkgeyByZXR1cm4gdGhpcy5tQ29udGV4dC5saXN0ZW5lcjsgfVxuICAgIGdldCBidXNzZXMoKSB7IHJldHVybiB0aGlzLm1CdXNzZXM7IH1cbiAgICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMubUNvbnRleHQ7IH1cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5tQ29udGV4dCA9IG51bGw7XG4gICAgICAgIHRoaXMubUJ1c3NlcyA9IG51bGw7XG4gICAgICAgIHRoaXMubVNvdW5kcyA9IG5ldyBNYXA7XG4gICAgICAgIHRoaXMubU11c2ljID0gbmV3IE1hcDtcbiAgICAgICAgdGhpcy5tU3ludGhzID0gbmV3IE1hcDtcbiAgICB9XG4gICAgZ2V0U291bmQodXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1Tb3VuZHMuZ2V0KHVybCkgfHwgbnVsbDtcbiAgICB9XG4gICAgZ2V0TXVzaWModXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1NdXNpYy5nZXQodXJsKSB8fCBudWxsO1xuICAgIH1cbiAgICBnZXRTeW50aChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1TeW50aHMuZ2V0KG5hbWUpIHx8IG51bGw7XG4gICAgfVxuICAgIGxvYWRTb3VuZCh1cmwsIGJ1c05hbWUpIHtcbiAgICAgICAgbGV0IHNvdW5kID0gdGhpcy5tU291bmRzLmdldCh1cmwpO1xuICAgICAgICBpZiAoIXNvdW5kKSB7XG4gICAgICAgICAgICBsZXQgYnVzID0gYnVzTmFtZSA/IHRoaXMubUJ1c3Nlcy5nZXQoYnVzTmFtZSkgOiB0aGlzLm1CdXNzZXMubWFzdGVyO1xuICAgICAgICAgICAgaWYgKCFidXMpXG4gICAgICAgICAgICAgICAgYnVzID0gdGhpcy5tQnVzc2VzLm1hc3RlcjtcbiAgICAgICAgICAgIHNvdW5kID0gbmV3IFNvdW5kRWZmZWN0XzEuU291bmRFZmZlY3QodGhpcy5jb250ZXh0LCBidXMuaW5wdXQpO1xuICAgICAgICAgICAgdGhpcy5tU291bmRzLnNldCh1cmwsIHNvdW5kKTtcbiAgICAgICAgICAgIHNvdW5kLmxvYWQodXJsKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc291bmQ7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc291bmQ7XG4gICAgfVxuICAgIGxvYWRNdXNpYyh1cmwsIGJ1c05hbWUpIHtcbiAgICAgICAgbGV0IG11c2ljID0gdGhpcy5tTXVzaWMuZ2V0KHVybCk7XG4gICAgICAgIGlmICghbXVzaWMpIHtcbiAgICAgICAgICAgIGxldCBidXMgPSBidXNOYW1lID8gdGhpcy5tQnVzc2VzLmdldChidXNOYW1lKSA6IHRoaXMubUJ1c3Nlcy5tYXN0ZXI7XG4gICAgICAgICAgICBpZiAoIWJ1cylcbiAgICAgICAgICAgICAgICBidXMgPSB0aGlzLm1CdXNzZXMubWFzdGVyO1xuICAgICAgICAgICAgbXVzaWMgPSBuZXcgTXVzaWNfMS5NdXNpYyh0aGlzLmNvbnRleHQsIGJ1cy5pbnB1dCk7XG4gICAgICAgICAgICB0aGlzLm1NdXNpYy5zZXQodXJsLCBtdXNpYyk7XG4gICAgICAgICAgICBtdXNpYy5sb2FkKHVybCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG11c2ljO1xuICAgIH1cbiAgICBsb2FkU3ludGgobmFtZSwgYnVzTmFtZSA9IFwibWFzdGVyXCIsIG9wdHMpIHtcbiAgICAgICAgbGV0IHN5bnRoID0gdGhpcy5tU3ludGhzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKCFzeW50aCkge1xuICAgICAgICAgICAgbGV0IGJ1cyA9IHRoaXMubUJ1c3Nlcy5nZXQoYnVzTmFtZSk7XG4gICAgICAgICAgICBzeW50aCA9IG5ldyBNb25vU3ludGhfMS5Nb25vU3ludGgodGhpcy5jb250ZXh0LCBidXMuaW5wdXQsIG9wdHMpO1xuICAgICAgICAgICAgdGhpcy5tU3ludGhzLnNldChuYW1lLCBzeW50aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN5bnRoO1xuICAgIH1cbiAgICB3YXNJbml0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tQ29udGV4dCAhPT0gbnVsbDtcbiAgICB9XG4gICAgaW5pdCgpIHtcbiAgICAgICAgbGV0IGNvbnRleHQgPSBudWxsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29udGV4dCA9IG5ldyAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KSgpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQXVkaW9Db250ZXh0IGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyLlwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAoMCwgSW50ZXJhY3Rpb25fMS5pbnRlcmFjdGlvbldvcmthcm91bmQpKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1CdXNzZXMgPSBuZXcgQnVzTWdyXzEuQnVzTWdyKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMubUJ1c3Nlcy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMubU11c2ljLmZvckVhY2gobXVzaWMgPT4gbXVzaWMuZGlzcG9zZSgpKTtcbiAgICAgICAgdGhpcy5tTXVzaWMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5tTXVzaWMgPSBudWxsO1xuICAgICAgICB0aGlzLm1Tb3VuZHMuZm9yRWFjaChzZnggPT4gc2Z4LmRpc3Bvc2UoKSk7XG4gICAgICAgIHRoaXMubVNvdW5kcy5jbGVhcigpO1xuICAgICAgICB0aGlzLm1Tb3VuZHMgPSBudWxsO1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLkF1ZGlvRW5naW5lID0gQXVkaW9FbmdpbmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQnVzID0gdm9pZCAwO1xuY29uc3QgRWZmZWN0Q2hhaW5fMSA9IHJlcXVpcmUoXCIuL0VmZmVjdENoYWluXCIpO1xuY29uc3QgU2VuZE1ncl8xID0gcmVxdWlyZShcIi4vU2VuZE1nclwiKTtcbi8vIEJ1cyBjb25uZWN0aW9uIGdyYXBoOiAtPiBbZnhdIC0+IHBhbm5lci1ub2RlIC0+IHBvc3QtZ2FpblxuY2xhc3MgQnVzIHtcbiAgICAvLyBUbyBjb25uZWN0IGEgbm9kZSB0byB0aGlzIGJ1cywgcGFzcyB0aGlzIHRvIEF1ZGlvTm9kZSNjb25uZWN0XG4gICAgZ2V0IGlucHV0KCkgeyByZXR1cm4gdGhpcy5tRWZmZWN0cy5pbnB1dDsgfVxuICAgIGdldCBlZmZlY3RzKCkgeyByZXR1cm4gdGhpcy5tRWZmZWN0czsgfVxuICAgIGdldCBwcmVHYWluKCkgeyByZXR1cm4gdGhpcy5tRWZmZWN0cy5wcmVHYWluOyB9XG4gICAgZ2V0IHBvc3RHYWluKCkgeyByZXR1cm4gdGhpcy5tUG9zdEdhaW47IH1cbiAgICBnZXQgcGFubmVyKCkgeyByZXR1cm4gdGhpcy5tUGFubmVyOyB9XG4gICAgZ2V0IHNlbmRzKCkgeyByZXR1cm4gdGhpcy5tU2VuZHM7IH1cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0LCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5tUGFubmVyID0gY29udGV4dC5jcmVhdGVTdGVyZW9QYW5uZXIoKTtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgdGhpcy5tUGFubmVyLmNvbm5lY3QodGhpcy5tUG9zdEdhaW4pO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KHRhcmdldCB8fCBjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0cyA9IG5ldyBFZmZlY3RDaGFpbl8xLkVmZmVjdENoYWluKGNvbnRleHQsIHRoaXMubVBhbm5lcik7XG4gICAgICAgIHRoaXMubVNlbmRzID0gbmV3IFNlbmRNZ3JfMS5TZW5kTWdyKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KHRoaXMubVNlbmRzLmlucHV0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdHMgdGhlIEJ1cyB0byBhbm90aGVyIHRhcmdldCBBdWRpb05vZGVcbiAgICAgKiBAcGFyYW0gbm9kZSBub2RlIHRvIGNvbm5lY3RcbiAgICAgKi9cbiAgICBjb25uZWN0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KHRoaXMubVNlbmRzLmlucHV0KTtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4uY29ubmVjdChub2RlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGlzY29ubmVjdHMgdGhlIEJ1cyBmcm9tIGl0cyB0YXJnZXQgQXVkaW9Ob2RlXG4gICAgICovXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5jb25uZWN0KHRoaXMubVNlbmRzLmlucHV0KTtcbiAgICB9XG4gICAgLy8gQ2FsbCB0byBkaXNjb25uZWN0IGFuZCByZW1vdmUgYWxsIHJlZmVyZW5jZXMgb2YgaW5uZXIgZWZmZWN0c1xuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMubVBhbm5lci5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgdGhpcy5tRWZmZWN0cy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMubVNlbmRzLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5tUGFubmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4gPSBudWxsO1xuICAgICAgICB0aGlzLm1FZmZlY3RzID0gbnVsbDtcbiAgICAgICAgdGhpcy5tU2VuZHMgPSBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuQnVzID0gQnVzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkJ1c01nciA9IHZvaWQgMDtcbi8vIFRoaXMgZmlsZSBjb250YWlucyB0aGUgY2xhc3MgQnVzTWdyLCB3aGljaCBtYW5hZ2VzIGEgc2V0IG9mIGJ1c3Nlcy4gQnkgZGVmYXVsdCBhIG1hc3RlciBidXNcbi8vIGlzIGNyZWF0ZWQsIHdoaWNoIGJ5IGRlZmF1bHQgaXMgYXR0YWNoZWQgdG8gdGhlIEF1ZGlvQ29udGV4dCNkZXN0aW5hdGlvbiwgdW5sZXNzIG90aGVyd2lzZVxuLy8gc3BlY2lmaWVkLiBBbGwgYnVzc2VzIGNyZWF0ZWQgYnkgdGhpcyBtYW5hZ2VyIGFyZSBhdHRhY2hlZCB0byB0aGUgbWFzdGVyIGJ1cyBieSBkZWZhdWx0LlxuLy8gQ3JlYXRlZCBidXNzZXMgYXJlIHN0b3JlZCBpbiB0aGUgbWFuYWdlciBieSBrZXksIGFuZCBjYW4gYmUgcmV0cmlldmVkIHZpYSBCdXNNZ3IjZ2V0XG5jb25zdCBCdXNfMSA9IHJlcXVpcmUoXCIuL0J1c1wiKTtcbmNsYXNzIEJ1c01nciB7XG4gICAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLm1Db250ZXh0OyB9XG4gICAgZ2V0IG1hc3RlcigpIHsgcmV0dXJuIHRoaXMubU1hc3RlckJ1czsgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBjb250ZXh0IC0gYXVkaW8gY29udGV4dFxuICAgICAqIEBwYXJhbSB0YXJnZXQgLSBtYXN0ZXIgYnVzIHdpbGwgY29ubmVjdCB0byB0aGlzIHRhcmdldFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCkge1xuICAgICAgICB0aGlzLm1Db250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5tTWFzdGVyQnVzID0gbmV3IEJ1c18xLkJ1cyhjb250ZXh0LCB0YXJnZXQpO1xuICAgICAgICB0aGlzLm1CdXNzZXMgPSBuZXcgTWFwO1xuICAgICAgICB0aGlzLm1CdXNzZXMuc2V0KFwibWFzdGVyXCIsIHRoaXMubU1hc3RlckJ1cyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBidXMsIGFuZCBzdG9yZXMgaXQgaW4gdGhlIEF1ZGlvRW5naW5lLiBJdCBjYW4gYmUgcmV0cmlldmVkIHZpYSBBdWRpb0VuZ2luZSNnZXRCdXNcbiAgICAgKiBAcGFyYW0ga2V5IGtleSB0byBzZXQgYW5kIHJldHJpZXZlIHRoaXMgbmV3IGJ1cy4gSXQgbXVzdCBiZSB1bmlxdWUsIG90aGVyd2lzZSBubyBidXMgd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSB0YXJnZXQgVGFyZ2V0IG5vZGUgdG8gY29ubmVjdCB0aGUgYnVzIHRvLiBMZWZ0IHVuc3BlY2lmaWVkLCB3aWxsIHNldCBpdCB0byB0aGVcbiAgICAgKiBtYXN0ZXIgYnVzLlxuICAgICAqIEByZXR1cm5zIGNyZWF0ZWQgYXVkaW8gYnVzLCBvciBudWxsIGlmIHRoZSBrZXkgd2FzIG5vdCB1bmlxdWUuXG4gICAgICovXG4gICAgY3JlYXRlKGtleSwgdGFyZ2V0KSB7XG4gICAgICAgIGlmICh0aGlzLm1CdXNzZXMuaGFzKGtleSkpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY29uc3QgbmV3QnVzID0gbmV3IEJ1c18xLkJ1cyh0aGlzLmNvbnRleHQsIHRhcmdldCB8fCB0aGlzLm1NYXN0ZXJCdXMuaW5wdXQpO1xuICAgICAgICB0aGlzLm1CdXNzZXMuc2V0KGtleSwgbmV3QnVzKTtcbiAgICAgICAgcmV0dXJuIG5ld0J1cztcbiAgICB9XG4gICAgZ2V0KGtleSkge1xuICAgICAgICBjb25zdCBidXMgPSB0aGlzLm1CdXNzZXMuZ2V0KGtleSk7XG4gICAgICAgIHJldHVybiBidXMgPyBidXMgOiBudWxsO1xuICAgIH1cbiAgICByZW1vdmUoa2V5KSB7XG4gICAgICAgIGNvbnN0IGJ1cyA9IHRoaXMubUJ1c3Nlcy5nZXQoa2V5KTtcbiAgICAgICAgaWYgKGJ1cylcbiAgICAgICAgICAgIGJ1cztcbiAgICAgICAgcmV0dXJuIHRoaXMubUJ1c3Nlcy5kZWxldGUoa2V5KTtcbiAgICB9XG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5tQnVzc2VzLmZvckVhY2goYnVzID0+IGJ1cy5kaXNwb3NlKCkpO1xuICAgICAgICB0aGlzLm1CdXNzZXMuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5tQnVzc2VzID0gbnVsbDtcbiAgICAgICAgdGhpcy5tTWFzdGVyQnVzID0gbnVsbDtcbiAgICB9XG59XG5leHBvcnRzLkJ1c01nciA9IEJ1c01ncjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5EZWxlZ2F0ZSA9IHZvaWQgMDtcbi8qKlxuICogQ2xhc3MgdGhhdCBzdG9yZXMgYW5kIGludm9rZXMgY2FsbGJhY2suIFNpbWlsYXIgdG8gdGhlIHN1YmplY3QgaW4gdGhlIE9ic2VydmVyIHBhdHRlcm4uXG4gKiBDYW4gc3RvcmUgJ3RoaXMnIGNvbnRleHQsIGlmIG5lZWRlZCwgZS5nLiBjbGFzcyBmdW5jdGlvbiBwZXJmb3JtZWQgb24gYW4gaW5zdGFuY2UuXG4gKi9cbmNsYXNzIERlbGVnYXRlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB9XG4gICAgYWRkTGlzdGVuZXIoY2FsbGJhY2ssIGNvbnRleHQgPSBudWxsKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goeyBjb250ZXh0LCBjYWxsYmFjayB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBsaXN0ZW5lci4gTXVzdCBiZSBjYWxsZWQgd2l0aCB0aGUgc2FtZSBhcmd1bWVudHMgY2FsbGVkIGZyb20gRGVsZWdhdGUuYWRkTGlzdGVuZXIuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEZ1bmN0aW9uIHRvIHNldFxuICAgICAqIEBwYXJhbSBjb250ZXh0ICd0aGlzJyBjb250ZXh0LiAoQXJyb3cgZnVuY3Rpb25zIGF1dG9tYXRpY2FsbHkgY2FwdHVyZSAndGhpcycsIGFuZCBkbyBub3RcbiAgICAgKiBuZWVkIHRoaXMgcGFyYW1ldGVyIHNldC4pXG4gICAgICovXG4gICAgcmVtb3ZlTGlzdGVuZXIoY2FsbGJhY2ssIGNvbnRleHQgPSBudWxsKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5jYWxsYmFja3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuaXModGhpcy5jYWxsYmFja3NbaV0uY2FsbGJhY2ssIGNhbGxiYWNrKSAmJlxuICAgICAgICAgICAgICAgIChjb250ZXh0ID8gT2JqZWN0LmlzKHRoaXMuY2FsbGJhY2tzW2ldLmNvbnRleHQsIGNvbnRleHQpIDogdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpbnZva2UoLi4uYXJncykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY2FsbGJhY2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFja3NbaV0uY29udGV4dClcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrc1tpXS5jYWxsYmFjay5jYWxsKHRoaXMuY2FsbGJhY2tzW2ldLmNvbnRleHQsIC4uLmFyZ3MpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tzW2ldLmNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldCBsZW5ndGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbGxiYWNrcy5sZW5ndGg7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgIH1cbn1cbmV4cG9ydHMuRGVsZWdhdGUgPSBEZWxlZ2F0ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FZmZlY3RDaGFpbiA9IHZvaWQgMDtcbmNvbnN0IEF1ZGlvRWZmZWN0XzEgPSByZXF1aXJlKFwiLi9BdWRpb0VmZmVjdFwiKTtcbi8vIE1hbmFnZXMgYW4gYXJyYXkgb2YgYXVkaW8gRlggY2hhaW5lZCB0b2dldGhlclxuY2xhc3MgRWZmZWN0Q2hhaW4ge1xuICAgIGdldCBpbnB1dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubVByZUdhaW47XG4gICAgfVxuICAgIGdldCBvdXRwdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1Qb3N0R2FpbjtcbiAgICB9XG4gICAgY29ubmVjdChuZXdUYXJnZXQpIHtcbiAgICAgICAgdGhpcy5vdXRwdXQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm91dHB1dC5jb25uZWN0KG5ld1RhcmdldCk7XG4gICAgfVxuICAgIGdldCBjb250ZXh0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tUHJlR2Fpbi5jb250ZXh0O1xuICAgIH1cbiAgICBnZXQgcHJlR2FpbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubVByZUdhaW47XG4gICAgfVxuICAgIGdldCBnYWluKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tUG9zdEdhaW47XG4gICAgfVxuICAgIC8vIHRoZSBzaXplIG9mIHRoZSBlZmZlY3QgY2hhaW4gbm90IGluY2x1ZGluZyBwcmVHYWluIGFuZCB0YXJnZXQgbm9kZXMuXG4gICAgZ2V0IGxlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdHMubGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb250ZXh0XG4gICAgICogQHBhcmFtIHRhcmdldCBUYXJnZXQgZW5kLXBvaW50IHRvIGNvbm5lY3QgdG8uIElmIG5vIHRhcmdldCBpcyBleHBsaWNpdGx5IGdpdmVuLFxuICAgICAqIGl0IHdpbGwgYmUgc2V0IHRvIHRoZSBjb250ZXh0J3MgZGVzdGluYXRpb24gb3V0cHV0XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgdGFyZ2V0KSB7XG4gICAgICAgIHRoaXMubUNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLm1QcmVHYWluID0gbmV3IEdhaW5Ob2RlKGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1Qb3N0R2FpbiA9IG5ldyBHYWluTm9kZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tUHJlR2Fpbi5jb25uZWN0KHRoaXMubVBvc3RHYWluKTtcbiAgICAgICAgdGhpcy5tUG9zdEdhaW4uY29ubmVjdCh0YXJnZXQgfHwgY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICAgIHRoaXMubUVmZmVjdHMgPSBbXTtcbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogUHVzaCBhbiBlZmZlY3Qgb250byB0aGVcbiAgICAvLyAgKiBAcGFyYW0gZWZmZWN0VHlwZVxuICAgIC8vICAqIEBwYXJhbSBvcHRpb25zXG4gICAgLy8gICovXG4gICAgLy8gcHVzaDxUIGV4dGVuZHMgQXVkaW9FZmZlY3Q8YW55Pj4oZWZmZWN0VHlwZTogbmV3KHA/OiBhbnkpID0+IFQsIG9wdGlvbnM/OiBhbnkpOiBUIHtcbiAgICAvLyAgICAgbGV0IG5ld0ZYOiBUID0gKG9wdGlvbnMpID8gbmV3IGVmZmVjdFR5cGUob3B0aW9ucykgOiBuZXcgZWZmZWN0VHlwZTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMucHVzaEV4aXN0aW5nKG5ld0ZYKTtcbiAgICAvLyB9XG4gICAgcHVzaEVmZmVjdChub2RlKSB7XG4gICAgICAgIC8vIEF1ZGlvTm9kZSB3cmFwcGVkIGFuZCB0YXJnZXQgc2V0XG4gICAgICAgIGNvbnN0IG5ld0Z4ID0gbmV3IEF1ZGlvRWZmZWN0XzEuQXVkaW9FZmZlY3Qobm9kZSwgdGhpcy5vdXRwdXQpO1xuICAgICAgICAvLyBjb25uZWN0IGxhc3QgZWZmZWN0IHRvIHRoZSBuZXdGWFxuICAgICAgICBjb25zdCBiZWZvcmUgPSAodGhpcy5tRWZmZWN0cy5sZW5ndGggPT09IDApID8gdGhpcy5pbnB1dCA6XG4gICAgICAgICAgICB0aGlzLm1FZmZlY3RzW3RoaXMubUVmZmVjdHMubGVuZ3RoIC0gMV0ub3V0cHV0O1xuICAgICAgICBiZWZvcmUuZGlzY29ubmVjdCgpO1xuICAgICAgICBiZWZvcmUuY29ubmVjdChuZXdGeC5pbnB1dCk7XG4gICAgICAgIC8vIGRvbmUsIGNvbW1pdCBjaGFuZ2VzXG4gICAgICAgIHRoaXMubUVmZmVjdHMucHVzaChuZXdGeCk7XG4gICAgICAgIHJldHVybiBuZXdGeDtcbiAgICB9XG4gICAgcHVzaCh0eXBlLCBvcHRzKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBvcHRzID8gbmV3IHR5cGUodGhpcy5jb250ZXh0LCBvcHRzKSA6IG5ldyB0eXBlKHRoaXMuY29udGV4dCk7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2hFZmZlY3Qobm9kZSk7XG4gICAgfVxuICAgIGluc2VydEVmZmVjdChub2RlLCBpZHggPSAwKSB7XG4gICAgICAgIC8vIHdyYXAgQXVkaW9Ob2RlXG4gICAgICAgIGNvbnN0IG5ld0Z4ID0gbmV3IEF1ZGlvRWZmZWN0XzEuQXVkaW9FZmZlY3Qobm9kZSk7XG4gICAgICAgIC8vIGNsYW1wIGluZGV4XG4gICAgICAgIGlkeCA9ICh0aGlzLm1FZmZlY3RzLmxlbmd0aCA9PT0gMCkgPyAwIDpcbiAgICAgICAgICAgIE1hdGgubWluKE1hdGgubWF4KDAsIGlkeCksIHRoaXMubUVmZmVjdHMubGVuZ3RoIC0gMSk7XG4gICAgICAgIC8vIHNwbGljZSBjb25uZWN0aW9uc1xuICAgICAgICBjb25zdCBiZWZvcmUgPSBpZHggPT09IDAgPyB0aGlzLmlucHV0IDogdGhpcy5tRWZmZWN0c1tpZHggLSAxXS5vdXRwdXQ7XG4gICAgICAgIGNvbnN0IGFmdGVyID0gaWR4ID49IHRoaXMubUVmZmVjdHMubGVuZ3RoIC0gMSA/IHRoaXMub3V0cHV0IDogdGhpcy5tRWZmZWN0c1tpZHhdLmlucHV0O1xuICAgICAgICBiZWZvcmUuZGlzY29ubmVjdCgpO1xuICAgICAgICBiZWZvcmUuY29ubmVjdChuZXdGeC5pbnB1dCk7XG4gICAgICAgIG5ld0Z4LmNvbm5lY3QoYWZ0ZXIpO1xuICAgICAgICAvLyBkb25lLCBjb21taXQgY2hhbmdlc1xuICAgICAgICB0aGlzLm1FZmZlY3RzLnNwbGljZShpZHgsIDAsIG5ld0Z4KTtcbiAgICAgICAgcmV0dXJuIG5ld0Z4O1xuICAgIH1cbiAgICBpbnNlcnQodHlwZSwgaWR4ID0gMCwgb3B0cykge1xuICAgICAgICBjb25zdCBub2RlID0gKG9wdHMpID8gbmV3IHR5cGUodGhpcy5jb250ZXh0LCBvcHRzKSA6IG5ldyB0eXBlKHRoaXMuY29udGV4dCk7XG4gICAgICAgIHJldHVybiB0aGlzLmluc2VydEVmZmVjdChub2RlLCBpZHgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlZmZlY3QgdHlwZSBmcm9tIHRoZSBGWCBjaGFpbi5cbiAgICAgKiBAcGFyYW0gZWZmZWN0VHlwZSB0eXBlIG9mIGVmZmVjdCB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMgZGlzY29ubmVjdGVkIGVmZmVjdCBpZiBvbmUgd2FzIGZvdW5kLCBvciBudWxsIGlmIG5vbmUgZm91bmQuXG4gICAgICovXG4gICAgcmVtb3ZlKGVmZmVjdFR5cGUpIHtcbiAgICAgICAgLy8gdmlzaXQgZWZmZWN0cyB0byBmaW5kIG9uZSB0byByZW1vdmVcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1FZmZlY3RzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tRWZmZWN0c1tpXS5lZmZlY3QgaW5zdGFuY2VvZiBlZmZlY3RUeXBlKSB7IC8vIGZvdW5kIG1hdGNoaW5nIHR5cGUhXG4gICAgICAgICAgICAgICAgLy8gcmVjb25uZWN0IG5vZGVzXG4gICAgICAgICAgICAgICAgY29uc3QgZWZmZWN0ID0gdGhpcy5tRWZmZWN0c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCBiZWZvcmUgPSAoaSA9PT0gMCkgPyB0aGlzLmlucHV0IDogdGhpcy5tRWZmZWN0c1tpIC0gMV0ub3V0cHV0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGFmdGVyID0gKGkgPT09IHRoaXMubUVmZmVjdHMubGVuZ3RoIC0gMSkgPyB0aGlzLm91dHB1dCA6IHRoaXMubUVmZmVjdHNbaSArIDFdLmlucHV0O1xuICAgICAgICAgICAgICAgIGVmZmVjdC5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgYmVmb3JlLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgICAgICAgICBiZWZvcmUuY29ubmVjdChhZnRlcik7XG4gICAgICAgICAgICAgICAgLy8gZG9uZSwgY29tbWl0IGNoYW5nZXNcbiAgICAgICAgICAgICAgICB0aGlzLm1FZmZlY3RzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWZmZWN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG5vIGVmZmVjdCByZW1vdmVkXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICAvLyBHZXQgZmlyc3QgZWZmZWN0IG9mIGVmZmVjdFR5cGUuIFJldHVybnMgbnVsbCBpZiBub25lIGV4aXN0cy5cbiAgICAvLyAoRG9lcyBub3QgaW5jbHVkZSBwcmVHYWluIG5vZGUgb3IgdGFyZ2V0IGVuZCBwb2ludClcbiAgICBnZXQoZWZmZWN0VHlwZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXROdGgoZWZmZWN0VHlwZSwgMSk7XG4gICAgfVxuICAgIC8vIEdldCBhbGwgZWZmZWN0cyBvZiBlZmZlY3RUeXBlLlxuICAgIGdldEFsbE9mKGVmZmVjdFR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdHMuZmlsdGVyKGZ4ID0+IGZ4LmVmZmVjdCBpbnN0YW5jZW9mIGVmZmVjdFR5cGUpO1xuICAgIH1cbiAgICAvLyBHZXQgdGhlIG50aCBlZmZlY3Qgb2YgZWZmZWN0VHlwZS5cbiAgICBnZXROdGgoZWZmZWN0VHlwZSwgbikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubUVmZmVjdHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1FZmZlY3RzW2ldLmVmZmVjdCBpbnN0YW5jZW9mIGVmZmVjdFR5cGUgJiYgLS1uIDw9IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubUVmZmVjdHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMubVByZUdhaW4uZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1Qb3N0R2Fpbi5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubUVmZmVjdHMuZm9yRWFjaChlZmZlY3QgPT4gZWZmZWN0LmRpc3Bvc2UoKSk7XG4gICAgICAgIHRoaXMubVBvc3RHYWluID0gbnVsbDtcbiAgICAgICAgdGhpcy5tUHJlR2FpbiA9IG51bGw7XG4gICAgICAgIHRoaXMubUVmZmVjdHMgPSBudWxsO1xuICAgIH1cbn1cbmV4cG9ydHMuRWZmZWN0Q2hhaW4gPSBFZmZlY3RDaGFpbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5FbnZlbG9wZSA9IHZvaWQgMDtcbi8vIEFEU0hSIEVudmVsb3BlXG5jbGFzcyBFbnZlbG9wZSB7XG4gICAgZ2V0IGF0dGFja1RpbWUoKSB7IHJldHVybiB0aGlzLm1BdHRhY2tUaW1lOyB9XG4gICAgZ2V0IGF0dGFja0xldmVsKCkgeyByZXR1cm4gdGhpcy5tQXR0YWNrTGV2ZWw7IH1cbiAgICBnZXQgZGVjYXlUaW1lKCkgeyByZXR1cm4gdGhpcy5tRGVjYXlUaW1lOyB9XG4gICAgZ2V0IHN1c3RhaW5MZXZlbCgpIHsgcmV0dXJuIHRoaXMubVN1c3RhaW5MZXZlbDsgfVxuICAgIGdldCBob2xkVGltZSgpIHsgcmV0dXJuIHRoaXMubUhvbGRUaW1lOyB9XG4gICAgZ2V0IHJlbGVhc2VUaW1lKCkgeyByZXR1cm4gdGhpcy5tUmVsZWFzZVRpbWU7IH1cbiAgICBzZXQgYXR0YWNrVGltZSh2YWx1ZSkgeyB0aGlzLm1BdHRhY2tUaW1lID0gTWF0aC5tYXgoMCwgdmFsdWUpOyB9XG4gICAgc2V0IGF0dGFja0xldmVsKHZhbHVlKSB7IHRoaXMubUF0dGFja0xldmVsID0gTWF0aC5tYXgoMCwgdmFsdWUpOyB9XG4gICAgc2V0IGRlY2F5VGltZSh2YWx1ZSkgeyB0aGlzLm1EZWNheVRpbWUgPSBNYXRoLm1heCgwLCB2YWx1ZSk7IH1cbiAgICBzZXQgc3VzdGFpbkxldmVsKHZhbHVlKSB7IHRoaXMubVN1c3RhaW5MZXZlbCA9IE1hdGgubWF4KDAsIHZhbHVlKTsgfVxuICAgIHNldCBob2xkVGltZSh2YWx1ZSkgeyB0aGlzLm1Ib2xkVGltZSA9IE1hdGgubWF4KDAsIHZhbHVlKTsgfVxuICAgIHNldCByZWxlYXNlVGltZSh2YWx1ZSkgeyB0aGlzLm1SZWxlYXNlVGltZSA9IE1hdGgubWF4KDAsIHZhbHVlKTsgfVxuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIG9wdHMpIHtcbiAgICAgICAgdGhpcy5tQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMubVRhcmdldHMgPSBbXTtcbiAgICAgICAgaWYgKG9wdHMpXG4gICAgICAgICAgICB0aGlzLnNldChvcHRzKTtcbiAgICAgICAgZWxzZSB7IC8vIGRlZmF1bHRzXG4gICAgICAgICAgICB0aGlzLm1BdHRhY2tUaW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMubUF0dGFja0xldmVsID0gMTtcbiAgICAgICAgICAgIHRoaXMubURlY2F5VGltZSA9IC41O1xuICAgICAgICAgICAgdGhpcy5tU3VzdGFpbkxldmVsID0gLjI1O1xuICAgICAgICAgICAgdGhpcy5tSG9sZFRpbWUgPSAuMjU7XG4gICAgICAgICAgICB0aGlzLm1SZWxlYXNlVGltZSA9IC41O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBhIHBhcmFtZXRlciB0byB0aGUgZW52ZWxvcGUncyB0YXJnZXRzLlxuICAgICAqIEBwYXJhbSBwYXJhbVxuICAgICAqL1xuICAgIGFkZFRhcmdldChwYXJhbSkge1xuICAgICAgICB0aGlzLm1UYXJnZXRzLnB1c2gocGFyYW0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBwYXJhbWV0ZXIgZnJvbSB0aGUgZW52ZWxvcGUncyB0YXJnZXRzXG4gICAgICogQHBhcmFtIHBhcmFtXG4gICAgICovXG4gICAgcmVtb3ZlVGFyZ2V0KHBhcmFtKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tVGFyZ2V0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5pcyh0aGlzLm1UYXJnZXRzW2ldLCBwYXJhbSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1UYXJnZXRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGVudmVsb3BlIHZpYSBhbiBFbnZlbG9wZU9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBwYXJhbSBvcHRzXG4gICAgICovXG4gICAgc2V0KG9wdHMpIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2Y7XG4gICAgICAgIHRoaXMubUF0dGFja1RpbWUgPSAoX2EgPSBvcHRzLmF0dGFja1RpbWUpICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6IHRoaXMubUF0dGFja1RpbWU7XG4gICAgICAgIHRoaXMubUF0dGFja0xldmVsID0gKF9iID0gb3B0cy5hdHRhY2tMZXZlbCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogdGhpcy5tQXR0YWNrTGV2ZWw7XG4gICAgICAgIHRoaXMubURlY2F5VGltZSA9IChfYyA9IG9wdHMuZGVjYXlUaW1lKSAhPT0gbnVsbCAmJiBfYyAhPT0gdm9pZCAwID8gX2MgOiB0aGlzLm1EZWNheVRpbWU7XG4gICAgICAgIHRoaXMubVN1c3RhaW5MZXZlbCA9IChfZCA9IG9wdHMuc3VzdGFpbkxldmVsKSAhPT0gbnVsbCAmJiBfZCAhPT0gdm9pZCAwID8gX2QgOiB0aGlzLm1TdXN0YWluTGV2ZWw7XG4gICAgICAgIHRoaXMubUhvbGRUaW1lID0gKF9lID0gb3B0cy5ob2xkVGltZSkgIT09IG51bGwgJiYgX2UgIT09IHZvaWQgMCA/IF9lIDogdGhpcy5tSG9sZFRpbWU7XG4gICAgICAgIHRoaXMubVJlbGVhc2VUaW1lID0gKF9mID0gb3B0cy5yZWxlYXNlVGltZSkgIT09IG51bGwgJiYgX2YgIT09IHZvaWQgMCA/IF9mIDogdGhpcy5tUmVsZWFzZVRpbWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzIHRoZSBlbnZlbG9wZSBvbiBhbGwgdGFyZ2V0IHBhcmFtZXRlcnMuXG4gICAgICogQHBhcmFtIHdoZW4gLSBXaGVuIHRvIHRyaWdnZXIvYWN0aXZhdGUgdGhlIGVudmVsb3BlLCByZWxhdGl2ZSB0byBub3csIGluIHNlY29uZHMuXG4gICAgICovXG4gICAgYWN0aXZhdGUod2hlbiA9IDApIHtcbiAgICAgICAgLy8gR3JhYiB0aW1pbmdzXG4gICAgICAgIC8vIC4wMiBleHRyYSBzZWNvbmRzIHRvIGdpdmUgdGltZSBmb3IgZ2FpbiB0byBzbmFwIGJhY2sgdG8gemVybyB3aXRob3V0IHBvcHBpbmdcbiAgICAgICAgY29uc3QgY3VycmVudFRpbWUgPSB0aGlzLm1Db250ZXh0LmN1cnJlbnRUaW1lICsgd2hlbiArIC4wMjtcbiAgICAgICAgY29uc3Qgc3RhcnREZWNheSA9IGN1cnJlbnRUaW1lICsgdGhpcy5tQXR0YWNrVGltZTtcbiAgICAgICAgY29uc3Qgc3RhcnRSZWxlYXNlID0gY3VycmVudFRpbWUgKyB0aGlzLm1BdHRhY2tUaW1lICsgdGhpcy5tRGVjYXlUaW1lICsgdGhpcy5tSG9sZFRpbWU7XG4gICAgICAgIC8vIFNldCBlbnZlbG9wZSBmb3IgZWFjaCB0YXJnZXQgcGFyYW1cbiAgICAgICAgdGhpcy5tVGFyZ2V0cy5mb3JFYWNoKHBhcmFtID0+IHtcbiAgICAgICAgICAgIC8vIGluaXQgdmFsdWVcbiAgICAgICAgICAgIHBhcmFtLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhjdXJyZW50VGltZSk7XG4gICAgICAgICAgICBwYXJhbS5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBjdXJyZW50VGltZSk7XG4gICAgICAgICAgICAvLyBhdHRhY2tcbiAgICAgICAgICAgIHBhcmFtLnNldFRhcmdldEF0VGltZSh0aGlzLm1BdHRhY2tMZXZlbCwgY3VycmVudFRpbWUsIHRoaXMubUF0dGFja1RpbWUgKiAuMSk7XG4gICAgICAgICAgICAvLyBkZWNheVxuICAgICAgICAgICAgcGFyYW0uc2V0VGFyZ2V0QXRUaW1lKHRoaXMubVN1c3RhaW5MZXZlbCwgc3RhcnREZWNheSwgdGhpcy5tRGVjYXlUaW1lICogLjEpO1xuICAgICAgICAgICAgLy8gcmVsZWFzZVxuICAgICAgICAgICAgcGFyYW0uc2V0VGFyZ2V0QXRUaW1lKDAsIHN0YXJ0UmVsZWFzZSwgdGhpcy5tUmVsZWFzZVRpbWUgKiAuMSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYW5jZWwgZWZmZWN0cyBvZiBhIHRyaWdnZXJlZCBlbnZlbG9wZSAoc2lkZSBlZmZlY3Q6IHdpbGwgYWxzbyBjYW5jZWwgYW55IG90aGVyIHNjaGVkdWxlZFxuICAgICAqIGNoYW5nZXMgdG8gdGhlIHRhcmdldCBwYXJhbWV0ZXJzKS5cbiAgICAgKiBAcGFyYW0gd2hlbiAtIFRpbWUgYWZ0ZXIgd2hpY2ggYWxsIGV2ZW50cyB3aWxsIGJlIGNhbmNlbGxlZCwgcmVsYXRpdmUgdG8gbm93IGluIHNlY29uZHMuXG4gICAgICovXG4gICAgY2FuY2VsKHdoZW4gPSAwKSB7XG4gICAgICAgIHRoaXMubVRhcmdldHMuZm9yRWFjaChwYXJhbSA9PiB7XG4gICAgICAgICAgICBwYXJhbS5jYW5jZWxTY2hlZHVsZWRWYWx1ZXModGhpcy5tQ29udGV4dC5jdXJyZW50VGltZSArIHdoZW4pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLkVudmVsb3BlID0gRW52ZWxvcGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vIFRoaXMgZmlsZSBjb250YWlucyBhIGZ1bmN0aW9uIGBpbnRlcmFjdGlvbldvcmthcm91bmRgLCB3aGljaCBhdXRvbWF0aWNhbGx5IHJlc3VtZXMgYW4gQXVkaW9Db250ZXh0XG4vLyB3aGVuIHRoZSB1c2VyIGZpcnN0IGludGVyYWN0cyB3aXRoIHRoZSBwYWdlIChcInBvaW50ZXJkb3duXCIgZXZlbnQpLiBUaGlzIGlzIG5lY2Vzc2FyeSBvbiBtYW55IG1vZGVyblxuLy8gYnJvd3NlcnMsIHdoaWNoIHJlcXVpcmVzIHRoaXMgZ2VzdHVyZSBmcm9tIHRoZSB1c2VyIHRvIHByb3RlY3QgdGhlbSBmcm9tIHVud2FudGVkIGFubm95aW5nIGF1ZGlvLlxuLy8gSXQgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgdGhlIEF1ZGlvRW5naW5lLCBidXQgaXMgYXZhaWxhYmxlIGZvciB1c2Ugd2l0aG91dCBhbnkgZGVwZW5kZW5jeSBvbiBpdC5cbi8vIEF1dGhvcjogQWFyb24gSXNoaWJhc2hpLCBhLmlzaGliYXNoaS5tdXNpY0BnbWFpbC5jb21cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuaW50ZXJhY3Rpb25Xb3JrYXJvdW5kID0gdm9pZCAwO1xuY29uc3QgSW50ZXJhY3Rpb25Xb3JrYXJvdW5kRXZlbnRUeXBlID0gXCJwb2ludGVyZG93blwiO1xuLy8gT24gbW9zdCBtYWpvciBicm93c2VycywgYXVkaW8gY29udGV4dHMgbXVzdCBiZSByZXN1bWVkIG9yIGNyZWF0ZWQgb25jZSB0aGUgdXNlciBpbnRlcmFjdHMgd2l0aCB0aGUgcGFnZS5cbi8vIFNldHMgcHJvcGVyIGxpc3RlbmVycyB0byByZXN1bWUgdGhlIGNvbnRleHQgaWYgdGhlIGNvbnRleHQgaGFzIGJlZW4gc3VzcGVuZGVkIGR1ZSB0byB0aGlzIGNhdmVhdC5cbmZ1bmN0aW9uIGludGVyYWN0aW9uV29ya2Fyb3VuZChjb250ZXh0KSB7XG4gICAgaWYgKGNvbnRleHQuc3RhdGUgPT09IFwicnVubmluZ1wiKVxuICAgICAgICByZXR1cm47IC8vIG5vIG5lZWQgdG8gZXhlY3V0ZSBpZiBydW5uaW5nIHByb3Blcmx5XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoSW50ZXJhY3Rpb25Xb3JrYXJvdW5kRXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgZnVuY3Rpb24gY2FsbGJhY2soKSB7XG4gICAgICAgIGNvbnRleHQucmVzdW1lKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmVzdW1lZCBBdWRpb0NvbnRleHQuXCIpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoSW50ZXJhY3Rpb25Xb3JrYXJvdW5kRXZlbnRUeXBlLCBjYWxsYmFjayk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIHJlc3VtZSBBdWRpb0NvbnRleHQ6XCIsIGVycik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuaW50ZXJhY3Rpb25Xb3JrYXJvdW5kID0gaW50ZXJhY3Rpb25Xb3JrYXJvdW5kO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5sb2FkQXVkaW9CdWZmZXIgPSB2b2lkIDA7XG5mdW5jdGlvbiBsb2FkQXVkaW9CdWZmZXIoY29udGV4dCwgdXJsKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgcmVzID0geWllbGQgZmV0Y2godXJsKTtcbiAgICAgICAgY29uc3QgYnVmID0geWllbGQgcmVzLmFycmF5QnVmZmVyKCk7XG4gICAgICAgIHJldHVybiBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShidWYpO1xuICAgIH0pO1xufVxuZXhwb3J0cy5sb2FkQXVkaW9CdWZmZXIgPSBsb2FkQXVkaW9CdWZmZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuTW9ub1N5bnRoID0gdm9pZCAwO1xuY29uc3QgU291bmRfMSA9IHJlcXVpcmUoXCIuL1NvdW5kXCIpO1xuY29uc3QgRW52ZWxvcGVfMSA9IHJlcXVpcmUoXCIuL0VudmVsb3BlXCIpO1xuLy8gVE9ETzogQ3JlYXRlIFN5bnRoVm9pY2UgY2xhc3Mgd2hpY2ggY2FuIG1ha2UgbXVsdGlwbGUgdm9pY2VzIGVhc2llci5cbmNsYXNzIE1vbm9TeW50aCBleHRlbmRzIFNvdW5kXzEuU291bmQge1xuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCwgb3B0cykge1xuICAgICAgICBjb25zdCBub2RlID0gb3B0cyA/IG5ldyBPc2NpbGxhdG9yTm9kZShjb250ZXh0LCBvcHRzKSA6XG4gICAgICAgICAgICBuZXcgT3NjaWxsYXRvck5vZGUoY29udGV4dCk7XG4gICAgICAgIHN1cGVyKGNvbnRleHQsIG5vZGUsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuZW52ZWxvcGUgPSBuZXcgRW52ZWxvcGVfMS5FbnZlbG9wZShjb250ZXh0KTtcbiAgICAgICAgdGhpcy5lbnZlbG9wZS5hZGRUYXJnZXQodGhpcy5nYWluKTtcbiAgICAgICAgdGhpcy5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgdGhpcy5zb3VyY2Uuc3RhcnQoY29udGV4dC5jdXJyZW50VGltZSk7XG4gICAgfVxuICAgIGdldCB0eXBlKCkgeyByZXR1cm4gdGhpcy5zb3VyY2UudHlwZTsgfVxuICAgIHNldCB0eXBlKHR5cGUpIHtcbiAgICAgICAgdGhpcy5zb3VyY2UudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGdldCBmcmVxdWVuY3koKSB7IHJldHVybiB0aGlzLnNvdXJjZS5mcmVxdWVuY3k7IH1cbiAgICAvKipcbiAgICAgKiBTeW50aCBkb2VzIG5vdCBuZWVkIHRvIGJlIGxvYWRlZCFcbiAgICAgKiBAcGFyYW0gdXJsXG4gICAgICovXG4gICAgbG9hZCh1cmwpIHtcbiAgICAgICAgdGhyb3cgXCJTeW50aCNsb2FkIHNob3VsZCBub3QgYmUgY2FsbGVkIVwiO1xuICAgIH1cbiAgICBwbGF5KHdoZW4gPSAwKSB7XG4gICAgICAgIHRoaXMuZW52ZWxvcGUuYWN0aXZhdGUod2hlbik7XG4gICAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICB9XG4gICAgdW5sb2FkKCkge1xuICAgICAgICB0aHJvdyBcIlN5bnRoI3VubG9hZCBzaG91bGQgbm90IGJlIGNhbGxlZCFcIjtcbiAgICB9XG59XG5leHBvcnRzLk1vbm9TeW50aCA9IE1vbm9TeW50aDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLk11c2ljID0gdm9pZCAwO1xuY29uc3QgU291bmRfMSA9IHJlcXVpcmUoXCIuL1NvdW5kXCIpO1xuLy8gQ2xhc3MgbWVhbnQgZm9yIGxvbmdlciBzb3VuZHMgbGlrZSBtdXNpYywgYW1iaWVuY2UsIGV0Yy5cbi8vIEF1ZGlvTm9kZSBncmFwaDogc291cmNlIC0+IGdhaW5Ob2RlXG5jbGFzcyBNdXNpYyBleHRlbmRzIFNvdW5kXzEuU291bmQge1xuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQsIHRhcmdldCwgdXJsKSB7XG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IG5ldyBNZWRpYUVsZW1lbnRBdWRpb1NvdXJjZU5vZGUoY29udGV4dCwge1xuICAgICAgICAgICAgbWVkaWFFbGVtZW50OiB1cmwgPyBuZXcgQXVkaW8odXJsKSA6IG5ldyBBdWRpbygpXG4gICAgICAgIH0pO1xuICAgICAgICBzdXBlcihjb250ZXh0LCBzb3VyY2UsIHRhcmdldCk7XG4gICAgfVxuICAgIGxvYWQodXJsKSB7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5zcmMgPSB1cmw7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5sb2FkKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB1bmxvYWQoKSB7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5zcmMgPSBcIlwiO1xuICAgIH1cbiAgICBwbGF5KCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5wbGF5KClcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLnNvdXJjZSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBQYXVzZXMgYXVkaW8gYW5kIHNldHMgY3VycmVudFRpbWUgdG8gMFxuICAgIHN0b3AoKSB7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5wYXVzZSgpO1xuICAgICAgICB0aGlzLnNvdXJjZS5tZWRpYUVsZW1lbnQuY3VycmVudFRpbWUgPSAwO1xuICAgIH1cbiAgICBzZXRQYXVzZShwYXVzZSkge1xuICAgICAgICBpZiAocGF1c2UpXG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5tZWRpYUVsZW1lbnQucGF1c2UoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5zb3VyY2UubWVkaWFFbGVtZW50LnBsYXkoKTtcbiAgICB9XG4gICAgZ2V0IHBhdXNlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5wYXVzZWQ7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHRoaXMuc291cmNlLm1lZGlhRWxlbWVudC5zcmMgPSBcIlwiO1xuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxufVxuZXhwb3J0cy5NdXNpYyA9IE11c2ljO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG4vLyBUaGUgU2VuZCBjbGFzcyByZXByZXNlbnRzIGF1ZGlvIHJvdXRpbmcgdGhhdCBjbG9uZXMgaXRzIHNpZ25hbCBhbmQgc2VuZHMgaXQgYXQgdmFyeWluZyBsZXZlbHMgdG9cbi8vIG90aGVyIGF1ZGlvIGlucHV0cy4gVGhlc2UgYXJlIHVzdWFsbHkgc2VudCB0byBvdGhlciBidXNlcyBvciBlZmZlY3RzLlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZW5kID0gdm9pZCAwO1xuY2xhc3MgU2VuZCB7XG4gICAgZ2V0IGdhaW4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1Ob2RlLmdhaW47XG4gICAgfVxuICAgIGdldCBpbnB1dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubU5vZGU7XG4gICAgfVxuICAgIHNldCB0YXJnZXQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5tVGFyZ2V0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMubU5vZGUuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1Ob2RlLmNvbm5lY3QodmFsdWUpO1xuICAgIH1cbiAgICBnZXQgdGFyZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tVGFyZ2V0O1xuICAgIH1cbiAgICBnZXQgaGFzVGFyZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tVGFyZ2V0ICE9PSBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0LCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5tTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgICB0aGlzLm1UYXJnZXQgPSB0YXJnZXQgfHwgbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29ubmVjdCBzZW5kIHRvIGEgdGFyZ2V0IG5vZGVcbiAgICAgKiBAcGFyYW0gdGFyZ2V0XG4gICAgICovXG4gICAgY29ubmVjdCh0YXJnZXQpIHtcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3Qgc2VuZCBmcm9tIGN1cnJlbnQgdGFyZ2V0XG4gICAgICovXG4gICAgZGlzY29ubmVjdCgpIHtcbiAgICAgICAgdGhpcy5tTm9kZS5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVRhcmdldCA9IG51bGw7XG4gICAgfVxufVxuZXhwb3J0cy5TZW5kID0gU2VuZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TZW5kTWdyID0gdm9pZCAwO1xuLy8gVGhlIFNlbmRNZ3IgbWFuYWdlcyBhIGxpc3Qgb2YgU2VuZHMsIHVzZWZ1bCB0byBicm9hZGNhc3QgaW5wdXQgc2lnbmFscyB0byBvdGhlciBzb3VyY2VzLlxuY29uc3QgU2VuZF8xID0gcmVxdWlyZShcIi4vU2VuZFwiKTtcbmNsYXNzIFNlbmRNZ3Ige1xuICAgIGNvbnN0cnVjdG9yKGNvbnRleHQpIHtcbiAgICAgICAgdGhpcy5tQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMubVNlbmRzID0gW107XG4gICAgICAgIHRoaXMubUlucHV0ID0gbmV3IEdhaW5Ob2RlKGNvbnRleHQpO1xuICAgIH1cbiAgICBnZXQgaW5wdXQoKSB7IHJldHVybiB0aGlzLm1JbnB1dDsgfVxuICAgIGNyZWF0ZSh0YXJnZXQpIHtcbiAgICAgICAgY29uc3QgbmV3U2VuZCA9IG5ldyBTZW5kXzEuU2VuZCh0aGlzLm1Db250ZXh0LCB0YXJnZXQpO1xuICAgICAgICB0aGlzLm1JbnB1dC5jb25uZWN0KG5ld1NlbmQuaW5wdXQpO1xuICAgICAgICB0aGlzLm1TZW5kcy5wdXNoKG5ld1NlbmQpO1xuICAgICAgICByZXR1cm4gbmV3U2VuZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IGEgU2VuZCBwcmV2aW91c2x5IGNyZWF0ZWQgb24gdGhpcyBzZW5kIG1hbmFnZXJcbiAgICAgKiBAcGFyYW0gaWR4T3JUYXJnZXQgaWYgaW5kZXgsIGl0IG11c3QgYmUgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIFNlbmRNZ3IjbGVuZ3RoLiBJZiBhbiBBdWRpb05vZGUgdGFyZ2V0LFxuICAgICAqIGl0IHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBTZW5kIHRoYXQgaXMgdGFyZ2V0aW5nIHRoZSBBdWRpb05vZGUuIElmIG5vbmUgZXhpc3RzLCBudWxsIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIGdldChpZHhPclRhcmdldCkge1xuICAgICAgICByZXR1cm4gKHR5cGVvZiBpZHhPclRhcmdldCA9PT0gXCJudW1iZXJcIikgP1xuICAgICAgICAgICAgdGhpcy5tU2VuZHNbaWR4T3JUYXJnZXRdIHx8IG51bGwgOlxuICAgICAgICAgICAgdGhpcy5tU2VuZHMuZmluZChzZW5kID0+IE9iamVjdC5pcyhzZW5kLnRhcmdldCwgaWR4T3JUYXJnZXQpKSB8fCBudWxsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYSBzZW5kIGJlbG9uZ2luZyB0byB0aGlzIFNlbmRNZ3IsIGNhY2hlZCBieSB0aGUgdXNlci5cbiAgICAgKiBAcGFyYW0gc2VuZFxuICAgICAqIEByZXR1cm5zIHRydWU6IGlmIHNlbmQgd2FzIHN1Y2Nlc3NmdWxseSByZW1vdmVkO1xuICAgICAqIGZhbHNlOiBpZiBpdCBkaWQgbm90IGV4aXN0IGluIHRoZSBjb250YWluZXIuXG4gICAgICovXG4gICAgcmVtb3ZlKHNlbmQpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1TZW5kcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKE9iamVjdC5pcyh0aGlzLm1TZW5kc1tpXSwgc2VuZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFuU2VuZChzZW5kKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1TZW5kcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIHNlbmRzXG4gICAgICovXG4gICAgcmVtb3ZlQWxsKCkge1xuICAgICAgICB0aGlzLm1TZW5kcy5mb3JFYWNoKHNlbmQgPT4gdGhpcy5jbGVhblNlbmQoc2VuZCkpO1xuICAgICAgICB0aGlzLm1TZW5kcyA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDYWxsIHdoZW4gXCJkZXN0cnVjdGluZ1wiIHRoZSBTZW5kTWdyXG4gICAgICovXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBbGwoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IG51bWJlciBvZiBzZW5kcyBzdG9yZWRcbiAgICAgKi9cbiAgICBnZXQgbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tU2VuZHMubGVuZ3RoO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBzZW5kcyB0aGF0IGhhdmUgYSBzcGVjaWZpZWQgdGFyZ2V0XG4gICAgICogQHBhcmFtIHRhcmdldFxuICAgICAqL1xuICAgIHJlbW92ZUlmVGFyZ2V0aW5nKHRhcmdldCkge1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy5tU2VuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoT2JqZWN0LmlzKHRoaXMubVNlbmRzW2ldLnRhcmdldCwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW5TZW5kKHRoaXMubVNlbmRzW2ldKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1TZW5kcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gSGVscGVyOiBjbGVhbnMvcmVtb3ZlcyBhbGwgY29ubmVjdGlvbnMgaW4gYW4gaW50ZXJuYWwgU2VuZFxuICAgIGNsZWFuU2VuZChzZW5kKSB7XG4gICAgICAgIHNlbmQuZGlzY29ubmVjdCgpO1xuICAgICAgICB0aGlzLm1JbnB1dC5kaXNjb25uZWN0KHNlbmQuaW5wdXQpO1xuICAgIH1cbn1cbmV4cG9ydHMuU2VuZE1nciA9IFNlbmRNZ3I7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuU291bmQgPSB2b2lkIDA7XG5jb25zdCBFZmZlY3RDaGFpbl8xID0gcmVxdWlyZShcIi4vRWZmZWN0Q2hhaW5cIik7XG5jbGFzcyBTb3VuZCB7XG4gICAgLy8gRWZmZWN0IENoYWluXG4gICAgZ2V0IGVmZmVjdHMoKSB7IHJldHVybiB0aGlzLm1FZmZlY3RzOyB9XG4gICAgLy8gQXVkaW9Db250ZXh0XG4gICAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLm1FZmZlY3RzLmNvbnRleHQ7IH1cbiAgICAvLyBUaGUgaW5uZXIgc291bmQgbm9kZVxuICAgIGdldCBzb3VyY2UoKSB7IHJldHVybiB0aGlzLm1Tb3VuZDsgfVxuICAgIC8vIFNob3J0Y3V0IHRvIHBvc3QtZ2FpbiBwYXJhbWV0ZXJcbiAgICBnZXQgZ2FpbigpIHsgcmV0dXJuIHRoaXMubUVmZmVjdHMuZ2Fpbi5nYWluOyB9XG4gICAgY29uc3RydWN0b3IoY29udGV4dCwgc291bmROb2RlLCB0YXJnZXQpIHtcbiAgICAgICAgdGhpcy5tRWZmZWN0cyA9IG5ldyBFZmZlY3RDaGFpbl8xLkVmZmVjdENoYWluKGNvbnRleHQsIHRhcmdldCk7XG4gICAgICAgIHRoaXMubVNvdW5kID0gc291bmROb2RlO1xuICAgICAgICBpZiAodGhpcy5tU291bmQpIC8vIHNvbWUgU291bmRzIGRvIG5vdCBoYXZlIGFuIGlubmVyIHNvdXJjZSBvYmplY3RcbiAgICAgICAgICAgIHRoaXMubVNvdW5kLmNvbm5lY3QodGhpcy5tRWZmZWN0cy5pbnB1dCk7XG4gICAgfVxuICAgIGRpc3Bvc2UoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgKF9hID0gdGhpcy5tU291bmQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5kaXNjb25uZWN0KCk7XG4gICAgICAgIHRoaXMubVNvdW5kID0gbnVsbDtcbiAgICAgICAgdGhpcy5tRWZmZWN0cy5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMubUVmZmVjdHMgPSBudWxsO1xuICAgIH1cbiAgICBjb25uZWN0KHRhcmdldCkge1xuICAgICAgICB0aGlzLm1FZmZlY3RzLmNvbm5lY3QodGFyZ2V0KTtcbiAgICB9XG59XG5leHBvcnRzLlNvdW5kID0gU291bmQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5Tb3VuZEVmZmVjdCA9IHZvaWQgMDtcbi8vIENsYXNzIGludGVuZGVkIGZvciBzaG9ydCBvbmUtc2hvdCBzb3VuZCBlZmZlY3RzLlxuLy8gSWYgeW91IG5lZWQgbG9uZ2VyIGF1ZGlvIHdpdGggbW9yZSBjb250cm9scyBmb3IgbXVzaWMgb3IgYW1iaWVuY2UsIHBsZWFzZSB1c2UgdGhlIGBNdXNpY2AgY2xhc3MuXG5jb25zdCBEZWxlZ2F0ZV8xID0gcmVxdWlyZShcIi4vRGVsZWdhdGVcIik7XG5jb25zdCBMb2FkaW5nXzEgPSByZXF1aXJlKFwiLi9Mb2FkaW5nXCIpO1xuY29uc3QgU291bmRfMSA9IHJlcXVpcmUoXCIuL1NvdW5kXCIpO1xuY2xhc3MgU291bmRFZmZlY3QgZXh0ZW5kcyBTb3VuZF8xLlNvdW5kIHtcbiAgICBjb25zdHJ1Y3Rvcihjb250ZXh0LCB0YXJnZXQsIHVybCkge1xuICAgICAgICBzdXBlcihjb250ZXh0LCBudWxsLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgYnVmZmVyOiBudWxsLFxuICAgICAgICAgICAgbG9vcDogZmFsc2UsXG4gICAgICAgICAgICBwbGF5YmFja1JhdGU6IDEsXG4gICAgICAgICAgICBkZXR1bmU6IDAsXG4gICAgICAgICAgICBsb29wU3RhcnQ6IDAsXG4gICAgICAgICAgICBsb29wRW5kOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25lbmRlZCA9IG5ldyBEZWxlZ2F0ZV8xLkRlbGVnYXRlO1xuICAgICAgICB0aGlzLm9uZW5kZWRIYW5kbGVyID0gdGhpcy5vbmVuZGVkSGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgICBpZiAodXJsKVxuICAgICAgICAgICAgdGhpcy5sb2FkKHVybCk7XG4gICAgfVxuICAgIGdldCBpc0xvYWRlZCgpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHMuYnVmZmVyICE9PSBudWxsOyB9XG4gICAgc2V0IGxvb3BpbmcodmFsdWUpIHsgdGhpcy5kZWZhdWx0cy5sb29wID0gdmFsdWU7IH1cbiAgICBnZXQgbG9vcGluZygpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHMubG9vcDsgfVxuICAgIHNldCBsb29wU3RhcnQodmFsdWUpIHsgdGhpcy5kZWZhdWx0cy5sb29wU3RhcnQgPSB2YWx1ZTsgfVxuICAgIHNldCBsb29wRW5kKHZhbHVlKSB7IHRoaXMuZGVmYXVsdHMubG9vcEVuZCA9IHZhbHVlOyB9XG4gICAgZ2V0IGxvb3BTdGFydCgpIHsgcmV0dXJuIHRoaXMuZGVmYXVsdHMubG9vcFN0YXJ0OyB9XG4gICAgZ2V0IGxvb3BFbmQoKSB7IHJldHVybiB0aGlzLmRlZmF1bHRzLmxvb3BFbmQ7IH1cbiAgICBzZXQgcGxheWJhY2tSYXRlKHZhbHVlKSB7IHRoaXMuZGVmYXVsdHMucGxheWJhY2tSYXRlID0gdmFsdWU7IH1cbiAgICBnZXQgcGxheWJhY2tSYXRlKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cy5wbGF5YmFja1JhdGU7IH1cbiAgICBzZXQgZGV0dW5lKHZhbHVlKSB7IHRoaXMuZGVmYXVsdHMuZGV0dW5lID0gdmFsdWU7IH1cbiAgICBnZXQgZGV0dW5lKCkgeyByZXR1cm4gdGhpcy5kZWZhdWx0cy5kZXR1bmU7IH1cbiAgICBsb2FkKHVybCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgcmV0dXJuICgwLCBMb2FkaW5nXzEubG9hZEF1ZGlvQnVmZmVyKSh0aGlzLmNvbnRleHQsIHVybClcbiAgICAgICAgICAgICAgICAudGhlbihhQnVmID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRzLmJ1ZmZlciA9IGFCdWY7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIG9uZW5kZWRIYW5kbGVyKGV2dCkge1xuICAgICAgICB0aGlzLm9uZW5kZWQuaW52b2tlKGV2dC50YXJnZXQsIHRoaXMpO1xuICAgIH1cbiAgICB1bmxvYWQoKSB7IHRoaXMuZGVmYXVsdHMuYnVmZmVyID0gbnVsbDsgfVxuICAgIC8qKlxuICAgICAqIEZpcmUgYW5kIGZvcmdldC4gUGxlYXNlIGRvIG5vdCBjYWxsIHN0YXJ0IG9uIHRoZSByZXR1cm5lZCBBdWRpb0J1ZmZlclNvdXJjZU5vZGUuXG4gICAgICogQHBhcmFtIHdoZW4gd2hlbiB0byBzdGFydCBwbGF5aW5nLCBpbiBzZWNvbmRzLCByZWxhdGl2ZSB0byBub3dcbiAgICAgKiBAcGFyYW0gb2Zmc2V0IHdoZXJlIGluIHRoZSBhdWRpbyBmaWxlIHRvIHN0YXJ0IHBsYXlpbmcsIGluIHNlY29uZHNcbiAgICAgKiBAcGFyYW0gZHVyYXRpb24gaG93IGxvbmcgdG8gcGxheSB0aGUgZmlsZSwgaW4gc2Vjb25kcy4gSWYgbm90IHNwZWNpZmllZCwgcGxheXMgdGhlIHdob2xlIGZpbGUuXG4gICAgICovXG4gICAgcGxheSh3aGVuID0gMCwgb2Zmc2V0ID0gMCwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3Qgc3JjTm9kZSA9ICh0aGlzLmRlZmF1bHRzKSA/XG4gICAgICAgICAgICBuZXcgQXVkaW9CdWZmZXJTb3VyY2VOb2RlKHRoaXMuY29udGV4dCwgdGhpcy5kZWZhdWx0cykgOlxuICAgICAgICAgICAgbmV3IEF1ZGlvQnVmZmVyU291cmNlTm9kZSh0aGlzLmNvbnRleHQpO1xuICAgICAgICBzcmNOb2RlLmNvbm5lY3QodGhpcy5lZmZlY3RzLmlucHV0KTtcbiAgICAgICAgc3JjTm9kZS5vbmVuZGVkID0gdGhpcy5vbmVuZGVkSGFuZGxlcjtcbiAgICAgICAgaWYgKGR1cmF0aW9uID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBzcmNOb2RlLnN0YXJ0KHRoaXMuY29udGV4dC5jdXJyZW50VGltZSArIHdoZW4sIG9mZnNldCk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNyY05vZGUuc3RhcnQodGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lICsgd2hlbiwgb2Zmc2V0LCBkdXJhdGlvbik7XG4gICAgICAgIHJldHVybiBzcmNOb2RlO1xuICAgIH1cbn1cbmV4cG9ydHMuU291bmRFZmZlY3QgPSBTb3VuZEVmZmVjdDtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBXZWJBQV8xID0gcmVxdWlyZShcIi4uLy4uLy4uL2xpYi9XZWJBQVwiKTtcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBtYWluKTtcbmZ1bmN0aW9uIG1haW4oKSB7XG4gICAgY29uc3QgYXVkaW8gPSBuZXcgV2ViQUFfMS5BdWRpb0VuZ2luZSgpO1xuICAgIGF1ZGlvLmluaXQoKTtcbiAgICBjb25zdCBtdXNpYyA9IG5ldyBXZWJBQV8xLk11c2ljKGF1ZGlvLmNvbnRleHQsIGF1ZGlvLmJ1c3Nlcy5tYXN0ZXIuaW5wdXQpO1xuICAgIGNvbnN0IGFkZENyZWRpdEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLWNyZWRpdFwiKTtcbiAgICBjb25zdCByZW1DcmVkaXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbW92ZS1jcmVkaXRcIik7XG4gICAgYWRkQ3JlZGl0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldnQgPT4ge1xuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBjb25zdCBuYW1lTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgICAgIG5hbWVMYWJlbC5pbm5lckhUTUwgPSBcIjxpbnB1dCBjbGFzcz0nZm9ybS1jb250cm9sJyB0eXBlPSd0ZXh0JyBuYW1lPSdjcmVkaXRzLW5hbWUnIHJlcXVpcmVkLz5cIjtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKG5hbWVMYWJlbCk7XG4gICAgICAgIGNvbnN0IHJvbGVMYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgcm9sZUxhYmVsLmlubmVySFRNTCA9IFwiPGlucHV0IGNsYXNzPSdmb3JtLWNvbnRyb2wnIHR5cGU9J3RleHQnIG5hbWU9J2NyZWRpdHMtcm9sZScgcmVxdWlyZWQvPlwiO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQocm9sZUxhYmVsKTtcbiAgICAgICAgY29uc3QgY3JlZGl0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlZGl0c1wiKTtcbiAgICAgICAgY3JlZGl0cy5hcHBlbmRDaGlsZChkaXYpO1xuICAgIH0pO1xuICAgIHJlbUNyZWRpdEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZXZ0ID0+IHtcbiAgICAgICAgY29uc3QgY3JlZGl0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlZGl0c1wiKTtcbiAgICAgICAgaWYgKGNyZWRpdHMuY2hpbGRyZW4ubGVuZ3RoID4gMilcbiAgICAgICAgICAgIGNyZWRpdHMucmVtb3ZlQ2hpbGQoY3JlZGl0cy5jaGlsZHJlbltjcmVkaXRzLmNoaWxkcmVuLmxlbmd0aCAtIDFdKTtcbiAgICB9KTtcbiAgICBjb25zdCBhdWRpb1JlZ2lvbkJhY2tncm91bmRDb2xvciA9IFwiI2VjZWNlY1wiO1xuICAgIGNvbnN0IF9VUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5hdWRpby1wbGF5ZXIgY2FudmFzXCIpO1xuICAgIGNvbnN0IGNhbnZhc1JlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY2FudmFzLndpZHRoID0gY2FudmFzUmVjdC53aWR0aCAqIDI7XG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc1JlY3QuaGVpZ2h0ICogMjtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAgIGN0eC5maWxsU3R5bGUgPSBhdWRpb1JlZ2lvbkJhY2tncm91bmRDb2xvcjtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgY29uc3QgY292ZXJVcGxvYWRFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VGaWxlXCIpO1xuICAgIGNvbnN0IGNvdmVySW1hZ2VFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXItaW1hZ2VcIik7XG4gICAgaWYgKGNvdmVyVXBsb2FkRWwgJiYgY292ZXJJbWFnZUVsKSB7XG4gICAgICAgIGNvdmVyVXBsb2FkRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBldnQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBjb3ZlclVwbG9hZEVsLmZpbGVzO1xuICAgICAgICAgICAgaWYgKGZpbGVzID09PSBudWxsIHx8IGZpbGVzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmlsZTtcbiAgICAgICAgICAgICAgICBpZiAoKGZpbGUgPSBmaWxlcy5pdGVtKDApKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBfVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY292ZXJJbWFnZUVsLnNyYyA9IHVybDtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9VUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5vbmxvYWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5zcmMgPSB1cmw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZCBub3QgZmluZCBjb3ZlclVwbG9hZEVsIG9yIGNvdmVySW1hZ2VFbCFcIik7XG4gICAgfVxuICAgIGNvbnN0IG11c2ljSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBtdXNpYy5zb3VyY2UubWVkaWFFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2Fkc3RhcnRcIiwgZXZ0ID0+IHtcbiAgICAgICAgb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKTtcbiAgICB9KTtcbiAgICBtdXNpYy5zb3VyY2UubWVkaWFFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJwbGF5aW5nXCIsIGV2dCA9PiB7XG4gICAgICAgIG9uTXVzaWNQbGF5UGF1c2VIYW5kbGVyKCk7XG4gICAgfSk7XG4gICAgbXVzaWMuc291cmNlLm1lZGlhRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwicGF1c2VcIiwgZXZ0ID0+IHtcbiAgICAgICAgb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKTtcbiAgICB9KTtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldnQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgeCA9IGV2dC5jbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICBjb25zdCB5ID0gZXZ0LmNsaWVudFkgLSByZWN0LnRvcDtcbiAgICAgICAgY29uc3QgcGVyY2VudCA9IHggLyByZWN0LndpZHRoO1xuICAgICAgICBjb25zdCBlbCA9IG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQ7XG4gICAgICAgIGlmIChlbC5kdXJhdGlvbiA+IDApIHtcbiAgICAgICAgICAgIGVsLnBhdXNlKCk7XG4gICAgICAgICAgICBlbC5jdXJyZW50VGltZSA9IGVsLmR1cmF0aW9uICogcGVyY2VudDtcbiAgICAgICAgICAgIHlpZWxkIGVsLnBsYXkoKTtcbiAgICAgICAgICAgIG9uTXVzaWNQbGF5UGF1c2VIYW5kbGVyKCk7XG4gICAgICAgIH1cbiAgICB9KSk7XG4gICAgLy8gYXVkaW8gaW5wdXQgc2V0dXBcbiAgICBjb25zdCBhdWRpb1VwbG9hZEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdWRpb0ZpbGVcIik7XG4gICAgaWYgKGF1ZGlvVXBsb2FkRWwpIHtcbiAgICAgICAgYXVkaW9VcGxvYWRFbC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChldnQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmIChhdWRpb1VwbG9hZEVsLmZpbGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQuc3JjKVxuICAgICAgICAgICAgICAgICAgICBfVVJMLnJldm9rZU9iamVjdFVSTChtdXNpYy5zb3VyY2UubWVkaWFFbGVtZW50LnNyYyk7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGUgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICgoZmlsZSA9IGF1ZGlvVXBsb2FkRWwuZmlsZXMuaXRlbSgwKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gX1VSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQuc3JjID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBidWZmZXIgPSB5aWVsZCBtdXNpYy5jb250ZXh0LmRlY29kZUF1ZGlvRGF0YSh5aWVsZCBmaWxlLmFycmF5QnVmZmVyKCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsQ2hhbiA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgckNoYW4gPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMSk7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGF1ZGlvUmVnaW9uQmFja2dyb3VuZENvbG9yO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbnVtU3RpY2tzID0gMjUwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IGNhbnZhcy53aWR0aCAvIG51bVN0aWNrcztcbiAgICAgICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiZ3JheVwiO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVN0aWNrczsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBNYXRoLmZsb29yKGJ1ZmZlci5sZW5ndGggLyBudW1TdGlja3MgKiBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1ciA9ICgobENoYW5baWR4XSArIHJDaGFuW2lkeF0pIC8gMi4wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IE1hdGgubWluKE1hdGguYWJzKGN1cikgKiBjYW52YXMuaGVpZ2h0ICogMS4yNSwgKGNhbnZhcy5oZWlnaHQgLSAyNCkgLyAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHggPSB3aWR0aCAqIGk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB5ID0gY2FudmFzLmhlaWdodCAvIDIgLSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoTWF0aC5mbG9vcih4KSwgTWF0aC5mbG9vcih5KSwgTWF0aC5tYXgoTWF0aC5mbG9vcih3aWR0aCAqIC43NSksIDEpLCBNYXRoLmZsb29yKGhlaWdodCAqIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICAgICAgICAgIG11c2ljSW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb3VsZCBub3QgZmluZCBhdWRpb1VwbG9hZEVsIVwiKTtcbiAgICB9XG4gICAgbGV0IGludGVydmFsID0gbnVsbDtcbiAgICBjb25zdCBwbGF5QnV0dG9uRWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmF1ZGlvLXBsYXllciAucGxheS1idXR0b25cIik7XG4gICAgaWYgKHBsYXlCdXR0b25FbCkge1xuICAgICAgICBwbGF5QnV0dG9uRWwuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldnQpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmIChtdXNpYy5zb3VyY2UubWVkaWFFbGVtZW50LmR1cmF0aW9uID4gMCkge1xuICAgICAgICAgICAgICAgIGlmIChtdXNpYy5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG11c2ljLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTXVzaWMgZmFpbGVkIHRvIHBsYXlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb25NdXNpY1BsYXlQYXVzZUhhbmRsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG11c2ljLnNldFBhdXNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBvbk11c2ljUGxheVBhdXNlSGFuZGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBmaW5kIHBsYXlCdXR0b25FbCFcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG9uTXVzaWNQbGF5UGF1c2VIYW5kbGVyKCkge1xuICAgICAgICBjb25zdCBlbCA9IG11c2ljLnNvdXJjZS5tZWRpYUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHBsYXlCdG4gPSBwbGF5QnV0dG9uRWwuY2hpbGRyZW5bMF07XG4gICAgICAgIGlmIChlbC5wYXVzZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXlTcmMgPSBcIi9pbWFnZXMvZmVhdGhlci9wbGF5LnN2Z1wiO1xuICAgICAgICAgICAgaWYgKHBsYXlCdG4uc3JjICE9PSBwbGF5U3JjKVxuICAgICAgICAgICAgICAgIHBsYXlCdG4uc3JjID0gcGxheVNyYztcbiAgICAgICAgICAgIGlmIChpbnRlcnZhbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIGludGVydmFsID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdXNlU3JjID0gXCIvaW1hZ2VzL2ZlYXRoZXIvcGF1c2Uuc3ZnXCI7XG4gICAgICAgICAgICBpZiAocGxheUJ0bi5zcmMgIT09IHBhdXNlU3JjKVxuICAgICAgICAgICAgICAgIHBsYXlCdG4uc3JjID0gcGF1c2VTcmM7XG4gICAgICAgICAgICBpZiAoaW50ZXJ2YWwgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKGV2dCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBhdWRpb1JlZ2lvbkJhY2tncm91bmRDb2xvcjtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXVzaWNJbWFnZS5zcmMpXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZHJhd0ltYWdlKG11c2ljSW1hZ2UsIDAsIDApO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuMTEpXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHhQb3NpdGlvbiA9IGVsLmN1cnJlbnRUaW1lIC8gZWwuZHVyYXRpb24gKiBjYW52YXMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCB4UG9zaXRpb24sIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDE3LDQyLDE5NywwLjU5KVwiO1xuICAgICAgICAgICAgICAgICAgICBjdHguZmlsbFJlY3QoTWF0aC5yb3VuZCh4UG9zaXRpb24pLCAwLCA0LCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB9LCAyNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHBsYXllckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdWRpby1wbGF5ZXJcIik7XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvcGFnZXMvcG9ydGZvbGlvL2Fzc2V0LnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9