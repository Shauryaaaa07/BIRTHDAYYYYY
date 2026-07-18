/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 6: SURPRISE GIFT BOX (scene6.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';
import { mediaConfig } from '../js/mediaConfig.js';

export class Scene6 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        
        this.particles = [];
        
        // Subtitle tracks for Video 1
        this.subtitles = [
            "Every birthday is a new chapter...",
            "But some chapters are written in gold.",
            "This video is a small compilation of our laughter...",
            "A collection of the moments that make us best friends.",
            "Enjoy this little surprise made just for you, Teju! ❤️"
        ];
        this.subtitleIndex = 0;
        this.videoTimer = null;
        this.videoElement = null;
        
        // Video Fallback Canvas Render properties
        this.videoFallbackFrameId = null;
        this.videoFallbackTimer = null;
    }

    init() {
        console.log("[Scene6] Initializing Gift Box Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene6-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="gift-glow-canvas"></canvas>
            
            <div class="gift-layout">
                <div class="gift-instructions glass-card">
                    <h3 id="gift-step-title">A Surprise For You</h3>
                    <p id="gift-step-desc">Tap the golden bow to open ${content.birthdayGirlName}'s birthday box.</p>
                </div>
                
                <div class="gift-stage">
                    <!-- The Gift Box Container -->
                    <div id="gift-box" class="gift-box">
                        <!-- Golden Ribbon wrapping -->
                        <div class="ribbon-vertical"></div>
                        <div class="ribbon-horizontal"></div>
                        
                        <!-- Bow knot (interactive) -->
                        <div id="gift-bow" class="gift-bow-knot">
                            <svg viewBox="0 0 100 60" width="120" height="72">
                                <path id="ribbon-l" class="ribbon-path" d="M50,30 C30,10 10,20 10,35 C10,50 35,45 50,30 Z" fill="none" stroke="#e5c060" stroke-width="4"/>
                                <path id="ribbon-r" class="ribbon-path" d="M50,30 C70,10 90,20 90,35 C90,50 65,45 50,30 Z" fill="none" stroke="#e5c060" stroke-width="4"/>
                                <circle cx="50" cy="30" r="7" fill="#e5c060"/>
                            </svg>
                        </div>
                        
                        <!-- Lid -->
                        <div class="gift-lid"></div>
                        
                        <!-- Box base -->
                        <div class="gift-base"></div>
                    </div>
                </div>

                <!-- Floating Invite message popup card -->
                <div id="gift-card-popup" class="gift-card-popup glass-card hide">
                    <div class="gift-card-butterfly">🦋</div>
                    <h2 class="gift-card-title">${content.giftCardTitle || 'A Surprise Awaits...'}</h2>
                    <p class="gift-card-text">"${content.giftCardText || 'Inside this box lies a collection of memories and a special video message made just for you. Are you ready to unwrap it?'}"</p>
                    <button id="gift-confirm-open-btn" class="glass-btn gift-card-btn">${content.openBoxBtnText || 'Open the Box ✨'}</button>
                </div>
 
                <!-- Video Player Container (Renders post-opening) -->
                <div id="video-player-container" class="video-player-container glass-card hide">
                    <div class="video-frame">
                        <!-- Target Video 1 -->
                         <video id="gift-video" class="hide" preload="auto" playsinline webkit-playsinline>
                             <source src="${mediaConfig.videos.video1}" type="video/mp4">
                             Your browser does not support HTML5 video.
                         </video>
                        <!-- Fallback Visual Canvas -->
                        <canvas id="video-fallback-canvas" class="hide"></canvas>
                    </div>
                    <button id="video-skip-btn" class="glass-btn video-btn">${content.proceedToMemoriesBtnText || 'Proceed to Memories'}</button>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#gift-glow-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.injectStyles();
        
        // Tap bow triggers popup card first
        this.container.querySelector('#gift-bow').addEventListener('click', () => this.showCardPopup());
        
        // Confirm open button inside popup card triggers box unraveling
        this.container.querySelector('#gift-confirm-open-btn').addEventListener('click', () => {
            this.hideCardPopup();
            this.openBox();
        });

        // Skip/proceed button
        this.container.querySelector('#video-skip-btn').addEventListener('click', () => this.proceed());

        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    enter() {
        console.log("[Scene6] Entering Gift Box Scene...");
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        this.render();
    }

    showCardPopup() {
        console.log("[Scene6] Revealing gift envelope/card...");
        const popup = this.container.querySelector('#gift-card-popup');
        popup.classList.remove('hide');
        popup.offsetHeight;
        popup.classList.add('show');
        
        this.playChimeTone(659.25); // bell note
    }

    hideCardPopup() {
        const popup = this.container.querySelector('#gift-card-popup');
        popup.classList.remove('show');
        setTimeout(() => popup.classList.add('hide'), 500);
    }

    playChimeTone(freq) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(now + 0.5);
    }

    openBox() {
        console.log("[Scene6] Opening box visual sequences...");
        
        const box = this.container.querySelector('#gift-box');
        const ribbonL = this.container.querySelector('#ribbon-l');
        const ribbonR = this.container.querySelector('#ribbon-r');
        
        // Play opening chord
        this.playOpenSfx();

        // 1. Untie ribbon (trigger CSS transition offsets)
        ribbonL.style.animation = 'ribbon-unravel-left 0.8s ease forwards';
        ribbonR.style.animation = 'ribbon-unravel-right 0.8s ease forwards';
        this.container.querySelector('.ribbon-vertical').classList.add('unraveled');
        this.container.querySelector('.ribbon-horizontal').classList.add('unraveled');
        this.container.querySelector('#gift-bow').classList.add('unraveled');

        // 2. Open Lid in 3D after untying completes (800ms)
        setTimeout(() => {
            box.classList.add('opened');
            this.spawnGlowParticles();
        }, 800);

        // 3. Reveal and Play Video after lid lifts (2200ms)
        setTimeout(() => {
            box.classList.add('fade-out-box');
            this.revealVideoPlayer();
        }, 2200);
    }

    playOpenSfx() {
        if (!musicManager.audioCtx) return;
        
        const now = musicManager.audioCtx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Sweet C Major Chord
        
        notes.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            
            gain.gain.setValueAtTime(0, now + idx * 0.04);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.04 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 1.2);
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start(now + idx * 0.04);
            osc.stop(now + idx * 0.04 + 1.3);
        });
    }

    spawnGlowParticles() {
        const boxRect = this.container.querySelector('#gift-box').getBoundingClientRect();
        const stageRect = this.container.getBoundingClientRect();
        const bx = boxRect.left - stageRect.left + boxRect.width / 2;
        const by = boxRect.top - stageRect.top + boxRect.height / 2 - 20;

        // Spawn a rich mix of 120 particles (rose petals, jasmines, stars)
        for (let i = 0; i < 120; i++) {
            const r = Math.random();
            let type = 'star';
            let color = '#e5c060';
            let size = Math.random() * 4 + 2;
            
            if (r < 0.45) {
                type = 'rose-petal';
                color = Math.random() > 0.5 ? '#d81b60' : '#ec407a'; // Rose red / Deep pink
                size = Math.random() * 7 + 5;
            } else if (r < 0.75) {
                type = 'jasmine';
                color = '#ffffff'; // White jasmine
                size = Math.random() * 5 + 3.5;
            }
            
            this.particles.push({
                x: bx,
                y: by,
                type: type,
                vx: Math.random() * 5 - 2.5,
                vy: -(Math.random() * 6 + 4), // Initial upward shoot velocity
                size: size,
                color: color,
                alpha: 1.0,
                decay: Math.random() * 0.009 + 0.005, // Slower decay for long romantic drift
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: Math.random() * 0.06 - 0.03,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.03 + 0.015
            });
        }
    }

    revealVideoPlayer() {
        const videoContainer = this.container.querySelector('#video-player-container');
        videoContainer.classList.remove('hide');
        this.container.querySelector('.gift-instructions').classList.add('hide');

        // Check if Video 1 exists in assets
        const isVideoAvailable = true;
        
        this.videoElement = this.container.querySelector('#gift-video');
        const canvasFallback = this.container.querySelector('#video-fallback-canvas');

        if (isVideoAvailable) {
            console.log("[Scene6] Playing actual video...");
            this.videoElement.classList.remove('hide');
            this.videoElement.play().catch(err => {
                console.warn("[Scene6] Video playback failed, falling back to canvas", err);
                this.startVideoFallback(canvasFallback);
            });
        } else {
            console.log("[Scene6] Video missing, initiating synthesizer canvas fallback...");
            this.startVideoFallback(canvasFallback);
        }
    }

    startVideoFallback(canvas) {
        canvas.classList.remove('hide');
        const cCtx = canvas.getContext('2d');
        canvas.width = 480;
        canvas.height = 270;

        let frame = 0;
        const drawFallback = () => {
            if (this.container.classList.contains('scene-exit')) return;
            frame++;
            
            cCtx.fillStyle = '#060a17';
            cCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            cCtx.save();
            cCtx.translate(canvas.width / 2, canvas.height / 2);
            cCtx.rotate(frame * 0.008);
            
            for (let i = 0; i < 6; i++) {
                cCtx.rotate(Math.PI / 3);
                cCtx.beginPath();
                cCtx.ellipse(0, 0, 70 + Math.sin(frame * 0.04) * 8, 16, 0, 0, Math.PI * 2);
                cCtx.strokeStyle = 'rgba(229, 192, 96, 0.12)';
                cCtx.stroke();
            }
            cCtx.restore();

            cCtx.beginPath();
            cCtx.arc(canvas.width / 2, canvas.height / 2, 45, 0, Math.PI * 2);
            cCtx.fillStyle = 'rgba(195, 132, 139, 0.05)';
            cCtx.fill();
            cCtx.strokeStyle = 'rgba(195, 132, 139, 0.2)';
            cCtx.stroke();
            
            cCtx.font = "italic 11px Montserrat";
            cCtx.fillStyle = "rgba(255,255,255,0.45)";
            cCtx.textAlign = "center";
            cCtx.fillText("Cinematic Video 1: Friendship Compilation", canvas.width / 2, canvas.height / 2 + 5);

            this.videoFallbackFrameId = requestAnimationFrame(drawFallback);
        };
        
        drawFallback();

        // Synthesize nice arpeggio loop for fallback audio
        const playSynthBeats = () => {
            if (this.container.classList.contains('scene-exit')) return;
            if (musicManager.audioCtx) {
                const now = musicManager.audioCtx.currentTime;
                const root = 440; // A4
                [root, root * 1.25, root * 1.5, root * 1.875].forEach((freq, idx) => {
                    const osc = musicManager.audioCtx.createOscillator();
                    const gain = musicManager.audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now + idx * 0.15);
                    gain.gain.setValueAtTime(0, now + idx * 0.15);
                    gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.15 + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.6);
                    osc.connect(gain);
                    gain.connect(musicManager.masterGain);
                    osc.start(now + idx * 0.15);
                    osc.stop(now + idx * 0.15 + 0.7);
                });
            }
            this.videoFallbackTimer = setTimeout(playSynthBeats, 2500);
        };
        playSynthBeats();
    }

    render() {
        this.time++;
        
        // Sky glow background clears
        this.ctx.fillStyle = 'rgba(4, 4, 12, 0.22)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & Render sparkles, petals, and stars
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Add a horizontal drift/wobble effect for organic floating
            p.wobble += p.wobbleSpeed;
            p.x += p.vx + Math.sin(p.wobble) * 0.4;
            p.y += p.vy;
            p.rotation += p.rotSpeed;
            p.alpha -= p.decay;
            
            // Apply slight gravity to make petals float down gently after initial rise
            p.vy += 0.06; 
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillStyle = p.color;

            if (p.type === 'rose-petal') {
                // Draw a beautiful organic petal silhouette
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.bezierCurveTo(-p.size, -p.size * 0.6, -p.size * 0.6, p.size, 0, p.size * 1.25);
                this.ctx.bezierCurveTo(p.size * 0.6, p.size, p.size, -p.size * 0.6, 0, 0);
                this.ctx.fill();
            } else if (p.type === 'jasmine') {
                // Draw a 5-petal jasmine flower
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = '#fff';
                for (let k = 0; k < 5; k++) {
                    this.ctx.rotate((Math.PI * 2) / 5);
                    this.ctx.beginPath();
                    this.ctx.ellipse(p.size * 0.5, 0, p.size * 0.5, p.size * 0.25, 0, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                // Draw yellow center core
                this.ctx.fillStyle = '#ffeb3b';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size * 0.18, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Draw a 4-point sparkle star
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = p.color;
                this.ctx.beginPath();
                for (let k = 0; k < 4; k++) {
                    this.ctx.rotate(Math.PI / 2);
                    this.ctx.lineTo(p.size * 1.5, 0);
                    this.ctx.lineTo(0, p.size * 0.35);
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        
        // Stop any videos playing
        if (this.videoElement) {
            this.videoElement.pause();
        }
        if (this.videoFallbackTimer) {
            clearTimeout(this.videoFallbackTimer);
        }
        if (this.videoFallbackFrameId) {
            cancelAnimationFrame(this.videoFallbackFrameId);
        }

        setTimeout(() => {
            router.navigate('scene7');
        }, 1200);
    }

    exit() {
        console.log("[Scene6] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.videoElement) this.videoElement.pause();
        if (this.videoFallbackTimer) clearTimeout(this.videoFallbackTimer);
    }

    destroy() {
        console.log("[Scene6] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.videoFallbackFrameId) cancelAnimationFrame(this.videoFallbackFrameId);
        if (this.videoFallbackTimer) clearTimeout(this.videoFallbackTimer);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'gift-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #gift-glow-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }
            .gift-layout {
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
            .gift-instructions {
                max-width: 450px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .gift-instructions h3 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .gift-instructions p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .gift-stage {
                width: 100%;
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            /* Enlarged 3D Box Container */
            .gift-box {
                position: relative;
                width: 220px;
                height: 210px;
                transform-style: preserve-3d;
                transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease;
                cursor: pointer;
            }
            .gift-box.opened {
                transform: translateY(30px) rotateX(15deg);
            }
            .gift-box.fade-out-box {
                opacity: 0;
                transform: scale(0.5) translateY(200px);
                pointer-events: none;
            }
            .gift-base {
                position: absolute;
                bottom: 0;
                width: 220px;
                height: 170px;
                background: linear-gradient(135deg, #0d1e3d, #050a18);
                border: 1.5px solid rgba(229, 192, 96, 0.25);
                border-radius: 4px;
                box-shadow: 0 10px 35px rgba(0,0,0,0.65);
            }
            .gift-lid {
                position: absolute;
                top: 32px;
                left: -5px;
                width: 230px;
                height: 35px;
                background: linear-gradient(135deg, #11254a, #070e22);
                border: 1.5px solid rgba(229, 192, 96, 0.35);
                border-radius: 4px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                z-index: 5;
                transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .gift-box.opened .gift-lid {
                transform: translateY(-90px) rotateX(-110deg) rotateY(15deg) scale(0.85);
                opacity: 0;
            }
            
            /* Golden Ribbon */
            .ribbon-vertical {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: 22px;
                height: 100%;
                background: #e5c060;
                box-shadow: 0 0 10px rgba(229,192,96,0.3);
                z-index: 2;
                transition: height 0.6s ease;
            }
            .ribbon-horizontal {
                position: absolute;
                top: 55%;
                transform: translateY(-50%);
                width: 100%;
                height: 22px;
                background: #e5c060;
                box-shadow: 0 0 10px rgba(229,192,96,0.3);
                z-index: 2;
                transition: width 0.6s ease;
            }
            .ribbon-vertical.unraveled { height: 0%; }
            .ribbon-horizontal.unraveled { width: 0%; }
            
            /* Bow Knot */
            .gift-bow-knot {
                position: absolute;
                top: -6px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 6;
                transition: opacity 0.5s ease, transform 0.5s ease;
                cursor: pointer;
            }
            .gift-bow-knot.unraveled {
                opacity: 0;
                transform: translateX(-50%) scale(0.5);
                pointer-events: none;
            }
            .ribbon-path {
                stroke-dasharray: 200;
                stroke-dashoffset: 0;
                transition: stroke-dashoffset 0.8s ease;
            }

            /* Floating Invite Message Popup Card */
            .gift-card-popup {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.9);
                max-width: 420px;
                width: 90%;
                padding: 25px;
                text-align: center;
                z-index: 50;
                opacity: 0;
                pointer-events: auto;
                transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                border-color: rgba(229, 192, 96, 0.3);
            }
            .gift-card-popup.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .gift-card-butterfly {
                font-size: 2.5rem;
                margin-bottom: 12px;
                animation: float-slow 4s infinite ease-in-out;
            }
            .gift-card-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.25rem;
                margin-bottom: 10px;
                letter-spacing: 1px;
            }
            .gift-card-text {
                font-size: 0.85rem;
                line-height: 1.5;
                color: var(--color-text-secondary);
                margin-bottom: 20px;
                font-style: italic;
            }
            .gift-card-btn {
                width: 100%;
                font-size: 0.75rem;
            }

            /* Video Player Screen Overlay Centered absolutely */
            .video-player-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.92);
                max-width: 800px;
                width: 95%;
                padding: 25px;
                display: flex;
                flex-direction: column;
                align-items: center;
                animation: scale-up-center 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                border: 1px solid rgba(229, 192, 96, 0.25);
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(229, 192, 96, 0.05);
                z-index: 60;
            }
            @keyframes scale-up-center {
                0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            .video-frame {
                position: relative;
                width: 100%;
                aspect-ratio: 16/9;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--color-glass-border);
                margin-bottom: 20px;
            }
            #gift-video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            #video-fallback-canvas {
                width: 100%;
                height: 100%;
            }
            .video-btn {
                border-color: rgba(229, 192, 96, 0.3);
            }
            
            @media (max-width: 480px) {
                .video-player-container { padding: 15px; }
                .video-subtitles { font-size: 0.75rem; bottom: 8px; }
            }
        `;
        document.head.appendChild(style);
    }
}
