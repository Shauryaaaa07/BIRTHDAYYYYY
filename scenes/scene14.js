/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 14: FINAL MESSAGE & ENDING (scene14.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene14 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        this.dust = [];
        
        this.blackoutTimer = null;
        this.fireworksTimer = null;
    }

    init() {
        console.log("[Scene14] Initializing Final Message & Ending Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene14-container';
        this.container.className = 'scene-container';
        
        const letter = content.finalLetter;
        const paragraphsHTML = letter.paragraphs.slice(0, -2).map(p => `<p>${p}</p>`).join('');
        const sigHTML = `<p class="last-signature">${letter.paragraphs[letter.paragraphs.length - 2]}</p>`;
        const nickHTML = `<p class="last-nickname-sig">${letter.paragraphs[letter.paragraphs.length - 1]}</p>`;

        this.container.innerHTML = `
            <canvas id="ending-canvas"></canvas>
            
            <div class="ending-stages">
                <!-- Thank You Credit Scroll Stage -->
                <div id="credit-scroll-panel" class="credit-panel">
                    <div class="credits-wrapper">
                        <div class="credits-scroller">
                            <div class="credit-title">${content.birthdayGirlName.toUpperCase()}'S STORY</div>
                            <div class="credit-subtitle">A Friendship Beyond Words</div>
                            
                            <div class="credit-section">
                                <div class="credit-role">Starring</div>
                                <div class="credit-name">${content.birthdayGirlName}</div>
                            </div>
                            
                            <div class="credit-section">
                                <div class="credit-role">Co-Star & Director</div>
                                <div class="credit-name">Your Best Friend</div>
                            </div>
                            
                            <div class="credit-section">
                                <div class="credit-role">Music Soundscapes</div>
                                <div class="credit-name">Cosmic Synthesizers & Memories</div>
                            </div>
                            
                            <div class="credit-section">
                                <div class="credit-role">Special Thanks</div>
                                <div class="credit-name">To the universe for bringing you here.</div>
                                <div class="credit-name">To all the shared laughs and memories.</div>
                            </div>
                            
                            <div class="credit-message glass-card">
                                <p>"${content.creditsMessage || 'Friendship is not about who you spend the most time with, but who you have the most beautiful moments with.'}"</p>
                            </div>
                            
                            <div class="credit-final-hbd">Happy Birthday, ${content.birthdayGirlName}.</div>
                            <button id="credits-end-btn" class="glass-btn credits-btn">Fade Out</button>
                        </div>
                    </div>
                </div>

                <!-- Fade to Black Stage (Fake Ending) -->
                <div id="blackout-panel" class="blackout-panel hide">
                    <div class="final-emotional-msg">${content.finalEmotionalMsg || 'Happy Birthday, Forever.'}</div>
                </div>
                
                <!-- Final Luxury Envelope / Letter Container -->
                <div id="final-envelope-wrapper" class="final-envelope-wrapper hide">
                    <div id="final-butterfly-guide" class="final-butterfly-guide">🦋</div>
                    <div id="final-letter" class="final-letter glass-card">
                        <h2 class="final-letter-title">Teju's Path Ahead</h2>
                        <div class="final-letter-content">
                            <p>${content.bestFriendLetter.paragraphs[0]}</p>
                            <p>${content.bestFriendLetter.paragraphs[content.bestFriendLetter.paragraphs.length - 1]}</p>
                        </div>
                        <button id="final-friends-btn" class="glass-btn final-friends-btn">Forever Best Friends ❤️</button>
                    </div>
                </div>

                <!-- Floating Suno Suno Teaser -->
                <div id="suno-suno-teaser" class="suno-suno-teaser glass-card hide">
                    Suno Suno... 💌
                </div>
                
                <!-- Last Thank You Message Card -->
                <div id="last-thankyou-panel" class="last-thankyou-panel glass-card hide">
                    <h2 class="last-panel-title">A Last Message... ❤️</h2>
                    <div class="last-panel-content">
                        ${paragraphsHTML}
                        ${sigHTML}
                        ${nickHTML}
                    </div>
                    <button id="last-panel-close-btn" class="glass-btn close-last-btn">Relive the Magic 🌟</button>
                </div>
                
                <!-- Relive Stage -->
                <div id="relive-stage" class="relive-stage hide">
                    <h2 class="relive-title">And so, the story repeats...</h2>
                    <button id="relive-btn" class="glass-btn relive-btn">🌟 Relive the Journey</button>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#ending-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup slow floating dust particles
        this.setupDust();
        
        // Binds
        this.container.querySelector('#credits-end-btn').addEventListener('click', () => this.triggerFakeEnding());
        this.container.querySelector('#final-friends-btn').addEventListener('click', () => this.triggerFlagSaluteSpell());
        this.container.querySelector('#relive-btn').addEventListener('click', () => this.restartJourney());
        
        this.container.querySelector('#suno-suno-teaser').addEventListener('click', () => {
            const teaser = this.container.querySelector('#suno-suno-teaser');
            teaser.classList.remove('show');
            setTimeout(() => teaser.classList.add('hide'), 600);
            
            this.playEndingArpeggio();
            
            const panel = this.container.querySelector('#last-thankyou-panel');
            panel.classList.remove('hide');
            panel.offsetHeight;
            panel.classList.add('show');
        });
        
        this.container.querySelector('#last-panel-close-btn').addEventListener('click', () => {
            const panel = this.container.querySelector('#last-thankyou-panel');
            panel.classList.remove('show');
            setTimeout(() => {
                panel.classList.add('hide');
                const relive = this.container.querySelector('#relive-stage');
                relive.classList.remove('hide');
                // Force layout repaint
                relive.offsetHeight;
                relive.classList.add('show');
            }, 600);
        });
        
        this.injectStyles();
        return this.container;
    }

    setupDust() {
        this.dust = [];
        for (let i = 0; i < 40; i++) {
            this.dust.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.5 + 0.4,
                alpha: Math.random() * 0.4 + 0.1,
                speedY: -(Math.random() * 0.12 + 0.04),
                swaySpeed: Math.random() * 0.015 + 0.005,
                swayOffset: Math.random() * Math.PI * 2,
                isEndingFirework: false,
                color: null
            });
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.setupDust();
        }
    }

    enter() {
        console.log("[Scene14] Entering Final Message...");
        
        // Reset gain if it decayed
        if (musicManager && musicManager.masterGain && musicManager.audioCtx) {
            musicManager.masterGain.gain.setValueAtTime(0.5, musicManager.audioCtx.currentTime);
        }
        
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
            
            // Trigger credits crawling animation
            const scroller = this.container.querySelector('.credits-scroller');
            if (scroller) {
                scroller.classList.add('scrolling');
            }
        }, 150);
        
        this.render();
    }

    triggerFakeEnding() {
        console.log("[Scene14] Triggering fake ending blackout...");
        
        // Fade global backdrop canvas to black
        const globalCanvas = document.getElementById('global-bg-canvas');
        if (globalCanvas) {
            globalCanvas.style.transition = 'opacity 3s ease-out';
            globalCanvas.style.opacity = '0';
        }
        
        // Dim the auroras completely
        const auroras = document.querySelectorAll('.aurora-glow');
        auroras.forEach(a => {
            a.style.transition = 'opacity 3s ease-out';
            a.style.opacity = '0';
        });

        // Hide credits, show blackout panel
        this.container.querySelector('#credit-scroll-panel').classList.add('hide');
        
        const blackout = this.container.querySelector('#blackout-panel');
        blackout.classList.remove('hide');
        blackout.classList.add('fade-out-final');
        
        // Audio volume ducking
        this.fadeAudioOut(2.5);
        
        // After 3.5 seconds, return the Golden Butterfly with final letter
        this.blackoutTimer = setTimeout(() => {
            this.returnButterflyLetter();
        }, 3600);
    }

    returnButterflyLetter() {
        console.log("[Scene14] Returning with final letter...");
        
        // Restore background and audio volume
        const globalCanvas = document.getElementById('global-bg-canvas');
        if (globalCanvas) globalCanvas.style.opacity = '1';
        
        const auroras = document.querySelectorAll('.aurora-glow');
        auroras.forEach(a => a.style.opacity = '0.35');
        
        if (musicManager && musicManager.masterGain && musicManager.audioCtx) {
            musicManager.masterGain.gain.setValueAtTime(0.0001, musicManager.audioCtx.currentTime);
            musicManager.masterGain.gain.exponentialRampToValueAtTime(0.5, musicManager.audioCtx.currentTime + 1.2);
        }
        
        // Hide blackout
        this.container.querySelector('#blackout-panel').classList.add('hide');
        
        // Reveal envelope letter modal
        const env = this.container.querySelector('#final-envelope-wrapper');
        env.classList.remove('hide');
        env.offsetHeight;
        env.classList.add('show');
        
        // Play sweet greeting chime
        this.playEndingArpeggio();
    }

    triggerFlagSaluteSpell() {
        console.log("[Scene14] Sharing Forever Best Friends promise!");
        
        // Initialize static letter overlay variables
        this.allowLettersFade = false;
        
        // Hide letter envelope
        this.container.querySelector('#final-envelope-wrapper').classList.remove('show');
        setTimeout(() => {
            this.container.querySelector('#final-envelope-wrapper').classList.add('hide');
        }, 800);
        
        // Spawn letter spelling particles (Blinking text + Grand fireworks finale)
        this.spawnLetterFireworks();
        
        // Spawns floating teaser after spelling + 3s pause (~12.5 seconds total)
        this.fireworksTimer = setTimeout(() => {
            const teaser = this.container.querySelector('#suno-suno-teaser');
            teaser.classList.remove('hide');
            teaser.offsetHeight; // force repaint
            teaser.classList.add('show');
        }, 12500);
        
        // Release static letters to slowly drift down after 16.5 seconds
        this.letterFadeTimer = setTimeout(() => {
            this.allowLettersFade = true;
        }, 16500);
    }

    spawnLetterFireworks() {
        const lines = [
            "PAKODIIIII",
            "HAPPIEST 16TH BIRTHDAY",
            "TOOO YOUUU"
        ];
        
        const delayPerChar = 220; // 220ms typewriter spacing
        const charSpacing = 36; // horizontal spacing between letters
        const screenCenterX = window.innerWidth / 2;
        const screenCenterY = window.innerHeight * 0.45;
        
        // Flatten into a single sequence for typewriter setTimeout loops
        const flatSequence = [];
        lines.forEach((line, lineIdx) => {
            const lineLength = line.length;
            const startX = screenCenterX - (lineLength * charSpacing / 2);
            const lineY = screenCenterY - 75 + lineIdx * 75; // 75px vertical spacing
            
            for (let charIdx = 0; charIdx < line.length; charIdx++) {
                flatSequence.push({
                    char: line[charIdx],
                    x: startX + charIdx * charSpacing,
                    y: lineY
                });
            }
        });
        
        const colors = ['#f44336', '#e91e63', '#4caf50', '#2196f3', '#ffeb3b', '#ce93d8', '#00e676', '#ff9100'];
        
        flatSequence.forEach((item, index) => {
            setTimeout(() => {
                if (item.char === ' ') return; // natural space pause
                
                // Scan outline coordinates of this character centered at item.x, item.y
                const dots = this.getCharCoordinates(item.char, item.x, item.y);
                
                // 1. Spawn outline sparkles
                dots.forEach(dot => {
                    this.dust.push({
                        x: dot.x,
                        y: dot.y,
                        size: Math.random() * 2.3 + 1.2,
                        alpha: 1.0,
                        speedY: -(Math.random() * 0.35 + 0.1),
                        swaySpeed: Math.random() * 0.04 + 0.01,
                        swayOffset: Math.random() * Math.PI * 2,
                        isEndingFirework: true,
                        isLetterOutline: true, // Mark as static letter outline
                        decay: Math.random() * 0.012 + 0.008,
                        color: '#e5c060' // Gold sparkles for outline
                    });
                });
                
                // 2. Spawn massive radial cracker burst at the letter's coordinates
                const crackerColor = colors[index % colors.length];
                for (let j = 0; j < 35; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 5.8 + 2.2;
                    this.dust.push({
                        x: item.x,
                        y: item.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        size: Math.random() * 2.0 + 1.0,
                        alpha: 1.0,
                        speedY: 0,
                        swaySpeed: 0,
                        swayOffset: 0,
                        isEndingFirework: true,
                        decay: Math.random() * 0.018 + 0.014,
                        color: crackerColor
                    });
                }
                
                this.playLetterChime(index % 4);
            }, index * delayPerChar);
        });
    }

    getCharCoordinates(char, cx, cy) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 120;
        tempCanvas.height = 120;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, 120, 120);
        
        tempCtx.fillStyle = '#ffffff';
        tempCtx.font = "bold 90px Montserrat, sans-serif";
        tempCtx.textAlign = "center";
        tempCtx.textBaseline = "middle";
        tempCtx.fillText(char, 60, 60);
        
        const imgData = tempCtx.getImageData(0, 0, 120, 120);
        const pixels = imgData.data;
        
        const coords = [];
        const step = 6; // sample every 6th pixel for smaller crisp letters
        
        for (let y = 0; y < 120; y += step) {
            for (let x = 0; x < 120; x += step) {
                const idx = (y * 120 + x) * 4;
                const r = pixels[idx];
                if (r > 128) {
                    coords.push({
                        x: cx + (x - 60) * 0.75, // scale down scanned size to fit the spacing
                        y: cy + (y - 60) * 0.75
                    });
                }
            }
        }
        return coords;
    }

    playLetterChime(index) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const scale = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6 ascending
        
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(scale[index % scale.length], now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
        osc.start();
        osc.stop(now + 0.6);
    }

    playEndingArpeggio() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const notes = [293.66, 349.23, 440.00, 587.33, 698.46, 880.00]; // D minor arpeggio
        
        notes.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.07);
            
            gain.gain.setValueAtTime(0, now + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.07 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.9);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
            osc.start(now + idx * 0.07);
            osc.stop(now + idx * 0.07 + 1.0);
        });
    }

    fadeAudioOut(duration) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        try {
            musicManager.masterGain.gain.setValueAtTime(musicManager.masterGain.gain.value, now);
            musicManager.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        } catch(e) {
            console.warn("[Scene14] Audio decay failed", e);
        }
    }

    restartJourney() {
        console.log("[Scene14] Restarting the cinematic journey...");
        
        // Restore background elements
        const globalCanvas = document.getElementById('global-bg-canvas');
        if (globalCanvas) globalCanvas.style.opacity = '1';
        
        const auroras = document.querySelectorAll('.aurora-glow');
        auroras.forEach(a => a.style.opacity = '0.35');
        
        // Restore music master gain and jump
        if (musicManager && musicManager.masterGain && musicManager.audioCtx) {
            musicManager.masterGain.gain.setValueAtTime(0.5, musicManager.audioCtx.currentTime);
        }
        
        router.navigate('countdown');
    }

    render() {
        this.time++;
        
        // Solid black sky base
        this.ctx.fillStyle = '#030309';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Spawn ambient background fireworks every 120 frames (approx 2s)
        if (this.time % 120 === 0 && !this.container.classList.contains('scene-exit')) {
            const rx = window.innerWidth * (0.15 + Math.random() * 0.7);
            const ry = window.innerHeight * (0.2 + Math.random() * 0.45);
            const colors = ['#f44336', '#e91e63', '#4caf50', '#2196f3', '#ffeb3b', '#ce93d8', '#00e676', '#ff9100'];
            const fColor = colors[Math.floor(Math.random() * colors.length)];
            
            for (let j = 0; j < 30; j++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4.0 + 1.5;
                this.dust.push({
                    x: rx,
                    y: ry,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 1.8 + 0.8,
                    alpha: 0.95,
                    speedY: 0,
                    swaySpeed: 0,
                    swayOffset: 0,
                    isEndingFirework: true,
                    decay: Math.random() * 0.015 + 0.01,
                    color: fColor
                });
            }
        }
        
        // Render dust particles
        for (let i = this.dust.length - 1; i >= 0; i--) {
            const d = this.dust[i];
            
            if (d.isEndingFirework) {
                if (d.isLetterOutline) {
                    if (this.allowLettersFade) {
                        d.y += 0.22; // very slow drift down
                        d.alpha -= d.decay || 0.008;
                    }
                    // If not allowLettersFade, stay completely static, bright, and clear!
                } else {
                    // Firework particle physics (radial expansion + gravity fall)
                    d.x += d.vx || 0;
                    d.y += (d.vy || 0) + (d.speedY || 0);
                    if (d.vy !== undefined && d.vx !== undefined) {
                        d.vy += 0.05; // gravity fall
                        d.vx *= 0.98; // air friction
                    }
                    d.alpha -= d.decay || 0.015;
                }
                
                if (d.alpha <= 0) {
                    this.dust.splice(i, 1);
                    continue;
                }
            } else {
                // Normal ambient sways
                d.y += d.speedY;
                d.swayOffset += d.swaySpeed;
                const sx = Math.sin(d.swayOffset) * 0.2;
                
                if (d.y < -10) {
                    d.y = this.canvas.height + 10;
                    d.x = Math.random() * this.canvas.width;
                }
                
                d.x += sx;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = d.alpha;
            this.ctx.fillStyle = d.color || '#e5c060'; // Gold or custom cracker color
            
            if (d.isEndingFirework) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = d.color || '#e5c060';
            }
            
            this.ctx.beginPath();
            this.ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    exit() {
        console.log("[Scene14] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.blackoutTimer) clearTimeout(this.blackoutTimer);
        if (this.fireworksTimer) clearTimeout(this.fireworksTimer);
        if (this.letterFadeTimer) clearTimeout(this.letterFadeTimer);
    }

    destroy() {
        console.log("[Scene14] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.blackoutTimer) clearTimeout(this.blackoutTimer);
        if (this.fireworksTimer) clearTimeout(this.fireworksTimer);
        if (this.letterFadeTimer) clearTimeout(this.letterFadeTimer);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'scene14-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #ending-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .ending-stages {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
            }
            .credit-panel {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
            
            /* Credits Scroll */
            .credits-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
                justify-content: center;
            }
            .credits-scroller {
                position: absolute;
                top: 100%;
                width: 90%;
                max-width: 480px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .credits-scroller.scrolling {
                animation: credits-crawl 35s linear forwards;
            }
            
            .credit-title {
                font-family: var(--font-serif);
                font-size: 2.2rem;
                font-weight: 800;
                letter-spacing: 6px;
                color: var(--color-gold);
                text-shadow: 0 0 15px var(--color-gold-glow);
                margin-bottom: 8px;
            }
            .credit-subtitle {
                font-size: 0.9rem;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: var(--color-text-secondary);
                margin-bottom: 50px;
            }
            .credit-section {
                margin-bottom: 35px;
            }
            .credit-role {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: var(--color-text-muted);
                margin-bottom: 8px;
            }
            .credit-name {
                font-family: var(--font-serif);
                font-size: 1.15rem;
                color: var(--color-text-primary);
                margin-bottom: 4px;
            }
            .credit-message {
                padding: 25px;
                border: 1.5px solid rgba(255,255,255,0.06);
                margin: 40px 0;
            }
            .credit-message p {
                font-size: 0.85rem;
                line-height: 1.6;
                color: var(--color-text-secondary);
                font-style: italic;
            }
            .credit-final-hbd {
                font-family: var(--font-serif);
                font-size: 1.6rem;
                color: var(--color-rose-gold);
                text-shadow: 0 0 15px var(--color-rose-glow);
                margin-bottom: 40px;
                letter-spacing: 2px;
            }
            .credits-btn {
                border-color: rgba(195,132,139,0.3);
                z-index: 10;
            }
            
            /* Stage 4: Fade to Black */
            .final-emotional-msg {
                font-family: var(--font-serif);
                font-size: 2.2rem;
                letter-spacing: 4px;
                color: var(--color-gold);
                text-shadow: 0 0 20px var(--color-gold-glow);
                opacity: 0;
                transform: scale(0.9);
                animation: final-text-fade 6s cubic-bezier(0.25, 1, 0.5, 1) forwards 1s;
                text-align: center;
                padding: 0 20px;
            }
            
            @keyframes credits-crawl {
                0% { top: 90%; }
                100% { top: -160%; }
            }
            
            @keyframes final-text-fade {
                0% {
                    opacity: 0;
                    transform: scale(0.95);
                    filter: blur(5px);
                }
                30% {
                    opacity: 1;
                    transform: scale(1.0);
                    filter: blur(0px);
                }
                70% {
                    opacity: 1;
                    transform: scale(1.0);
                    filter: blur(0px);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.98);
                    filter: blur(10px);
                }
            }
            
            .fade-out-final {
                background: black;
                width: 100vw;
                height: 100vh;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fade-in 2.5s ease forwards;
            }
            
            /* Final Envelope Wrapper */
            .final-envelope-wrapper {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                max-width: 440px;
                width: 90%;
                z-index: 50;
                display: flex;
                flex-direction: column;
                align-items: center;
                opacity: 0;
                transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;
                pointer-events: auto;
            }
            .final-envelope-wrapper.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .final-butterfly-guide {
                font-size: 3rem;
                margin-bottom: 20px;
                animation: float-slow 4s infinite ease-in-out;
                filter: drop-shadow(0 0 15px rgba(229,192,96,0.5));
            }
            .final-letter {
                padding: 25px;
                text-align: center;
                border-color: rgba(229,192,96,0.3);
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
            }
            .final-letter-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.2rem;
                margin-bottom: 12px;
                letter-spacing: 1px;
            }
            .final-letter-content {
                font-size: 0.85rem;
                line-height: 1.5;
                color: var(--color-text-secondary);
                margin-bottom: 20px;
                font-style: italic;
            }
            .final-friends-btn {
                width: 100%;
                font-size: 0.75rem;
                border-color: #ff4081;
            }
            .final-friends-btn:hover {
                box-shadow: 0 0 15px rgba(255, 64, 129, 0.4);
                background: rgba(255, 64, 129, 0.1);
            }
            
            /* Last Thank You Panel */
            .last-thankyou-panel {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                max-width: 480px;
                width: 90%;
                z-index: 55;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 30px;
                border-color: rgba(244, 143, 177, 0.25);
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
                opacity: 0;
                transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;
                pointer-events: auto;
            }
            .last-thankyou-panel.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .last-panel-title {
                font-family: var(--font-serif);
                color: var(--color-rose-gold);
                font-size: 1.35rem;
                margin-bottom: 20px;
                letter-spacing: 2px;
                text-shadow: 0 0 10px rgba(244, 143, 177, 0.3);
            }
            .last-panel-content {
                font-size: 0.82rem;
                line-height: 1.55;
                color: var(--color-text-secondary);
                margin-bottom: 25px;
                text-align: left;
                max-height: 55vh;
                overflow-y: auto;
                padding-right: 8px;
            }
            .last-panel-content::-webkit-scrollbar {
                width: 6px;
            }
            .last-panel-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 4px;
            }
            .last-panel-content::-webkit-scrollbar-thumb {
                background: rgba(229, 192, 96, 0.25);
                border-radius: 4px;
            }
            .last-panel-content::-webkit-scrollbar-thumb:hover {
                background: rgba(229, 192, 96, 0.45);
            }
            .last-panel-content p {
                margin-bottom: 12px;
            }
            .last-signature {
                font-family: var(--font-serif);
                font-size: 0.95rem;
                color: var(--color-gold);
                text-align: right;
                margin-top: 15px;
                font-style: italic;
            }
            .last-nickname-sig {
                font-family: var(--font-serif);
                font-size: 0.95rem;
                color: #ff80ab;
                text-align: right;
                margin-top: 10px;
                font-style: italic;
                text-shadow: 0 0 10px rgba(255, 128, 171, 0.4);
                animation: pulse 2s infinite alternate;
            }
            .close-last-btn {
                border-color: var(--color-gold);
                width: 100%;
            }
            
            /* Suno Suno floating invite card */
            .suno-suno-teaser {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                padding: 20px 40px;
                font-family: var(--font-serif);
                font-size: 1.5rem;
                color: var(--color-gold);
                border: 1px solid rgba(229, 192, 96, 0.4);
                cursor: pointer;
                z-index: 54;
                opacity: 0;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(8px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(229, 192, 96, 0.2);
                transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease, border-color 0.4s;
                pointer-events: auto;
                animation: float-slow 4s infinite ease-in-out alternate;
            }
            .suno-suno-teaser.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .suno-suno-teaser:hover {
                transform: translate(-50%, -50%) scale(1.1);
                border-color: #ff4081;
                box-shadow: 0 15px 40px rgba(255, 64, 129, 0.4);
                color: #fff;
            }
            
            /* Relive stage */
            .relive-stage {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 60;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: scale-up 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                pointer-events: auto;
            }
            .relive-title {
                font-family: var(--font-serif);
                color: var(--color-text-primary);
                font-size: 1.5rem;
                margin-bottom: 25px;
                letter-spacing: 1px;
                text-shadow: 0 0 10px rgba(255,255,255,0.3);
            }
            .relive-btn {
                border-color: var(--color-gold);
            }
            
            /* final-blinking-banner styling */
            .final-blinking-banner {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                text-align: center;
                font-family: var(--font-serif);
                font-size: 2.2rem;
                font-weight: 700;
                color: #fff;
                z-index: 52;
                letter-spacing: 2px;
                line-height: 1.4;
                opacity: 0;
                transition: opacity 0.8s ease;
                pointer-events: none;
                animation: neon-blink 1.5s infinite alternate;
            }
            .final-blinking-banner.show {
                opacity: 1;
            }
            @keyframes neon-blink {
                0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
                    text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #ff4081, 0 0 40px #ff4081, 0 0 50px #ff4081;
                }
                20%, 24%, 55% {
                    text-shadow: none;
                    color: rgba(255,255,255,0.4);
                }
            }
            @media (max-width: 600px) {
                .final-blinking-banner {
                    font-size: 1.35rem;
                    letter-spacing: 1px;
                }
            }
            
            .hide {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}
