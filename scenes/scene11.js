/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 11: SPECIAL MEMORIES LANTERNS (scene11.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene11 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        
        this.stars = [];
        this.lanterns = [];
        this.sparkles = [];
    }

    init() {
        console.log("[Scene11] Initializing Flying Lanterns Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene11-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="nebula-canvas"></canvas>
            
            <div class="lanterns-layout">
                <div class="lantern-card glass-card">
                    <div class="lantern-subtitle">THE SKY OF WISHES</div>
                    <h2 class="lantern-title">${content.lanternsTitleText || "Teju's Floating Dreams"}</h2>
                    
                    <p id="lantern-quote" class="lantern-quote">"${content.memoriesLanternsQuote || 'Like glowing lanterns carrying fire into the night, our memories illuminate the darkest skies.'}"</p>
                    <p class="lantern-hint">Tap anywhere on the sky to release a new wish lantern... ✨</p>
                    
                    <button id="lantern-proceed-btn" class="glass-btn lantern-btn">${content.enterCrystalChamberBtnText || 'Enter the Crystal Chamber 💎'}</button>
                </div>
            </div>

            <!-- Theatrical Curtain Overlay (starts closed, opens on enter) -->
            <div id="curtain-overlay" class="curtain-overlay closed">
                <div class="curtain-panel curtain-left"></div>
                <div class="curtain-panel curtain-right"></div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#nebula-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Spawn background stars
        this.spawnStars();
        
        // Spawn initial set of rising lanterns & diyas
        this.spawnInitialLanterns();
        
        // Tap screen to release a custom lantern
        this.container.addEventListener('click', (e) => {
            const btn = this.container.querySelector('#lantern-proceed-btn');
            if (e.target === btn || btn.contains(e.target)) return; // Don't trigger on button clicks
            
            const card = this.container.querySelector('.lantern-card');
            if (e.target === card || card.contains(e.target)) return; // Don't trigger on card clicks
            
            this.releaseCustomLantern(e.clientX, e.clientY);
        });
        
        // Proceed button click
        this.container.querySelector('#lantern-proceed-btn').addEventListener('click', () => this.proceed());
        
        this.injectStyles();
        return this.container;
    }

    spawnStars() {
        this.stars = [];
        for (let i = 0; i < 70; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.7 + 0.2,
                twinkleSpeed: Math.random() * 0.015 + 0.005,
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    spawnInitialLanterns() {
        this.lanterns = [];
        // Spawn 12 starting lanterns distributed vertically
        for (let i = 0; i < 12; i++) {
            this.lanterns.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.2 + Math.random() * (window.innerHeight * 0.8),
                size: Math.random() * 8 + 6,
                speedY: -(Math.random() * 0.4 + 0.3),
                swaySpeed: Math.random() * 0.015 + 0.005,
                swayOffset: Math.random() * Math.PI * 2,
                glowColor: Math.random() > 0.5 ? 'rgba(255, 167, 38, 0.4)' : 'rgba(255, 112, 67, 0.4)',
                alpha: Math.random() * 0.6 + 0.3,
                type: Math.random() > 0.55 ? 'lantern' : 'diya'
            });
        }
    }

    releaseCustomLantern(x, y) {
        console.log(`[Scene11] Releasing new custom lantern at (${x}, ${y})`);
        
        const isDiya = Math.random() > 0.5;
        this.lanterns.push({
            x: x,
            y: y,
            size: Math.random() * 8 + 7,
            speedY: -(Math.random() * 0.6 + 0.5),
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayOffset: Math.random() * Math.PI * 2,
            glowColor: isDiya ? 'rgba(255, 167, 38, 0.5)' : 'rgba(255, 112, 67, 0.5)',
            alpha: 1.0,
            type: isDiya ? 'diya' : 'lantern'
        });
        
        // Spawn sparkles under it
        for (let i = 0; i < 8; i++) {
            this.sparkles.push({
                x: x,
                y: y + 10,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 + 1,
                alpha: 1.0,
                color: '#ffe082',
                decay: Math.random() * 0.02 + 0.015
            });
        }
        
        // Play soft ascend note
        if (musicManager.audioCtx) {
            const now = musicManager.audioCtx.currentTime;
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
            
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
            osc.start();
            osc.stop(now + 0.45);
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.spawnStars();
        }
    }

    enter() {
        console.log("[Scene11] Entering Memory Lanterns...");
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
            
            // Part curtains open after scene10 is completely destroyed
            const curtain = this.container.querySelector('#curtain-overlay');
            if (curtain) {
                curtain.classList.remove('closed');
            }
        }, 1000);
        
        this.render();
    }

    render() {
        this.time++;
        
        // Nebula Space backdrop
        this.drawNebula();
        
        // Update & Draw twinkly background stars
        this.stars.forEach(s => {
            s.opacity += s.twinkleSpeed * s.dir;
            if (s.opacity >= 0.85) s.dir = -1;
            else if (s.opacity <= 0.15) s.dir = 1;
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Periodically spawn new lanterns from bottom
        if (this.time % 75 === 0 && this.lanterns.length < 25) {
            this.lanterns.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 30,
                size: Math.random() * 8 + 6,
                speedY: -(Math.random() * 0.4 + 0.3),
                swaySpeed: Math.random() * 0.015 + 0.005,
                swayOffset: Math.random() * Math.PI * 2,
                glowColor: Math.random() > 0.5 ? 'rgba(255, 167, 38, 0.4)' : 'rgba(255, 112, 67, 0.4)',
                alpha: 0.1,
                type: Math.random() > 0.55 ? 'lantern' : 'diya'
            });
        }
        
        // Update & Draw rising lanterns / diyas
        this.lanterns.forEach(l => {
            l.y += l.speedY;
            l.swayOffset += l.swaySpeed;
            l.x += Math.sin(l.swayOffset) * 0.28;
            
            if (l.alpha < 0.9 && l.y > this.canvas.height - 100) {
                l.alpha += 0.01;
            }
            
            if (l.y < -50) {
                l.y = this.canvas.height + 30;
                l.x = Math.random() * this.canvas.width;
                l.alpha = 0.1;
            }
            
            this.drawLantern(this.ctx, l);
        });
        
        // Update & Draw sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const s = this.sparkles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;
            
            if (s.alpha <= 0) {
                this.sparkles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.fillStyle = s.color;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = s.color;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, Math.random() * 2 + 1, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    drawNebula() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.fillStyle = '#03030c';
        this.ctx.fillRect(0, 0, w, h);
        
        const pulse = Math.sin(this.time * 0.004) * 40;
        
        this.ctx.save();
        const nebGrad1 = this.ctx.createRadialGradient(
            w * 0.35 + pulse, h * 0.45, 10,
            w * 0.35 + pulse, h * 0.45, w * 0.5
        );
        nebGrad1.addColorStop(0, 'rgba(81, 45, 168, 0.09)'); // Deep Purple
        nebGrad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = nebGrad1;
        this.ctx.fillRect(0, 0, w, h);
        
        const nebGrad2 = this.ctx.createRadialGradient(
            w * 0.7 - pulse, h * 0.6, 10,
            w * 0.7 - pulse, h * 0.6, w * 0.45
        );
        nebGrad2.addColorStop(0, 'rgba(183, 28, 28, 0.07)'); // Deep Red gas
        nebGrad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = nebGrad2;
        this.ctx.fillRect(0, 0, w, h);
        this.ctx.restore();
    }

    drawLantern(ctx, l) {
        ctx.save();
        ctx.globalAlpha = l.alpha;
        
        // Glow backdrop
        ctx.shadowBlur = 12 + Math.sin(this.time * 0.05 + l.swayOffset) * 4;
        ctx.shadowColor = l.glowColor;
        
        ctx.translate(l.x, l.y);
        
        if (l.type === 'diya') {
            // Clay body
            ctx.fillStyle = '#8d6e63';
            ctx.beginPath();
            ctx.arc(0, 0, l.size, 0, Math.PI);
            ctx.closePath();
            ctx.fill();
            
            // Rim
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(-l.size, -1, l.size * 2, 2);
            
            // Flame
            const flameW = l.size * 0.32 + Math.sin(this.time * 0.1) * 1.2;
            const flameH = l.size * 0.72 + Math.cos(this.time * 0.1) * 1.5;
            
            ctx.fillStyle = '#ffa726';
            ctx.beginPath();
            ctx.ellipse(0, -flameH/2 - 1, flameW, flameH, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.ellipse(0, -flameH/2, flameW * 0.6, flameH * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const w = l.size * 1.3;
            const h = l.size * 1.9;
            
            // Cylindrical Sky Lantern Paper Body
            const bodyGrad = ctx.createLinearGradient(0, -h, 0, 0);
            bodyGrad.addColorStop(0, '#ffcc80');
            bodyGrad.addColorStop(0.55, '#ffa726');
            bodyGrad.addColorStop(1, '#ff5722');
            
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-w/2, -h);
            ctx.lineTo(w/2, -h);
            ctx.quadraticCurveTo(w/2 + 2, -h/2, w/2, 0);
            ctx.lineTo(-w/2, 0);
            ctx.quadraticCurveTo(-w/2 - 2, -h/2, -w/2, -h);
            ctx.closePath();
            ctx.fill();
            
            // Top rim
            ctx.strokeStyle = '#ffb74d';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(-w/2, -h, w, 1.5);
            
            // Burning Core Flame
            const flamePulse = Math.sin(this.time * 0.08 + l.swayOffset) * 2;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -3, 3.5 + flamePulse * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    proceed() {
        // Trigger curtain slide close
        const curtain = this.container.querySelector('#curtain-overlay');
        if (curtain) {
            curtain.classList.add('closed');
        }
        
        setTimeout(() => {
            router.navigate('scene12'); // Navigate to Crystal Surprise (Scene 12)
        }, 1600);
    }

    exit() {
        console.log("[Scene11] Exiting scene...");
        this.container.classList.add('scene-exit');
        
        const curtain = this.container.querySelector('#curtain-overlay');
        if (curtain) curtain.classList.add('closed');
    }

    destroy() {
        console.log("[Scene11] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'orbs-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #nebula-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .lanterns-layout {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 40px 20px;
                pointer-events: none;
            }
            .lantern-card {
                max-width: 480px;
                width: 95%;
                padding: 30px;
                text-align: center;
                pointer-events: auto;
                box-shadow: 0 15px 45px rgba(0,0,0,0.65);
                transform: translateY(20px);
                animation: scale-up 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            .lantern-subtitle {
                font-size: 0.7rem;
                font-weight: 700;
                letter-spacing: 3px;
                color: var(--color-rose-gold);
                margin-bottom: 8px;
            }
            .lantern-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.6rem;
                letter-spacing: 2px;
                margin-bottom: 15px;
                text-shadow: 0 0 10px rgba(229,192,96,0.3);
            }
            .lantern-quote {
                font-size: 0.88rem;
                line-height: 1.6;
                color: var(--color-text-secondary);
                margin-bottom: 15px;
                font-style: italic;
                letter-spacing: 0.5px;
            }
            .lantern-hint {
                font-size: 0.68rem;
                color: var(--color-text-muted);
                margin-bottom: 25px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .lantern-btn {
                width: 100%;
                font-size: 0.75rem;
                border-color: rgba(229, 192, 96, 0.35);
            }
            .lantern-btn:hover {
                box-shadow: 0 0 20px rgba(229,192,96,0.4);
            }
            
            /* Theatrical Curtain Overlay */
            .curtain-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                display: flex;
            }
            .curtain-panel {
                width: 50%;
                height: 100%;
                background: linear-gradient(135deg, #2b0202, #0d0101);
                border-right: 1.5px solid rgba(229, 192, 96, 0.22);
                border-left: 1.5px solid rgba(229, 192, 96, 0.22);
                box-shadow: 0 0 35px rgba(0,0,0,0.85);
                transition: transform 1.6s cubic-bezier(0.77, 0, 0.175, 1);
            }
            .curtain-left {
                transform: translateX(-100%);
            }
            .curtain-right {
                transform: translateX(100%);
            }
            .curtain-overlay.closed .curtain-left {
                transform: translateX(0);
                pointer-events: auto;
            }
            .curtain-overlay.closed .curtain-right {
                transform: translateX(0);
                pointer-events: auto;
            }
            
            @keyframes scale-up {
                0% { transform: scale(0.92) translateY(20px); opacity: 0; }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}
