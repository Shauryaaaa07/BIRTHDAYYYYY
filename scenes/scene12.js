/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 12: CRYSTAL SURPRISE (scene12.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';
import { mediaConfig } from '../js/mediaConfig.js';

export class Scene12 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.videoElement = null;
        
        this.animationFrameId = null;
        this.fallbackTimer = null;
        this.subtitleIndex = 0;
        
        this.time = 0;
        this.sparks = [];
        
        this.drawClimaxText = false;
        this.climaxTextAlpha = 0;
        
        this.hasBurst = false;
    }

    init() {
        console.log("[Scene12] Initializing Crystal Surprise Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene12-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="crystal-bg-canvas"></canvas>
            
            <div class="crystal-layout">
                <div class="crystal-header glass-card">
                    <h2>Reliving Memories</h2>
                    <p>Reliving the beautiful moments that made us who we are today.</p>
                </div>
                
                <div class="crystal-video-frame glass-card">
                    <video id="crystal-video" class="hide" preload="auto">
                        <source src="${mediaConfig.videos.video3}" type="video/mp4">
                    </video>
                    <canvas id="crystal-fallback" class="hide"></canvas>
                    <div id="crystal-subtitles" class="crystal-subtitles"></div>
                </div>
                
                <button id="crystal-next-btn" class="glass-btn crystal-btn">View Final Surprise</button>
                
                <!-- Climax Gift Reveal Container (hidden by default) -->
                <div id="climax-gift-container" class="climax-gift-container glass-card hide">
                    <div class="gift-bouquet">💐</div>
                    <h2 class="gift-bouquet-title">${content.climaxGiftTitle || 'Here is a gift for you...'}</h2>
                    <p class="gift-bouquet-desc">${content.climaxGiftMessage || 'This digital bouquet represents 19 warm wishes.'}</p>
                    
                    <div class="gift-envelope-btn-wrapper">
                        <button id="climax-open-letter-btn" class="glass-btn read-letter-btn">Read Handwritten Promise ✉️</button>
                    </div>
                    
                    <button id="climax-proceed-btn" class="glass-btn proceed-next-btn hide" style="margin-top:20px;">Step Into Lantern Night Sky 🌟</button>
                    
                    <!-- Small Handwritten Letter Popup -->
                    <div id="climax-letter-popup" class="climax-letter-popup glass-card hide">
                        <h3 class="climax-letter-title">${content.climaxLetterTitle || 'A Handwritten Promise'}</h3>
                        <p class="climax-letter-text">${content.climaxLetterContent || 'May you fly higher than the stars...'}</p>
                        <button id="climax-close-letter-btn" class="glass-btn close-letter-btn">Close Card</button>
                    </div>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#crystal-bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup background sparkles
        this.setupSparkles();
        
        // Bind next button to trigger cracker burst
        this.container.querySelector('#crystal-next-btn').addEventListener('click', () => this.triggerClimaxCracker());
        
        // Bouquet interaction buttons
        this.container.querySelector('#climax-open-letter-btn').addEventListener('click', () => this.openClimaxLetter());
        this.container.querySelector('#climax-close-letter-btn').addEventListener('click', () => this.closeClimaxLetter());
        this.container.querySelector('#climax-proceed-btn').addEventListener('click', () => this.proceed());
        
        this.injectStyles();
        return this.container;
    }

    setupSparkles() {
        this.sparks = [];
        for (let i = 0; i < 35; i++) {
            this.sparks.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.015 + 0.005,
                dir: Math.random() > 0.5 ? 1 : -1,
                isCrackerSpark: false
            });
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.setupSparkles();
        }
    }

    enter() {
        console.log("[Scene12] Entering Crystal Surprise...");
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
        
        this.render();
        this.playVideo();
    }

    playVideo() {
        const video = this.container.querySelector('#crystal-video');
        const canvas = this.container.querySelector('#crystal-fallback');
        
        const videoPath = mediaConfig.videos.video3;
        const isVideoAvailable = window.assetRegistry && window.assetRegistry.videos[videoPath];
        
        if (isVideoAvailable) {
            video.classList.remove('hide');
            this.videoElement = video;
            video.play().catch(err => {
                console.warn("[Scene12] Video play failed, using canvas fallback", err);
                this.playVideoFallback(canvas);
            });
            video.addEventListener('ended', () => this.triggerClimaxCracker());
        } else {
            this.playVideoFallback(canvas);
        }
    }

    playVideoFallback(canvas) {
        canvas.classList.remove('hide');
        const cCtx = canvas.getContext('2d');
        canvas.width = 480;
        canvas.height = 270;
        
        let frame = 0;
        const fSparks = [];
        for (let i = 0; i < 20; i++) {
            fSparks.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.2 + 0.4,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005
            });
        }

        const render = () => {
            if (this.container.classList.contains('scene-exit') || this.hasBurst) return;
            frame++;
            
            cCtx.fillStyle = '#050512';
            cCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            fSparks.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 0.9 || s.alpha < 0.1) s.speed = -s.speed;
                
                cCtx.fillStyle = `rgba(229, 192, 96, ${s.alpha})`;
                cCtx.beginPath();
                cCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                cCtx.fill();
            });
            
            cCtx.font = "3.2rem Arial";
            cCtx.fillStyle = `rgba(0, 229, 255, ${0.05 + Math.sin(frame * 0.03) * 0.03})`;
            cCtx.textAlign = "center";
            cCtx.fillText("💎", canvas.width / 2, canvas.height / 2 + 15);
            
            this.videoFallbackFrameId = requestAnimationFrame(render);
        };
        render();

        // Slide subtitles
        const subContainer = this.container.querySelector('#crystal-subtitles');
        const subtitles = content.endingQuotes.vid3Subtitles;
        this.subtitleIndex = 0;
        
        const showNext = () => {
            if (this.hasBurst) return;
            if (this.subtitleIndex < subtitles.length) {
                subContainer.innerText = subtitles[this.subtitleIndex];
                this.subtitleIndex++;
                this.fallbackTimer = setTimeout(showNext, 3800);
            } else {
                subContainer.innerText = "❤️";
            }
        };
        showNext();
    }

    triggerClimaxCracker() {
        if (this.hasBurst) return;
        this.hasBurst = true;
        
        console.log("[Scene12] Climax cracker burst starting...");
        
        // Stop playback
        if (this.videoElement) this.videoElement.pause();
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        
        // Hide video panels
        this.container.querySelector('.crystal-video-frame').classList.add('hide');
        this.container.querySelector('.crystal-header').classList.add('hide');
        this.container.querySelector('#crystal-next-btn').classList.add('hide');
        
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.42;
        
        // Stage 1: Massive Center Burst (180 sparks, gold/white/rose-gold)
        this.spawnBurst(cx, cy, 180, ['#ffffff', '#ffd54f', '#ffb300', '#ff80ab', '#e5c060']);
        this.playCrackerChord();
        
        // Stage 2: Left and Right bursts after 300ms and 550ms
        setTimeout(() => {
            this.spawnBurst(cx - 160, cy - 60, 90, ['#80deea', '#ffd54f', '#ff4081', '#ffffff']);
            this.playCrackerChord();
        }, 300);
        
        setTimeout(() => {
            this.spawnBurst(cx + 160, cy - 60, 90, ['#a5d6a7', '#ffeb3b', '#ff4081', '#ffffff']);
            this.playCrackerChord();
        }, 550);
        
        // Trigger spelling text
        this.drawClimaxText = true;
        this.climaxTextAlpha = 0;
        
        // Slide up bouquet reveal card
        setTimeout(() => {
            const bouquet = this.container.querySelector('#climax-gift-container');
            bouquet.classList.remove('hide');
            bouquet.offsetHeight;
            bouquet.classList.add('show');
        }, 2200); // slightly delayed to let the fireworks finish popping
    }

    spawnBurst(x, y, count, colors) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8.5 + 2.5;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.0,
                size: Math.random() * 4.5 + 2.0,
                alpha: 1.0,
                decay: Math.random() * 0.015 + 0.008,
                color: colors[Math.floor(Math.random() * colors.length)],
                isCrackerSpark: true
            });
        }
    }

    playCrackerChord() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const scale = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major sweeping chords
        
        scale.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 1.2);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 1.3);
        });
    }

    openClimaxLetter() {
        const popup = this.container.querySelector('#climax-letter-popup');
        popup.classList.remove('hide');
        popup.offsetHeight;
        popup.classList.add('show');
        this.playChimeBell(587.33); // D5 chime
    }

    closeClimaxLetter() {
        const popup = this.container.querySelector('#climax-letter-popup');
        popup.classList.remove('show');
        setTimeout(() => {
            popup.classList.add('hide');
            // Reveal final next proceed button
            const proceedBtn = this.container.querySelector('#climax-proceed-btn');
            proceedBtn.classList.remove('hide');
        }, 500);
    }

    playChimeBell(freq) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(now + 0.6);
    }

    render() {
        this.time++;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Clear background
        this.ctx.fillStyle = '#030208';
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw soft, glowing rose-gold nebula cloud
        let g1 = this.ctx.createRadialGradient(w * 0.3, h * 0.35, 0, w * 0.3, h * 0.35, w * 0.55);
        g1.addColorStop(0, 'rgba(195, 132, 139, 0.12)');
        g1.addColorStop(0.5, 'rgba(195, 132, 139, 0.05)');
        g1.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = g1;
        this.ctx.fillRect(0, 0, w, h);

        // Draw soft, glowing gold nebula cloud
        let g2 = this.ctx.createRadialGradient(w * 0.75, h * 0.65, 0, w * 0.75, h * 0.65, w * 0.65);
        g2.addColorStop(0, 'rgba(229, 192, 96, 0.08)');
        g2.addColorStop(0.5, 'rgba(229, 192, 96, 0.03)');
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        this.ctx.fillStyle = g2;
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw gold sparkles as diamond stars
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            
            if (s.isCrackerSpark) {
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.06; // gravity
                s.vx *= 0.98; // friction
                s.alpha -= s.decay;
                
                if (s.alpha <= 0) {
                    this.sparks.splice(i, 1);
                    continue;
                }
            } else {
                s.alpha += s.speed * s.dir;
                if (s.alpha >= 0.85) s.dir = -1;
                else if (s.alpha <= 0.1) s.dir = 1;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.translate(s.x, s.y);
            this.ctx.fillStyle = s.color || `rgba(229, 192, 96, ${s.alpha})`;
            
            if (s.isCrackerSpark) {
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = s.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, s.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Twinkling diamond-shaped star
                this.ctx.rotate(this.time * 0.005 + (s.speed * 100));
                this.ctx.beginPath();
                for (let k = 0; k < 4; k++) {
                    this.ctx.rotate(Math.PI / 2);
                    this.ctx.lineTo(s.size * 2.8, 0);
                    this.ctx.lineTo(0, s.size * 0.75);
                }
                this.ctx.closePath();
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // Draw spelling banner
        if (this.drawClimaxText) {
            if (this.climaxTextAlpha < 1.0) this.climaxTextAlpha += 0.02;
            
            this.ctx.save();
            this.ctx.globalAlpha = Math.min(1.0, this.climaxTextAlpha);
            this.ctx.fillStyle = '#e5c060';
            this.ctx.font = 'bold 2.1rem Cinzel, serif';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#e5c060';
            
            // Adjust coordinates based on window size
            const tx = this.canvas.width / 2;
            const ty = this.canvas.height * 0.28;
            this.ctx.fillText("HAPPY BIRTHDAY PAKODIII", tx, ty);
            this.ctx.restore();
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        
        if (this.videoElement) this.videoElement.pause();
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        if (this.videoFallbackFrameId) cancelAnimationFrame(this.videoFallbackFrameId);
        
        setTimeout(() => {
            router.navigate('scene13'); // Navigate to Final Thank You (Scene 13)
        }, 1200);
    }

    exit() {
        console.log("[Scene12] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.videoElement) this.videoElement.pause();
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    }

    destroy() {
        console.log("[Scene12] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.videoFallbackFrameId) cancelAnimationFrame(this.videoFallbackFrameId);
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'scene12-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #crystal-bg-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .crystal-layout {
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
                animation: scale-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            .crystal-header {
                max-width: 480px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .crystal-header h2 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .crystal-header p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .crystal-video-frame {
                position: relative;
                width: 90%;
                max-width: 520px;
                aspect-ratio: 16/9;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--color-glass-border);
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
            }
            #crystal-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            #crystal-fallback {
                width: 100%;
                height: 100%;
            }
            .crystal-subtitles {
                position: absolute;
                bottom: 12px;
                left: 5%;
                width: 90%;
                text-align: center;
                background: rgba(4, 4, 12, 0.8);
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                color: #fff;
                padding: 8px;
                border-radius: 8px;
                font-size: 0.8rem;
                min-height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .crystal-btn {
                border-color: rgba(229, 192, 96, 0.25);
                margin-bottom: 10px;
            }

            /* Climax bouquet reveal */
            .climax-gift-container {
                position: absolute;
                bottom: -400px;
                left: 50%;
                transform: translateX(-50%) scale(0.9);
                max-width: 440px;
                width: 90%;
                padding: 25px;
                text-align: center;
                z-index: 15;
                pointer-events: auto;
                opacity: 0;
                transition: bottom 1.4s cubic-bezier(0.25, 1, 0.5, 1), transform 1.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(229,192,96,0.1);
                border-color: rgba(229,192,96,0.25);
            }
            .climax-gift-container.show {
                bottom: 12%;
                transform: translateX(-50%) scale(1);
                opacity: 1;
            }
            .gift-bouquet {
                font-size: 4rem;
                margin-bottom: 15px;
                animation: float-slow 4s infinite ease-in-out;
                filter: drop-shadow(0 0 20px rgba(255,64,129,0.3));
            }
            .gift-bouquet-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.25rem;
                margin-bottom: 8px;
            }
            .gift-bouquet-desc {
                font-size: 0.85rem;
                line-height: 1.5;
                color: var(--color-text-secondary);
                margin-bottom: 20px;
                font-style: italic;
            }
            .read-letter-btn {
                border-color: #ff4081;
                font-size: 0.72rem;
                width: 100%;
            }
            .read-letter-btn:hover {
                box-shadow: 0 0 15px rgba(255,64,129,0.4);
                background: rgba(255,64,129,0.08);
            }
            .proceed-next-btn {
                border-color: var(--color-gold);
                font-size: 0.72rem;
                width: 100%;
            }

            /* Climax Letter Card Popup overlay */
            .climax-letter-popup {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.92);
                width: 94%;
                padding: 20px;
                z-index: 30;
                opacity: 0;
                pointer-events: auto;
                transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease;
                box-shadow: 0 15px 40px rgba(0,0,0,0.85);
                border-color: rgba(229,192,96,0.35);
            }
            .climax-letter-popup.show {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .climax-letter-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                margin-bottom: 12px;
            }
            .climax-letter-text {
                font-size: 0.82rem;
                line-height: 1.5;
                color: var(--color-text-secondary);
                margin-bottom: 15px;
                text-align: left;
                font-style: italic;
            }
            .close-letter-btn {
                font-size: 0.65rem;
                width: 100%;
            }
            
            .hide {
                display: none !important;
            }
            
            @keyframes scale-up {
                0% { transform: scale(0.92); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}
