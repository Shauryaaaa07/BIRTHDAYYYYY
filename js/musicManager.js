/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - MUSIC & SYNTHESIZER MANAGER (musicManager.js)
   ========================================================================== */

import { mediaConfig } from './mediaConfig.js';

export class MusicManager {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.isMuted = false;
        
        // Track state
        this.currentTrackId = null; // 1, 2, 3, or 4
        this.activeAudio = null;    // Active HTML5 Audio Element (if loading from file)
        this.activeSynth = null;    // Active Web Audio Synthesizer Loop
        
        // Volume nodes for crossfading
        this.audioGainNode = null;
        this.synthGainNode = null;
        
        // Audio element sources mapped dynamically from central config
        this.tracks = {
            1: mediaConfig.songs.track1,
            2: mediaConfig.songs.track2,
            3: mediaConfig.songs.track3,
            4: mediaConfig.songs.track4
        };

        // UI references
        this.audioWidget = document.getElementById('audio-widget');
        this.audioToggle = document.getElementById('audio-toggle');
        this.soundOnIcon = this.audioToggle.querySelector('.sound-on');
        this.soundOffIcon = this.audioToggle.querySelector('.sound-off');
    }

    init() {
        console.log("[MusicManager] Initializing music manager...");
        
        // Set up click listener on the floating audio widget
        this.audioWidget.addEventListener('click', () => this.toggleMute());
        
        // Reveal widget (hidden by default in HTML)
        this.audioWidget.classList.remove('hide');
    }

    ensureAudioContext() {
        if (!this.audioCtx) {
            // Create AudioContext (standard or webkit fallback)
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            
            // Master gain node
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioCtx.currentTime);
            this.masterGain.connect(this.audioCtx.destination);
            
            // Sub-gains for standard audio vs synthesized audio
            this.audioGainNode = this.audioCtx.createGain();
            this.audioGainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
            this.audioGainNode.connect(this.masterGain);

            this.synthGainNode = this.audioCtx.createGain();
            this.synthGainNode.gain.setValueAtTime(1, this.audioCtx.currentTime);
            this.synthGainNode.connect(this.masterGain);
            
            console.log("[MusicManager] Web Audio Context established.");
        }
        
        // Resume context if suspended (common browser autoplay mitigation)
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playTrack(trackId) {
        if (this.currentTrackId === trackId) return;
        
        this.ensureAudioContext();
        console.log(`[MusicManager] Transitioning to Track ${trackId}`);
        
        const oldTrackId = this.currentTrackId;
        this.currentTrackId = trackId;
        
        // Determine if we should play a file or synthesize
        const songPath = this.tracks[trackId];
        const isFileAvailable = window.assetRegistry && window.assetRegistry.music[songPath];
        
        // Stop current sources smoothly
        this.fadeAndStopCurrent(2.0);

        if (isFileAvailable) {
            this.playAudioFile(songPath);
        } else {
            this.playSynthesizer(trackId);
        }
        
        // Update UI styling
        this.updateUI();
    }

    playAudioFile(filePath) {
        console.log(`[MusicManager] Playing Audio File: ${filePath}`);
        
        const audio = new Audio(filePath);
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        
        // Route audio element through Web Audio API
        const source = this.audioCtx.createMediaElementSource(audio);
        
        // Create local gain node for this track's fade-in
        const trackGain = this.audioCtx.createGain();
        trackGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        trackGain.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 2.5);
        
        source.connect(trackGain);
        trackGain.connect(this.audioGainNode);
        
        // Store reference for stopping later
        this.activeAudio = {
            element: audio,
            gainNode: trackGain
        };
        
        audio.play().catch(err => {
            console.warn("[MusicManager] Audio element play failed. autoplays blocked?", err);
            // Fall back to synth immediately if play is blocked or fails
            this.playSynthesizer(this.currentTrackId);
        });
    }

    playSynthesizer(trackId) {
        console.log(`[MusicManager] Fallback Synthesizer active for Song ${trackId}`);
        
        const synthGain = this.audioCtx.createGain();
        synthGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
        synthGain.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 2.5);
        synthGain.connect(this.synthGainNode);
        
        const synthData = {
            nodes: [],
            intervals: [],
            gainNode: synthGain
        };
        
        if (trackId === 1) {
            // --- TRACK 1: COUNTDOWN (Ticking & Space Drone) ---
            // 1. Low deep drone oscillator
            const osc = this.audioCtx.createOscillator();
            const filter = this.audioCtx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(65.41, this.audioCtx.currentTime); // C2
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(120, this.audioCtx.currentTime);
            
            osc.connect(filter);
            filter.connect(synthGain);
            osc.start();
            synthData.nodes.push(osc, filter);
            
            // 2. Ticking clock interval (every 1 second)
            const tickInterval = setInterval(() => {
                if (this.audioCtx.state === 'suspended') return;
                
                const tickOsc = this.audioCtx.createOscillator();
                const tickGain = this.audioCtx.createGain();
                
                tickOsc.type = 'triangle';
                tickOsc.frequency.setValueAtTime(1800, this.audioCtx.currentTime);
                
                tickGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
                tickGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.05);
                
                tickOsc.connect(tickGain);
                tickGain.connect(synthGain);
                tickOsc.start();
                tickOsc.stop(this.audioCtx.currentTime + 0.06);
            }, 1000);
            
            synthData.intervals.push(tickInterval);
            
        } else if (trackId === 2) {
            // --- TRACK 2: NATURE (ambient wind & pentatonic harp) ---
            // 1. Low wind drone
            const wind = this.createNoiseNode();
            const windFilter = this.audioCtx.createBiquadFilter();
            const windGain = this.audioCtx.createGain();
            
            windFilter.type = 'bandpass';
            windFilter.frequency.setValueAtTime(300, this.audioCtx.currentTime);
            windFilter.Q.setValueAtTime(2.0, this.audioCtx.currentTime);
            
            windGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            
            if (wind) {
                wind.connect(windFilter);
                windFilter.connect(windGain);
                windGain.connect(synthGain);
                synthData.nodes.push(wind, windFilter, windGain);
                
                // Modulate wind filter frequency (LFO)
                const lfo = this.audioCtx.createOscillator();
                const lfoGain = this.audioCtx.createGain();
                lfo.frequency.value = 0.15; // Slow sweep
                lfoGain.gain.value = 150;    // Range: 150Hz to 450Hz
                
                lfo.connect(lfoGain);
                lfoGain.connect(windFilter.frequency);
                lfo.start();
                synthData.nodes.push(lfo, lfoGain);
            }
            
            // 2. Pentatonic Harp sweeps (Notes in C Major Pentatonic)
            const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C4 to E5
            
            // Delay lines for spaces/echoes
            const delay = this.audioCtx.createDelay();
            const delayFeedback = this.audioCtx.createGain();
            delay.delayTime.value = 0.45;
            delayFeedback.gain.value = 0.5;
            
            delay.connect(delayFeedback);
            delayFeedback.connect(delay);
            delay.connect(synthGain);
            synthData.nodes.push(delay, delayFeedback);
            
            const harpInterval = setInterval(() => {
                if (this.audioCtx.state === 'suspended') return;
                
                const note = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
                
                const harpOsc = this.audioCtx.createOscillator();
                const harpGain = this.audioCtx.createGain();
                
                harpOsc.type = 'sine';
                harpOsc.frequency.setValueAtTime(note, this.audioCtx.currentTime);
                
                harpGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                harpGain.gain.linearRampToValueAtTime(0.07, this.audioCtx.currentTime + 0.1);
                harpGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.8);
                
                harpOsc.connect(harpGain);
                // Connect some directly and some through the delay line
                if (Math.random() > 0.4) {
                    harpGain.connect(delay);
                } else {
                    harpGain.connect(synthGain);
                }
                
                harpOsc.start();
                harpOsc.stop(this.audioCtx.currentTime + 2.0);
            }, 1800);
            
            synthData.intervals.push(harpInterval);
            
        } else if (trackId === 3) {
            // --- TRACK 3: SLIDESHOW (Soft emotive piano chords) ---
            // Triad chords: Cmaj7 (C E G B), Am9 (A C E G B), Fmaj7 (F A C E), G6 (G B D E)
            const chords = [
                [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3 base)
                [110.00, 130.81, 164.81, 196.00], // Am7
                [87.31, 130.81, 174.61, 220.00],  // Fmaj7
                [98.00, 146.83, 196.00, 246.94]   // G
            ];
            
            let chordIndex = 0;
            
            const playChord = () => {
                if (this.audioCtx.state === 'suspended') return;
                
                const currentChord = chords[chordIndex];
                chordIndex = (chordIndex + 1) % chords.length;
                
                currentChord.forEach((freq, idx) => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
                    
                    // Stagger note triggers slightly (arpeggiate chords)
                    const triggerDelay = idx * 0.08;
                    
                    gain.gain.setValueAtTime(0, this.audioCtx.currentTime + triggerDelay);
                    gain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + triggerDelay + 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + triggerDelay + 3.8);
                    
                    osc.connect(gain);
                    gain.connect(synthGain);
                    osc.start(this.audioCtx.currentTime + triggerDelay);
                    osc.stop(this.audioCtx.currentTime + triggerDelay + 4.0);
                });
            };
            
            // Play first chord immediately
            playChord();
            const chordInterval = setInterval(playChord, 4000);
            synthData.intervals.push(chordInterval);
            
        } else if (trackId === 4) {
            // --- TRACK 4: ENDING (Grand string chorus & glowing bells) ---
            // Drones for warm string beds (C2, C3, G3)
            const roots = [65.41, 130.81, 196.00, 261.63];
            
            roots.forEach((freq) => {
                const osc1 = this.audioCtx.createOscillator();
                const osc2 = this.audioCtx.createOscillator();
                const filter = this.audioCtx.createBiquadFilter();
                const vNode = this.audioCtx.createGain();
                
                osc1.type = 'sawtooth';
                osc2.type = 'sawtooth';
                
                // Detune slightly for chorusing effect
                osc1.frequency.setValueAtTime(freq - 0.4, this.audioCtx.currentTime);
                osc2.frequency.setValueAtTime(freq + 0.4, this.audioCtx.currentTime);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(250, this.audioCtx.currentTime);
                
                vNode.gain.setValueAtTime(0.03, this.audioCtx.currentTime);
                
                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(vNode);
                vNode.connect(synthGain);
                
                osc1.start();
                osc2.start();
                
                synthData.nodes.push(osc1, osc2, filter, vNode);
            });
            
            // Random bright high bell chimes
            const bellChimes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00]; // High C6 to C7 pentatonic
            const chimeInterval = setInterval(() => {
                if (this.audioCtx.state === 'suspended') return;
                
                const chimeOsc = this.audioCtx.createOscillator();
                const chimeGain = this.audioCtx.createGain();
                
                chimeOsc.type = 'sine';
                chimeOsc.frequency.setValueAtTime(
                    bellChimes[Math.floor(Math.random() * bellChimes.length)], 
                    this.audioCtx.currentTime
                );
                
                chimeGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                chimeGain.gain.linearRampToValueAtTime(0.04, this.audioCtx.currentTime + 0.02);
                chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 2.5);
                
                chimeOsc.connect(chimeGain);
                chimeGain.connect(synthGain);
                chimeOsc.start();
                chimeOsc.stop(this.audioCtx.currentTime + 2.6);
            }, 2000);
            
            synthData.intervals.push(chimeInterval);
        }
        
        this.activeSynth = synthData;
    }

    createNoiseNode() {
        if (!this.audioCtx) return null;
        // Generate white noise buffer
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        whiteNoise.start();
        return whiteNoise;
    }

    fadeAndStopCurrent(fadeOutDuration) {
        const now = this.audioCtx ? this.audioCtx.currentTime : 0;
        
        // Fade standard audio element
        if (this.activeAudio) {
            const { element, gainNode } = this.activeAudio;
            try {
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeOutDuration);
                
                setTimeout(() => {
                    element.pause();
                    element.src = "";
                    element.load();
                }, fadeOutDuration * 1000 + 100);
            } catch (err) {
                console.warn("[MusicManager] Error tearing down audio element", err);
            }
            this.activeAudio = null;
        }
        
        // Fade and clean synthesizer nodes
        if (this.activeSynth) {
            const { nodes, intervals, gainNode } = this.activeSynth;
            try {
                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeOutDuration);
                
                // Clear any clock ticking or arpeggiation timers
                intervals.forEach(interval => clearInterval(interval));
                
                // Wait for the release tail, then terminate oscillators
                setTimeout(() => {
                    nodes.forEach(node => {
                        try { node.stop(); } catch {}
                        try { node.disconnect(); } catch {}
                    });
                }, fadeOutDuration * 1000 + 100);
            } catch (err) {
                console.warn("[MusicManager] Error tearing down synthesizers", err);
            }
            this.activeSynth = null;
        }
    }

    toggleMute() {
        this.ensureAudioContext();
        this.isMuted = !this.isMuted;
        
        console.log(`[MusicManager] Mute toggled: ${this.isMuted}`);
        
        const targetGainValue = this.isMuted ? 0 : 1;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioCtx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(targetGainValue, this.audioCtx.currentTime + 0.3);
        
        this.updateUI();
    }

    updateUI() {
        if (this.isMuted) {
            this.soundOnIcon.classList.add('hide');
            this.soundOffIcon.classList.remove('hide');
            this.audioWidget.classList.remove('audio-playing');
        } else {
            this.soundOnIcon.classList.remove('hide');
            this.soundOffIcon.classList.add('hide');
            // Sound is only considered "playing" if a track has actually been initialized
            if (this.currentTrackId !== null) {
                this.audioWidget.classList.add('audio-playing');
            }
        }
    }
}
// Export a single global instance for simplicity
export const musicManager = new MusicManager();
