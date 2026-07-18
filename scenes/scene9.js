/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 9: GOLGAPPA DATE (scene9.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene9 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        
        this.bulbs = [];
        this.steamParticles = [];
        this.sparks = [];
        
        this.golgappasEaten = 0;
        this.bubbleTimer = null;
    }

    init() {
        console.log("[Scene9] Initializing Golgappa Date Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene9-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="street-canvas"></canvas>
            
            <div class="street-layout">
                <div class="date-card glass-card">
                    <div class="date-subtitle">THE SWEET & SPICY MEMORY</div>
                    <h2 class="date-title">${content.golgappaCornerName || 'Teju\'s Royal Chaat Junction'}</h2>
                    
                    <p id="date-instructions" class="date-instructions">Five fresh, crispy golgappas are ready. Tap each one to share this bite! 😋</p>
                    
                    <!-- Interactive Plate -->
                    <div class="stall-plate-center">
                        <div class="golgappa-item" data-index="0"></div>
                        <div class="golgappa-item" data-index="1"></div>
                        <div class="golgappa-item" data-index="2"></div>
                        <div class="golgappa-item" data-index="3"></div>
                        <div class="golgappa-item" data-index="4"></div>
                    </div>
                    
                    <!-- Date Dialog Bubble -->
                    <div id="date-bubble" class="date-bubble hide">Let's eat!</div>
                </div>
                
                <button id="date-proceed-btn" class="glass-btn date-btn hide">Advance to the Wish Tree</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#street-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup street decoration bulbs
        this.setupBulbs();
        
        // Bind golgappa clicks
        this.container.querySelectorAll('.golgappa-item').forEach(g => {
            g.addEventListener('click', (e) => this.eatGolgappa(g, e));
        });
        
        // Proceed button click
        this.container.querySelector('#date-proceed-btn').addEventListener('click', () => this.proceed());
        
        this.injectStyles();
        return this.container;
    }

    setupBulbs() {
        this.bulbs = [];
        const bulbCount = 10;
        
        for (let i = 0; i < bulbCount; i++) {
            this.bulbs.push({
                x: (window.innerWidth / (bulbCount - 1)) * i,
                y: 40 + Math.sin(i * 0.8) * 15,
                radius: 7,
                pulseOffset: Math.random() * Math.PI * 2,
                color: '#ffb300'
            });
        }
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.setupBulbs();
        }
    }

    enter() {
        console.log("[Scene9] Entering Golgappa Date...");
        
        // Continue track 4
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
        
        this.render();
    }

    eatGolgappa(g, e) {
        if (g.classList.contains('eaten')) return;
        g.classList.add('eaten');
        this.golgappasEaten++;
        
        const bubble = this.container.querySelector('#date-bubble');
        bubble.classList.remove('hide');
        bubble.style.opacity = '1';
        
        // Chew sound effect
        const chewFreqs = [220, 260, 310, 360, 420];
        this.playChewTone(chewFreqs[this.golgappasEaten - 1] || 250);
        
        // Spawns chewing sparks from clicked golgappa coordinate
        const rect = g.getBoundingClientRect();
        const stageRect = this.container.getBoundingClientRect();
        const gx = rect.left - stageRect.left + rect.width / 2;
        const gy = rect.top - stageRect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            this.sparks.push({
                x: gx,
                y: gy,
                vx: Math.random() * 4 - 2,
                vy: Math.random() * 4 - 2,
                size: Math.random() * 4 + 2,
                color: Math.random() > 0.4 ? '#ffb74d' : '#81c784', // Spicy chili red or sweet orange sparks
                alpha: 1.0,
                decay: 0.02
            });
        }
        
        // Dialog progression
        const messages = content.golgappaMessages;
        
        if (this.golgappasEaten < 5) {
            bubble.innerText = messages[this.golgappasEaten - 1] || "So delicious!";
            if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
            this.bubbleTimer = setTimeout(() => {
                bubble.style.opacity = '0';
            }, 2200);
        } else {
            // Last one
            bubble.innerText = content.golgappaFinalMsg;
            this.container.querySelector('#date-instructions').innerText = "All eaten! Teju's belly is happy. ❤️";
            this.container.querySelector('#date-instructions').style.color = '#81c784';
            
            // Gold sparks fountain
            for (let i = 0; i < 35; i++) {
                this.sparks.push({
                    x: window.innerWidth / 2,
                    y: window.innerHeight * 0.55,
                    vx: Math.random() * 6 - 3,
                    vy: -(Math.random() * 5 + 2),
                    size: Math.random() * 5 + 3,
                    color: '#e5c060',
                    alpha: 1.0,
                    decay: 0.012
                });
            }
            
            this.playFinalChime();
            
            // Reveal continue button
            setTimeout(() => {
                const btn = this.container.querySelector('#date-proceed-btn');
                btn.classList.remove('hide');
                btn.style.opacity = '1';
            }, 1200);
        }
    }

    playChewTone(freq) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
        osc.start();
        osc.stop(now + 0.15);
    }

    playFinalChime() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const scale = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        
        scale.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.7);
        });
    }

    render() {
        this.time++;
        
        // Draw Evening Twilight Gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        grad.addColorStop(0, '#060613');
        grad.addColorStop(0.6, '#0f182e');
        grad.addColorStop(1, '#2c1e21'); // subtle magenta street light glow at bottom
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update & Draw Steam Stalls Cooking Smoke (rising from bottom edges)
        if (this.time % 8 === 0) {
            this.steamParticles.push({
                x: 60 + Math.random() * 80,
                y: this.canvas.height,
                vx: Math.random() * 0.6 - 0.3,
                vy: -(Math.random() * 1.5 + 0.5),
                size: Math.random() * 10 + 10,
                alpha: 0.25,
                decay: 0.003
            });
            this.steamParticles.push({
                x: this.canvas.width - 100 + Math.random() * 80,
                y: this.canvas.height,
                vx: Math.random() * 0.6 - 0.3,
                vy: -(Math.random() * 1.5 + 0.5),
                size: Math.random() * 10 + 10,
                alpha: 0.25,
                decay: 0.003
            });
        }
        
        for (let i = this.steamParticles.length - 1; i >= 0; i--) {
            const s = this.steamParticles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;
            s.size += 0.08;
            
            if (s.alpha <= 0) {
                this.steamParticles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Draw Hanging Bulbs
        this.ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.bulbs.forEach((b, idx) => {
            if (idx === 0) this.ctx.moveTo(b.x, b.y);
            else this.ctx.quadraticCurveTo(
                (this.bulbs[idx-1].x + b.x)/2, 
                Math.max(this.bulbs[idx-1].y, b.y) + 8, 
                b.x, b.y
            );
        });
        this.ctx.stroke();
        
        this.bulbs.forEach(b => {
            const pulse = 4 + Math.sin(this.time * 0.04 + b.pulseOffset) * 2;
            this.ctx.save();
            this.ctx.shadowBlur = 10 + pulse;
            this.ctx.shadowColor = '#ffa000';
            this.ctx.fillStyle = b.color;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw socket base
            this.ctx.fillStyle = '#444';
            this.ctx.fillRect(b.x - 3, b.y - 7, 6, 4);
            this.ctx.restore();
        });
        
        // Update & Draw Eat Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= s.decay;
            
            if (s.alpha <= 0) {
                this.sparks.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = s.color;
            this.ctx.fillStyle = s.color;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
        setTimeout(() => {
            router.navigate('scene10'); // Transition to Heart Rain & Wish tree (Scene 10)
        }, 1200);
    }

    exit() {
        console.log("[Scene9] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    }

    destroy() {
        console.log("[Scene9] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
        this.steamParticles = [];
        this.sparks = [];
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'date-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #street-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .street-layout {
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
            .date-card {
                max-width: 480px;
                width: 90%;
                padding: 30px;
                text-align: center;
                margin-top: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
                perspective: 1000px;
                transform-style: preserve-3d;
                transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.4s ease;
            }
            .date-card:hover {
                transform: rotateX(5deg) rotateY(-3deg) translateY(-2px);
                border-color: rgba(229, 192, 96, 0.35);
            }
            .date-subtitle {
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 3px;
                color: var(--color-rose-gold);
                margin-bottom: 8px;
            }
            .date-title {
                font-family: var(--font-serif);
                font-size: 1.6rem;
                color: var(--color-text-primary);
                margin-bottom: 15px;
            }
            .date-instructions {
                font-size: 0.82rem;
                color: var(--color-text-secondary);
                margin-bottom: 25px;
                line-height: 1.4;
            }
            
            /* Plate */
            .stall-plate-center {
                width: 220px;
                height: 220px;
                background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                border-radius: 50%;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: inset 0 2px 10px rgba(255,255,255,0.05), 0 10px 25px rgba(0,0,0,0.4);
                margin-bottom: 25px;
            }
            .golgappa-item {
                position: absolute;
                width: 44px;
                height: 42px;
                background: radial-gradient(circle at 35% 35%, #ffd54f, #ffb300, #ff8f00);
                border-radius: 50% 50% 48% 48%;
                box-shadow: 0 5px 12px rgba(0,0,0,0.5), inset -2px -2px 5px rgba(0,0,0,0.4);
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .golgappa-item:hover:not(.eaten) {
                transform: scale(1.12) translateY(-4px);
                box-shadow: 0 8px 18px rgba(0,0,0,0.6);
            }
            
            /* Positioning the 5 golgappas symmetrically in circular fashion */
            .golgappa-item[data-index="0"] { top: 20px; left: 88px; }
            .golgappa-item[data-index="1"] { top: 75px; left: 30px; }
            .golgappa-item[data-index="2"] { top: 75px; left: 146px; }
            .golgappa-item[data-index="3"] { top: 145px; left: 50px; }
            .golgappa-item[data-index="4"] { top: 145px; left: 126px; }
            
            /* Crunch state */
            .golgappa-item.eaten {
                transform: scale(0);
                opacity: 0;
                pointer-events: none;
            }
            
            /* Dialog bubble */
            .date-bubble {
                padding: 10px 18px;
                background: var(--color-gold);
                color: var(--color-bg-darkest);
                font-family: var(--font-sans);
                font-size: 0.8rem;
                font-weight: 600;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                transition: opacity 0.3s ease;
                max-width: 80%;
                word-wrap: break-word;
            }
            .date-btn {
                border-color: rgba(229, 192, 96, 0.3);
                opacity: 0;
                transition: opacity 1s ease;
            }
            @media (max-width: 480px) {
                .stall-plate-center { width: 180px; height: 180px; }
                .golgappa-item { width: 36px; height: 34px; }
                .golgappa-item[data-index="0"] { top: 15px; left: 72px; }
                .golgappa-item[data-index="1"] { top: 60px; left: 20px; }
                .golgappa-item[data-index="2"] { top: 60px; left: 124px; }
                .golgappa-item[data-index="3"] { top: 120px; left: 35px; }
                .golgappa-item[data-index="4"] { top: 120px; left: 109px; }
            }
        `;
        document.head.appendChild(style);
    }
}
