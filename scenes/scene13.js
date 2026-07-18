/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 13: FINAL THANK YOU (scene13.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';
import { mediaConfig } from '../js/mediaConfig.js';

export class Scene13 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.videoElement = null;
        
        this.animationFrameId = null;
        this.fallbackTimer = null;
        this.subtitleIndex = 0;
        
        this.time = 0;
        this.particles = [];
        this.stars = [];
    }

    init() {
        console.log("[Scene13] Initializing Final Thank You Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene13-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="thanks-bg-canvas"></canvas>
            
            <div class="thanks-layout">
                <div class="thanks-header glass-card">
                    <h2>One Final Surprise</h2>
                    <p>A collection of thoughts from those who hold you dear.</p>
                </div>
                
                <div class="thanks-video-frame glass-card">
                    <video id="thanks-video" class="hide" preload="auto" playsinline webkit-playsinline>
                        <source src="${mediaConfig.videos.video4}" type="video/mp4">
                    </video>
                    <canvas id="thanks-fallback" class="hide"></canvas>
                    <div id="thanks-subtitles" class="thanks-subtitles"></div>
                </div>
                
                <button id="thanks-next-btn" class="glass-btn thanks-btn">A Message From Me</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#thanks-bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup background twinkling stars
        this.setupStars();
        
        // Setup initial rising lanterns
        this.setupParticles();
        
        // Tap screen to release a custom lantern
        this.container.addEventListener('click', (e) => {
            const btn = this.container.querySelector('#thanks-next-btn');
            if (e.target === btn || btn.contains(e.target)) return;
            
            const card = this.container.querySelector('.thanks-video-frame');
            if (card && (e.target === card || card.contains(e.target))) return;
            
            const header = this.container.querySelector('.thanks-header');
            if (header && (e.target === header || header.contains(e.target))) return;
            
            this.releaseCustomLantern(e.clientX, e.clientY);
        });
        
        // Bind proceed button
        this.container.querySelector('#thanks-next-btn').addEventListener('click', () => this.proceed());
        
        this.injectStyles();
        return this.container;
    }

    setupStars() {
        this.stars = [];
        for (let i = 0; i < 60; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.7 + 0.1,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    setupParticles() {
        this.particles = [];
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.8),
                size: Math.random() * 7 + 5,
                alpha: Math.random() * 0.6 + 0.2,
                speedY: -(Math.random() * 0.3 + 0.2),
                swaySpeed: Math.random() * 0.015 + 0.005,
                swayOffset: Math.random() * Math.PI * 2,
                isLantern: true,
                color: '#ffa726'
            });
        }
    }

    releaseCustomLantern(x, y) {
        console.log(`[Scene13] Spawning thank-you sky lantern at (${x}, ${y})`);
        this.particles.push({
            x: x,
            y: y,
            size: Math.random() * 8 + 6,
            alpha: 1.0,
            speedY: -(Math.random() * 0.5 + 0.4),
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            isLantern: true,
            color: '#ffa726'
        });
        
        // Play sweet ascending chime node
        if (musicManager.audioCtx) {
            const now = musicManager.audioCtx.currentTime;
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.37);
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start();
            osc.stop(now + 0.4);
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.setupStars();
            this.setupParticles();
        }
    }

    enter() {
        console.log("[Scene13] Entering Final Thank You...");
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
        
        this.render();
        this.playVideo();
    }

    playVideo() {
        const video = this.container.querySelector('#thanks-video');
        const canvas = this.container.querySelector('#thanks-fallback');
        
        const isVideoAvailable = true;
        
        if (isVideoAvailable) {
            video.classList.remove('hide');
            this.videoElement = video;
            video.play().catch(err => {
                console.warn("[Scene13] Video play failed, using canvas fallback", err);
                this.playVideoFallback(canvas);
            });
            video.addEventListener('ended', () => this.proceed());
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
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.025 + 0.005
            });
        }

        const render = () => {
            if (this.container.classList.contains('scene-exit')) return;
            frame++;
            
            cCtx.fillStyle = '#04040c';
            cCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            fSparks.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 0.95 || s.alpha < 0.1) s.speed = -s.speed;
                
                cCtx.fillStyle = `rgba(244, 143, 177, ${s.alpha})`;
                cCtx.beginPath();
                cCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                cCtx.fill();
            });
            
            const pulse = 35 + Math.sin(frame * 0.04) * 5;
            cCtx.font = `${pulse}px Arial`;
            cCtx.fillStyle = 'rgba(244, 143, 177, 0.06)';
            cCtx.textAlign = "center";
            cCtx.fillText("❤️", canvas.width / 2, canvas.height / 2 + 10);
            
            this.videoFallbackFrameId = requestAnimationFrame(render);
        };
        render();

        // Subtitles timing loop
        const subContainer = this.container.querySelector('#thanks-subtitles');
        const subtitles = content.endingQuotes.vid4Subtitles;
        this.subtitleIndex = 0;
        
        const showNext = () => {
            if (this.subtitleIndex < subtitles.length) {
                subContainer.innerText = subtitles[this.subtitleIndex];
                this.subtitleIndex++;
                this.fallbackTimer = setTimeout(showNext, 3800);
            } else {
                subContainer.innerText = "✨ Forever & Always. ✨";
            }
        };
        showNext();
    }

    render() {
        this.time++;
        
        // Deep purple sky
        this.ctx.fillStyle = '#04040a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw twinkling stars
        this.stars.forEach(s => {
            s.alpha += s.twinkleSpeed * s.dir;
            if (s.alpha >= 0.85) s.dir = -1;
            else if (s.alpha <= 0.1) s.dir = 1;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.05, s.alpha)})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw rising lanterns
        this.particles.forEach(p => {
            p.y += p.speedY;
            p.swayOffset += p.swaySpeed;
            p.x += Math.sin(p.swayOffset) * 0.2;
            
            if (p.y < -30) {
                p.y = this.canvas.height + 20;
                p.x = Math.random() * this.canvas.width;
                p.alpha = 0.2;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(255, 167, 38, 0.4)';
            
            // Draw simplified cylinder lantern
            const w = p.size * 1.3;
            const h = p.size * 1.8;
            
            const grad = this.ctx.createLinearGradient(p.x, p.y - h, p.x, p.y);
            grad.addColorStop(0, '#ffcc80');
            grad.addColorStop(0.5, '#ffa726');
            grad.addColorStop(1, '#ff5722');
            
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x - w/2, p.y - h);
            this.ctx.lineTo(p.x + w/2, p.y - h);
            this.ctx.quadraticCurveTo(p.x + w/2 + 1, p.y - h/2, p.x + w/2, p.y);
            this.ctx.lineTo(p.x - w/2, p.y);
            this.ctx.quadraticCurveTo(p.x - w/2 - 1, p.y - h/2, p.x - w/2, p.y - h);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Small internal burning candle core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y - 2, 2.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        
        if (this.videoElement) this.videoElement.pause();
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        if (this.videoFallbackFrameId) cancelAnimationFrame(this.videoFallbackFrameId);
        
        setTimeout(() => {
            router.navigate('scene14'); // Navigate to Final Message & Ending (Scene 14)
        }, 1200);
    }

    exit() {
        console.log("[Scene13] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.videoElement) this.videoElement.pause();
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    }

    destroy() {
        console.log("[Scene13] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.videoFallbackFrameId) cancelAnimationFrame(this.videoFallbackFrameId);
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'scene13-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #thanks-bg-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .thanks-layout {
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
            .thanks-header {
                max-width: 480px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .thanks-header h2 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .thanks-header p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .thanks-video-frame {
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
            #thanks-video {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            #thanks-fallback {
                width: 100%;
                height: 100%;
            }
            .thanks-subtitles {
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
            .thanks-btn {
                border-color: rgba(229, 192, 96, 0.25);
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);
    }
}
