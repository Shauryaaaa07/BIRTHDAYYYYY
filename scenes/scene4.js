/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 4: INTERACTIVE CAKE (scene4.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene4 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.step = 1; // 1: Light, 2: Blow, 3: Cut, 4: Celebration
        this.animationFrameId = null;
        
        // Microphone blow variables
        this.micStream = null;
        this.audioAnalyser = null;
        this.micCheckInterval = null;
        
        // Confetti and smoke particles
        this.particles = [];
        this.smokeParticles = [];
        
        // Drag state for matchstick and knife
        this.draggedElement = null;
        this.isDragging = false;
        
        // Easter Egg variables
        this.golgappasEaten = 0;
        this.bubbleTimer = null;
    }

    init() {
        console.log("[Scene4] Initializing Interactive Cake...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene4-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="cake-confetti-canvas"></canvas>
            
            <div class="cake-layout">
                <!-- Step Instructions Header -->
                <div class="cake-instructions glass-card">
                    <h3 id="cake-step-title">Step 1: Light the Candle</h3>
                    <p id="cake-step-desc">Pick up the matchstick and drag it to the candle wick to light it.</p>
                </div>
                
                <div class="cake-stage">
                    <!-- Cake Stage Hanging Decoration Ribbons and Balloons -->
                    <div class="cake-decorations">
                        <div class="decor-ribbon ribbon-left"></div>
                        <div class="decor-ribbon ribbon-right"></div>
                        <div class="decor-balloon balloon-left">🎈</div>
                        <div class="decor-balloon balloon-right">✨</div>
                    </div>
                    
                    <!-- The Pedestal & Cake -->
                    <div class="cake-wrapper">
                        <!-- Candle wick and flame container -->
                        <div class="cake-candle">
                            <div class="candle-wick"></div>
                            <div id="candle-flame" class="candle-flame hide"></div>
                        </div>
                        
                        <!-- Multi-tier Cake -->
                        <div id="cake-3d" class="cake-body">
                            <div class="cake-tier tier-top">
                                <div class="tier-top-cap"></div>
                            </div>
                            <div class="cake-tier tier-mid">
                                <div class="tier-mid-cap"></div>
                            </div>
                            <div class="cake-tier tier-base">
                                <div class="tier-base-cap"></div>
                            </div>
                            
                            <!-- 3D Vector slice piece -->
                            <div id="cake-slice" class="cake-slice-piece hide">
                                <svg viewBox="0 0 100 120" width="100%" height="100%">
                                    <defs>
                                        <linearGradient id="layer-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color="rgba(255,255,255,0.78)"/>
                                            <stop offset="30%" stop-color="rgba(229,192,96,0.65)"/>
                                            <stop offset="60%" stop-color="rgba(255,255,255,0.78)"/>
                                            <stop offset="90%" stop-color="rgba(229,192,96,0.65)"/>
                                        </linearGradient>
                                        <linearGradient id="layer-grad-right" x1="100%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stop-color="rgba(255,255,255,0.78)"/>
                                            <stop offset="30%" stop-color="rgba(229,192,96,0.65)"/>
                                            <stop offset="60%" stop-color="rgba(255,255,255,0.78)"/>
                                            <stop offset="90%" stop-color="rgba(229,192,96,0.65)"/>
                                        </linearGradient>
                                    </defs>
                                    <polygon points="50,10 15,65 15,100 50,45" fill="url(#layer-grad-left)" stroke="rgba(229,192,96,0.35)"/>
                                    <polygon points="50,10 85,65 85,100 50,45" fill="url(#layer-grad-right)" stroke="rgba(229,192,96,0.35)"/>
                                    <polygon points="50,10 15,65 85,65" fill="rgba(255,255,255,0.5)" stroke="rgba(229,192,96,0.45)"/>
                                    <circle cx="50" cy="48" r="5.5" fill="#d32f2f" />
                                    <path d="M50,43 Q53,35 56,36" fill="none" stroke="#388e3c" stroke-width="1.5"/>
                                </svg>
                                <div class="slice-hbd-label">Happy B'day Teju ❤️</div>
                            </div>
                            
                            <!-- Interactive Cream Spots -->
                            <div id="cream-spot-1" class="cream-spot hide" style="top: 8px; left: 24px;"></div>
                            <div id="cream-spot-2" class="cream-spot hide" style="top: 36px; left: 45px;"></div>
                            <div id="cream-spot-3" class="cream-spot hide" style="top: 66px; left: 62px;"></div>
                        </div>
                        <div class="pedestal"></div>
                    </div>
                    
                    <!-- Matchstick (Step 1) -->
                    <div id="matchstick" class="matchstick grab">
                        <div class="match-head"></div>
                        <div class="match-stick"></div>
                    </div>
                    
                    <!-- Knife (Step 3) -->
                    <div id="cake-knife" class="cake-knife grab hide">
                        <div class="knife-blade"></div>
                        <div class="knife-handle"></div>
                    </div>
                </div>

                <!-- Control Overlays for blowing / proceeding -->
                <div class="cake-controls">
                    <div id="blow-controls" class="blow-controls-wrapper hide">
                        <button id="blow-btn" class="glass-btn blow-btn">🌬️ Blow Out Candle</button>
                        <button id="mic-toggle-btn" class="mic-toggle-btn">Use Microphone</button>
                    </div>
                    
                    <div id="wish-card" class="wish-card glass-card hide">
                        <h2 class="wish-title">${content.cakeWishTitle || ('Happy Birthday, ' + content.birthdayGirlName + '!')}</h2>
                        <p class="wish-text">${content.cakeWishCardText}</p>
                        <button id="cake-next-btn" class="glass-btn continue-btn">${content.releaseBalloonsBtnText || 'Release the Balloons'}</button>
                    </div>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#cake-confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.setupDragAndDrop();
        this.setupStepControls();
        
        // Bind Cream Spots click listeners
        this.container.querySelectorAll('.cream-spot').forEach(spot => {
            spot.addEventListener('click', (e) => this.eatCreamSpot(spot, e));
        });
        
        this.injectStyles();

        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    enter() {
        console.log("[Scene4] Entering Cake Scene...");
        
        // Switch to BGM 3 automatically on Cake Ceremony
        musicManager.playTrack(3);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        this.render();
    }

    setupDragAndDrop() {
        const match = this.container.querySelector('#matchstick');
        const flame = this.container.querySelector('#candle-flame');
        const wick = this.container.querySelector('.candle-wick');
        const knife = this.container.querySelector('#cake-knife');
        
        // Matchstick drag logic
        let activeEl = null;
        let startX = 0;
        let startY = 0;
        let originalLeft = 0;
        let originalTop = 0;

        const onStart = (e) => {
            if (this.step === 1 && e.target.closest('#matchstick')) {
                activeEl = match;
            } else if (this.step === 3 && e.target.closest('#cake-knife')) {
                activeEl = knife;
            }
            if (!activeEl) return;

            this.isDragging = true;
            activeEl.classList.remove('grab');
            activeEl.classList.add('grabbing');
            
            const touch = e.type.startsWith('touch') ? e.touches[0] : e;
            startX = touch.clientX;
            startY = touch.clientY;
            
            const rect = activeEl.getBoundingClientRect();
            originalLeft = rect.left;
            originalTop = rect.top;
            
            activeEl.style.position = 'fixed';
            activeEl.style.left = `${rect.left}px`;
            activeEl.style.top = `${rect.top}px`;
            activeEl.style.margin = '0';
            
            e.preventDefault();
        };

        const onMove = (e) => {
            if (!this.isDragging || !activeEl) return;
            
            const touch = e.type.startsWith('touch') ? e.touches[0] : e;
            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            
            activeEl.style.left = `${originalLeft + dx}px`;
            activeEl.style.top = `${originalTop + dy}px`;

            // Collision check in real-time
            if (activeEl === match) {
                const matchHead = match.querySelector('.match-head').getBoundingClientRect();
                const wickRect = wick.getBoundingClientRect();
                
                // Strike match if dragged a bit
                if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
                    match.classList.add('lit');
                }

                // If lit head overlaps wick, light candle
                if (match.classList.contains('lit') && 
                    matchHead.left < wickRect.right && 
                    matchHead.right > wickRect.left && 
                    matchHead.top < wickRect.bottom && 
                    matchHead.bottom > wickRect.top) {
                    
                    this.lightCandle();
                }
            } else if (activeEl === knife) {
                const bladeRect = knife.querySelector('.knife-blade').getBoundingClientRect();
                const cakeRect = this.container.querySelector('.cake-body').getBoundingClientRect();

                // If blade overlaps top center of the cake, slice it
                if (bladeRect.left < cakeRect.right && 
                    bladeRect.right > cakeRect.left && 
                    bladeRect.top < cakeRect.bottom && 
                    bladeRect.bottom > cakeRect.top) {
                    
                    this.sliceCake();
                }
            }
        };

        const onEnd = () => {
            if (!this.isDragging || !activeEl) return;
            this.isDragging = false;
            activeEl.classList.remove('grabbing');
            activeEl.classList.add('grab');
            
            // Return to base if not completed
            if (activeEl === match && this.step === 1) {
                match.style.position = '';
                match.style.left = '';
                match.style.top = '';
                match.classList.remove('lit');
            } else if (activeEl === knife && this.step === 3) {
                knife.style.position = '';
                knife.style.left = '';
                knife.style.top = '';
            }
            
            activeEl = null;
        };

        // Binds
        this.container.addEventListener('mousedown', onStart);
        this.container.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.container.addEventListener('touchstart', onStart, { passive: false });
        this.container.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
    }

    setupStepControls() {
        const blowBtn = this.container.querySelector('#blow-btn');
        const micBtn = this.container.querySelector('#mic-toggle-btn');
        const nextBtn = this.container.querySelector('#cake-next-btn');

        blowBtn.addEventListener('click', () => this.blowCandle());
        micBtn.addEventListener('click', () => this.toggleMicrophone());
        nextBtn.addEventListener('click', () => this.proceed());
    }

    lightCandle() {
        const flame = this.container.querySelector('#candle-flame');
        const match = this.container.querySelector('#matchstick');
        
        flame.classList.remove('hide');
        match.classList.add('hide'); // Hide matchstick
        
        // Play ignition sizzle
        this.playCandleSfx(480, 0.4);

        // Move to Step 2: Blow Candle
        this.step = 2;
        this.updateStepUI("Step 2: Make a Wish", "Take a moment to make your secret wish... Now blow out the candle!");
        
        // Reveal blow controls
        this.container.querySelector('#blow-controls').classList.remove('hide');
    }

    blowCandle() {
        const flame = this.container.querySelector('#candle-flame');
        const wick = this.container.querySelector('.candle-wick');
        const blowControls = this.container.querySelector('#blow-controls');
        const knife = this.container.querySelector('#cake-knife');
        
        flame.classList.add('hide');
        blowControls.classList.add('hide');
        
        // Create smoke puff particles on the wick location
        const wickRect = wick.getBoundingClientRect();
        const stageRect = this.container.getBoundingClientRect();
        const sx = wickRect.left - stageRect.left + 5;
        const sy = wickRect.top - stageRect.top;
        
        this.spawnSmoke(sx, sy);
        this.playCandleSfx(150, 0.2); // Low frequency puff sound

        // Stop microphone
        this.stopMicrophone();

        // Move to Step 3: Cut Cake
        setTimeout(() => {
            this.step = 3;
            this.updateStepUI("Step 3: Slice the Cake", "Pick up the golden knife and drag it down across the cake to cut a slice.");
            knife.classList.remove('hide');
        }, 1000);
    }

    sliceCake() {
        const knife = this.container.querySelector('#cake-knife');
        const cake3d = this.container.querySelector('#cake-3d');
        const slice = this.container.querySelector('#cake-slice');
        
        knife.classList.add('hide');
        cake3d.classList.add('sliced'); // split main tiers
        slice.classList.remove('hide'); // reveals zoomed-forward slice
        
        // Reveal cream spot interactive targets
        this.container.querySelectorAll('.cream-spot').forEach(spot => {
            spot.classList.remove('hide');
        });
        
        // Play slice chime
        this.playSliceChime();
        
        // Calculate cake coordinates for slice spark burst
        const cakeRect = cake3d.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        const cx = cakeRect.left - canvasRect.left + cakeRect.width / 2;
        const cy = cakeRect.top - canvasRect.top + cakeRect.height / 2;
        
        // Radial spark burst from cake slice point
        const sparkColors = ['#ffd54f', '#ffb300', '#f48fb1', '#f06292', '#e0f7fa', '#ffffff'];
        for (let i = 0; i < 60; i++) {
            this.particles.push(new Confetti(cx, cy, Math.random() * 360, sparkColors));
        }
        
        // Trigger main confetti explosion
        this.step = 4;
        this.updateStepUI("Happy Birthday!", "Celebrations have begun! Tap screen for more confetti.");
        this.spawnConfetti();

        // Reveal Greeting Wish Card
        setTimeout(() => {
            const wishCard = this.container.querySelector('#wish-card');
            wishCard.classList.remove('hide');
            // Force browser layout repaint then add show class for CSS transitions
            wishCard.offsetHeight; 
            wishCard.classList.add('show');
        }, 1200);
    }

    updateStepUI(title, desc) {
        this.container.querySelector('#cake-step-title').innerText = title;
        this.container.querySelector('#cake-step-desc').innerText = desc;
    }

    spawnSmoke(x, y) {
        this.smokeParticles = [];
        for (let i = 0; i < 20; i++) {
            this.smokeParticles.push({
                x: x,
                y: y,
                vx: Math.random() * 1.5 - 0.75,
                vy: -(Math.random() * 2 + 0.5),
                size: Math.random() * 6 + 4,
                alpha: 0.6,
                decay: Math.random() * 0.015 + 0.01
            });
        }
    }

    spawnConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#ffeb3b', '#ff9800', '#ff5722'];
        
        // Left side emitter
        for (let i = 0; i < 80; i++) {
            this.particles.push(new Confetti(0, this.canvas.height * 0.8, 60, colors));
        }
        // Right side emitter
        for (let i = 0; i < 80; i++) {
            this.particles.push(new Confetti(this.canvas.width, this.canvas.height * 0.8, 120, colors));
        }
    }

    async toggleMicrophone() {
        const micBtn = this.container.querySelector('#mic-toggle-btn');
        
        if (this.micStream) {
            this.stopMicrophone();
            micBtn.innerText = "Use Microphone";
            micBtn.classList.remove('active');
            return;
        }

        try {
            this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micBtn.innerText = "Listening... Blow!";
            micBtn.classList.add('active');

            if (!musicManager.audioCtx) musicManager.ensureAudioContext();
            
            this.audioAnalyser = musicManager.audioCtx.createAnalyser();
            const source = musicManager.audioCtx.createMediaStreamSource(this.micStream);
            source.connect(this.audioAnalyser);
            this.audioAnalyser.fftSize = 256;
            
            const bufferLength = this.audioAnalyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // Monitor mic decibels
            this.micCheckInterval = setInterval(() => {
                this.audioAnalyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const averageVolume = sum / bufferLength;
                
                // Blow threshold
                if (averageVolume > 65) {
                    console.log(`[Scene4] Blow detected! Vol: ${averageVolume}`);
                    this.blowCandle();
                }
            }, 100);

        } catch (err) {
            console.warn("[Scene4] Microphone permission denied or unavailable", err);
            micBtn.innerText = "Mic Unavailable";
            micBtn.disabled = true;
        }
    }

    stopMicrophone() {
        if (this.micCheckInterval) {
            clearInterval(this.micCheckInterval);
            this.micCheckInterval = null;
        }
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
            this.micStream = null;
        }
        this.audioAnalyser = null;
    }

    playCandleSfx(freq, duration) {
        if (!musicManager.audioCtx) return;
        
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, musicManager.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.08, musicManager.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(musicManager.audioCtx.currentTime + duration + 0.1);
    }

    playSliceChime() {
        if (!musicManager.audioCtx) return;
        
        const now = musicManager.audioCtx.currentTime;
        const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // Sweet scale arpeggio
        
        freqs.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            
            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.7);
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Confetti Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw(this.ctx);
            if (p.y > this.canvas.height) {
                this.particles.splice(i, 1);
            }
        }

        // 2. Draw Smoke Particles
        for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
            const sp = this.smokeParticles[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.alpha -= sp.decay;
            sp.size += 0.2; // expansion

            if (sp.alpha <= 0) {
                this.smokeParticles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = `rgba(180, 180, 180, ${sp.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        setTimeout(() => {
            router.navigate('scene5');
        }, 1200);
    }

    proceed() {
        this.container.classList.add('scene-exit');
        setTimeout(() => {
            router.navigate('scene5');
        }, 1200);
    }

    eatCreamSpot(spot, e) {
        if (spot.classList.contains('bitten')) return;
        spot.classList.add('bitten');
        
        // Spoon animates in
        const spoon = document.createElement('div');
        spoon.innerText = "🥄";
        spoon.style.position = 'fixed';
        spoon.style.left = `${e.clientX - 10}px`;
        spoon.style.top = `${e.clientY - 20}px`;
        spoon.style.fontSize = '22px';
        spoon.style.zIndex = '999';
        spoon.style.pointerEvents = 'none';
        spoon.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        document.body.appendChild(spoon);
        
        setTimeout(() => {
            spoon.style.transform = 'translate(-4px, 6px) rotate(-25deg)';
        }, 30);
        
        setTimeout(() => {
            spoon.style.opacity = '0';
            setTimeout(() => spoon.remove(), 400);
        }, 350);

        // Play high pitch chew tone
        this.playCandleSfx(880, 0.15);

        // Floating popup
        const bubble = document.createElement('div');
        bubble.className = 'cream-bubble';
        const msgs = ["Yumm! 😋", "So delicious!"];
        bubble.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        bubble.style.left = `${e.clientX - 30}px`;
        bubble.style.top = `${e.clientY - 25}px`;
        document.body.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1000);

        // Regenerate cream spot after 4.5 seconds
        setTimeout(() => {
            spot.classList.remove('bitten');
        }, 4500);
    }

    exit() {
        console.log("[Scene4] Exiting scene...");
        this.container.classList.add('scene-exit');
        this.stopMicrophone();
        if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    }

    destroy() {
        console.log("[Scene4] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.stopMicrophone();
        if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'cake-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #cake-confetti-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }
            .cake-layout {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                padding: 40px 20px;
            }
            .cake-instructions {
                max-width: 450px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .cake-instructions h3 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .cake-instructions p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .cake-stage {
                position: relative;
                width: 100%;
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .cake-decorations {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 0;
                overflow: hidden;
            }
            .decor-ribbon {
                position: absolute;
                top: 0;
                width: 4px;
                height: 150px;
                background: linear-gradient(to bottom, var(--color-gold), transparent);
                opacity: 0.6;
            }
            .ribbon-left { left: 12%; animation: ribbon-swing 6s infinite ease-in-out; }
            .ribbon-right { right: 12%; animation: ribbon-swing 6s infinite ease-in-out 3s; }
            
            .decor-balloon {
                position: absolute;
                font-size: 2.2rem;
                opacity: 0.65;
                animation: float-decor 5s infinite ease-in-out;
            }
            .balloon-left { left: 10%; top: 40%; }
            .balloon-right { right: 10%; top: 35%; animation-delay: 2.5s; }
            
            @keyframes ribbon-swing {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
            }
            @keyframes float-decor {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-15px) scale(1.05); }
            }
            
            /* Pedestal and Cake Wrapper */
            .cake-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 50px;
            }
            .pedestal {
                width: 180px;
                height: 12px;
                background: linear-gradient(90deg, #b0bec5, #eceff1, #90a4ae);
                border-radius: 6px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.4);
            }
            .cake-body {
                width: 150px;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                transition: transform 0.8s ease;
            }
            .cake-body.sliced {
                transform: translateX(-15px) rotate(-2deg);
            }
            .cake-tier {
                position: relative;
                background: linear-gradient(to right, rgba(229, 192, 96, 0.12), rgba(255, 255, 255, 0.22) 50%, rgba(229, 192, 96, 0.10));
                border-left: 1.5px solid rgba(229, 192, 96, 0.35);
                border-right: 1.5px solid rgba(229, 192, 96, 0.35);
                border-bottom: 1.5px solid rgba(229, 192, 96, 0.35);
                border-radius: 0 0 50% 50% / 0 0 15px 15px;
                box-shadow: inset 0 -2px 5px rgba(255, 255, 255, 0.05), 0 5px 15px rgba(0,0,0,0.45);
                transform-style: preserve-3d;
            }
            .tier-top-cap, .tier-mid-cap, .tier-base-cap {
                position: absolute;
                border: 1px solid rgba(229, 192, 96, 0.32);
                background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.32), rgba(229, 192, 96, 0.22));
                border-radius: 50%;
            }
            .tier-top-cap { width: 100%; height: 12px; top: -6px; left: -1px; }
            .tier-mid-cap { width: 100%; height: 16px; top: -8px; left: -1px; }
            .tier-base-cap { width: 100%; height: 20px; top: -10px; left: -1px; }

            .tier-base { width: 140px; height: 35px; }
            .tier-mid { width: 100px; height: 30px; margin-top: -6px; z-index: 2; }
            .tier-top { width: 60px; height: 25px; margin-top: -6px; z-index: 3; }
            
            /* Interactive Candle */
            .cake-candle {
                position: absolute;
                top: -26px;
                width: 6px;
                height: 25px;
                background: linear-gradient(90deg, #f06292, #f8bbd0, #f06292);
                border-radius: 3px;
                z-index: 5;
            }
            .candle-wick {
                position: absolute;
                top: -4px;
                left: 2px;
                width: 2px;
                height: 4px;
                background: #444;
            }
            .candle-flame {
                position: absolute;
                top: -16px;
                left: -4px;
                width: 14px;
                height: 18px;
                background: radial-gradient(circle at bottom, #ffeb3b, #ff9800 60%, #ff5722 80%);
                border-radius: 50% 50% 20% 20%;
                filter: blur(0.5px);
                box-shadow: 0 0 12px rgba(255, 152, 0, 0.65);
                animation: flicker 0.15s infinite alternate;
                transform-origin: center bottom;
            }

            /* Zoom wedge slice */
            .cake-slice-piece {
                position: absolute;
                bottom: 12px;
                right: 32px;
                width: 90px;
                height: 108px;
                z-index: 20;
                transform-style: preserve-3d;
                opacity: 0;
                transform: translate(0, 0) scale(0.6);
                transition: all 1.5s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .cake-body.sliced .cake-slice-piece {
                opacity: 1;
                transform: translate(45px, -15px) scale(1.15) rotate(12deg);
                animation: float-slice 3s infinite ease-in-out alternate;
            }
            @keyframes float-slice {
                0% { transform: translate(45px, -15px) scale(1.15) rotate(12deg) translateY(0); }
                100% { transform: translate(45px, -15px) scale(1.15) rotate(12deg) translateY(-8px); }
            }
            .slice-hbd-label {
                position: absolute;
                bottom: -20px;
                left: 50%;
                transform: translateX(-50%);
                font-family: var(--font-serif);
                font-size: 0.65rem;
                color: var(--color-rose-gold);
                white-space: nowrap;
                text-shadow: 0 0 8px rgba(244,143,177,0.4);
                font-weight: 700;
                animation: pulse 1.5s infinite;
            }

            /* Matchstick (Step 1) */
            .matchstick {
                position: absolute;
                bottom: 30px;
                right: 40px;
                width: 8px;
                height: 80px;
                cursor: grab;
                transform-origin: top center;
                transition: transform 0.2s ease;
                z-index: 10;
            }
            .match-head {
                width: 8px;
                height: 12px;
                background: #b71c1c;
                border-radius: 4px 4px 2px 2px;
            }
            .match-stick {
                width: 4px;
                height: 68px;
                background: #d7ccc8;
                margin-left: 2px;
                border-radius: 0 0 1px 1px;
            }
            .matchstick.lit .match-head {
                background: radial-gradient(circle, #ffe082, #ff8f00);
                box-shadow: 0 0 15px #ffa000;
                animation: flicker 0.1s infinite alternate;
            }
            .matchstick.grabbing { cursor: grabbing; }

            /* Knife (Step 3) */
            .cake-knife {
                position: absolute;
                bottom: 30px;
                left: 40px;
                width: 90px;
                height: 25px;
                cursor: grab;
                transform: rotate(-35deg);
                display: flex;
                z-index: 10;
            }
            .knife-blade {
                width: 60px;
                height: 12px;
                background: linear-gradient(180deg, #cfd8dc, #eceff1, #90a4ae);
                border-radius: 20px 4px 4px 20px;
                border-top: 1px solid white;
            }
            .knife-handle {
                width: 30px;
                height: 12px;
                background: #5d4037;
                border-radius: 0 4px 4px 0;
            }
            .cake-knife.grabbing { cursor: grabbing; }

            /* Control Overlays */
            .cake-controls {
                width: 100%;
                display: flex;
                justify-content: center;
                min-height: 80px;
            }
            .blow-controls-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                animation: scale-up 0.5s ease forwards;
            }
            .mic-toggle-btn {
                background: none;
                border: none;
                color: var(--color-text-muted);
                text-decoration: underline;
                font-size: 0.75rem;
                cursor: pointer;
                outline: none;
            }
            .mic-toggle-btn.active {
                color: var(--color-rose-gold);
                animation: pulse-shimmer 1s infinite alternate;
            }
            .wish-card {
                max-width: 480px;
                width: 90%;
                padding: 30px;
                text-align: center;
                border: 1px solid rgba(229, 192, 96, 0.2);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
            }
            .wish-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.4rem;
                letter-spacing: 2px;
                margin-bottom: 15px;
            }
            .wish-text {
                font-size: 0.85rem;
                line-height: 1.6;
                color: var(--color-text-secondary);
                margin-bottom: 20px;
            }
            .grab { cursor: grab; }
            
            /* --- EASTER EGGS STYLES (Cream, Golgappa) --- */
            .cream-spot {
                position: absolute;
                width: 14px;
                height: 14px;
                background: radial-gradient(circle at 30% 30%, #fff, #eeeeee);
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.7);
                box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 5px rgba(255,255,255,0.4);
                cursor: pointer;
                z-index: 6;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
            }
            .cream-spot:hover {
                transform: scale(1.35);
                box-shadow: 0 0 10px rgba(255,255,255,0.9);
            }
            .cream-spot.bitten {
                transform: scale(0);
                opacity: 0;
                pointer-events: none;
            }
            .cream-bubble {
                position: absolute;
                background: var(--color-rose-gold);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.65rem;
                font-weight: 600;
                pointer-events: none;
                z-index: 999;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                animation: float-rise 1s ease forwards;
            }
            @keyframes float-rise {
                0% { transform: translateY(0); opacity: 1; }
                100% { transform: translateY(-25px); opacity: 0; }
            }
            
            /* Golgappa Stall */
            .golgappa-stall {
                position: absolute;
                bottom: 20px;
                right: 40px;
                width: 160px;
                padding: 12px;
                text-align: center;
                border: 1px solid rgba(229, 192, 96, 0.12);
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                z-index: 8;
                animation: float-slow 6s infinite ease-in-out;
            }
            .stall-title {
                font-family: var(--font-serif);
                font-size: 0.62rem;
                font-weight: 700;
                letter-spacing: 1px;
                color: var(--color-gold);
                text-transform: uppercase;
                margin-bottom: 8px;
            }
            .stall-plate {
                position: relative;
                width: 100%;
                height: 52px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 5px;
                padding: 5px;
                box-shadow: inset 0 2px 10px rgba(0,0,0,0.4);
            }
            .golgappa {
                width: 22px;
                height: 20px;
                background: radial-gradient(circle at 35% 35%, #ffe082, #f57f17);
                border-radius: 50% 50% 48% 48%;
                box-shadow: inset -2px -2px 5px rgba(0,0,0,0.3), 0 3px 5px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.25s ease, opacity 0.25s ease;
            }
            .golgappa:hover {
                transform: scale(1.15) translateY(-2px);
            }
            .golgappa.eaten {
                opacity: 0;
                transform: scale(0);
                pointer-events: none;
            }
            .stall-bubble {
                position: absolute;
                bottom: 90px;
                left: 50%;
                transform: translateX(-50%);
                background: #ffe082;
                color: var(--color-bg-darkest);
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.65rem;
                font-weight: 600;
                white-space: normal;
                width: 180px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                transition: opacity 0.3s ease;
                z-index: 10;
                line-height: 1.3;
            }
            
            @media (max-width: 768px) {
                .golgappa-stall {
                    position: relative;
                    bottom: auto;
                    right: auto;
                    margin-top: 20px;
                    width: 200px;
                    order: 3; /* place below pedestal in flex stack */
                }
                .stall-bubble {
                    bottom: auto;
                    top: -65px;
                }
            }
            @media (max-width: 480px) {
                .cake-layout { padding: 20px 10px; }
                .matchstick { right: 20px; }
                .cake-knife { left: 20px; }
                .pedestal { width: 140px; }
                .cake-body { width: 120px; }
                .tier-base { width: 110px; }
                .tier-mid { width: 80px; }
                .tier-top { width: 50px; }
                #cream-spot-1 { left: 18px; }
                #cream-spot-2 { left: 34px; }
                #cream-spot-3 { left: 48px; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Confetti Particle Class
class Confetti {
    constructor(x, y, angleDeg, colors) {
        this.x = x;
        this.y = y;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Convert base angle to radians and add spread
        const angle = (angleDeg * Math.PI / 180) + (Math.random() * 0.8 - 0.4);
        const power = Math.random() * 12 + 6;
        
        this.vx = Math.cos(angle) * power;
        this.vy = -Math.sin(angle) * power; // upward force
        
        this.sizeX = Math.random() * 6 + 4;
        this.sizeY = Math.random() * 10 + 6;
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.2 - 0.1;
        this.gravity = 0.25;
        this.drag = 0.98;
    }

    update() {
        this.vx *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        // Drawing rotating rectangle
        ctx.fillRect(-this.sizeX / 2, -this.sizeY / 2, this.sizeX, this.sizeY);
        ctx.restore();
    }
}
