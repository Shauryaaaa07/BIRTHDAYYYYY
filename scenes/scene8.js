/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 8: NDA DREAM (scene8.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene8 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        
        this.birds = [];
        this.sparks = [];
        this.clouds = [];
        
        this.sunriseIntensity = 0.0; // 0.0 to 1.0 (blooms on click)
        this.isSunRising = false;
        
        this.hasSaluted = false;
    }

    init() {
        console.log("[Scene8] Initializing NDA Dream Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene8-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="nda-canvas"></canvas>
            
            <div class="nda-layout">
                <!-- Quote Block -->
                <div class="nda-quote-card glass-card">
                    <h2 class="nda-title">${content.ndaTitleText || 'Dreams of Honor'}</h2>
                    <p class="nda-quote">${content.ndaQuoteText || 'To serve with pride, to live with purpose...'}</p>
                </div>
                
                <!-- Interactive Emblem / Badge -->
                <div class="nda-badge-container">
                    <div id="nda-badge" class="nda-badge glass-card grab">
                        <!-- Salute Icon / Silhouette -->
                        <div class="salute-icon">🇮🇳</div>
                        <div class="badge-label">TAP TO SALUTE</div>
                    </div>
                </div>
                
                <button id="nda-proceed-btn" class="glass-btn nda-btn hide">Follow the Butterfly</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#nda-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Tap emblem to salute
        this.container.querySelector('#nda-badge').addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerSalute();
        });
        
        // Proceed button
        this.container.querySelector('#nda-proceed-btn').addEventListener('click', () => this.proceed());
        
        // Create initial clouds
        for (let i = 0; i < 4; i++) {
            this.clouds.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.12 + Math.random() * (window.innerHeight * 0.18),
                width: Math.random() * 150 + 100,
                height: Math.random() * 40 + 20,
                speedX: 0.15 + Math.random() * 0.2,
                opacity: 0.1 + Math.random() * 0.15
            });
        }
        
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
        console.log("[Scene8] Entering NDA Dream...");
        musicManager.playTrack(4);
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
        
        this.render();
    }

    triggerSalute() {
        if (this.hasSaluted) return;
        this.hasSaluted = true;
        this.isSunRising = true;
        
        console.log("[Scene8] Salute triggered! Sunrise blooming...");
        
        // Animate badge
        const badge = this.container.querySelector('#nda-badge');
        badge.classList.add('saluted');
        badge.querySelector('.badge-label').innerText = "HONOR & RESPECT";
        
        // Play triumphant orchestra swell
        this.playSaluteFanfare();
        
        // Spawn birds immediately taking flight from center
        const bx = window.innerWidth * 0.3;
        const by = window.innerHeight * 0.65;
        
        for (let i = 0; i < 18; i++) {
            this.birds.push({
                x: bx + (Math.random() * 60 - 30),
                y: by + (Math.random() * 60 - 30),
                speedX: 1.8 + Math.random() * 2.8,
                speedY: -(1.4 + Math.random() * 1.8),
                wingPhase: Math.random() * Math.PI * 2,
                size: Math.random() * 5 + 3.5
            });
        }
        
        // Spawn golden spark fountain from badge
        const badgeRect = badge.getBoundingClientRect();
        const stageRect = this.container.getBoundingClientRect();
        const sparkX = badgeRect.left - stageRect.left + badgeRect.width / 2;
        const sparkY = badgeRect.top - stageRect.top + badgeRect.height / 2;
        
        for (let i = 0; i < 45; i++) {
            this.sparks.push({
                x: sparkX,
                y: sparkY,
                vx: Math.random() * 6 - 3,
                vy: -(Math.random() * 8 + 3),
                size: Math.random() * 4.5 + 2,
                alpha: 1.0,
                decay: Math.random() * 0.015 + 0.008
            });
        }
        
        // Reveal proceed button after 3s
        setTimeout(() => {
            const btn = this.container.querySelector('#nda-proceed-btn');
            if (btn) {
                btn.classList.remove('hide');
                btn.offsetHeight;
                btn.style.opacity = '1';
            }
        }, 3000);
    }

    playSaluteFanfare() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        
        // Sweet major harmonic sweep representing pride/patriotism
        const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4 C5 E5 G5 C6
        
        freqs.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 1.3);
        });
    }

    render() {
        this.time++;
        
        // 1. Draw Sunrise Sky Gradient & Sun Disc
        this.drawSunriseSky();
        
        // 2. Draw Silhouette Mountains & Waving Flag
        this.drawMountains();
        
        // 3. Update & Draw Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        this.clouds.forEach(c => {
            c.x += c.speedX;
            if (c.x > this.canvas.width + 100) {
                c.x = -150;
            }
            this.ctx.save();
            this.ctx.globalAlpha = c.opacity;
            this.ctx.beginPath();
            this.ctx.ellipse(c.x, c.y, c.width, c.height, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // 4. Update & Draw Birds
        this.ctx.strokeStyle = 'rgba(255, 248, 220, 0.75)';
        this.ctx.lineWidth = 1.6;
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const b = this.birds[i];
            b.x += b.speedX;
            b.y += b.speedY;
            b.wingPhase += 0.12;
            
            if (b.x > this.canvas.width + 50 || b.y < -50) {
                this.birds.splice(i, 1);
                continue;
            }
            
            const wingY = Math.sin(b.wingPhase) * b.size;
            
            this.ctx.beginPath();
            this.ctx.moveTo(b.x - b.size * 2, b.y + wingY);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.lineTo(b.x + b.size * 2, b.y + wingY);
            this.ctx.stroke();
        }
        
        // 5. Update & Draw Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.06; // gravity
            s.alpha -= s.decay;
            
            if (s.alpha <= 0) {
                this.sparks.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#e5c060';
            this.ctx.fillStyle = '#e5c060';
            
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Gradually increase sunrise intensity on salute
        if (this.isSunRising && this.sunriseIntensity < 1.0) {
            this.sunriseIntensity += 0.008;
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    drawSunriseSky() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        const baseBlue = '#060613';
        const sunriseRed = `rgba(189, 73, 50, ${0.45 + this.sunriseIntensity * 0.55})`;
        const sunriseGold = `rgba(229, 192, 96, ${0.15 + this.sunriseIntensity * 0.75})`;
        
        grad.addColorStop(0, baseBlue);
        grad.addColorStop(0.55, '#0b162d');
        grad.addColorStop(0.8, sunriseRed);
        grad.addColorStop(1.0, sunriseGold);
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw the Sunrise Sun Sphere
        const sunRadius = 80 + this.sunriseIntensity * 130;
        const sunX = this.canvas.width * 0.3;
        const sunY = this.canvas.height * 0.69;
        
        this.ctx.save();
        const sunGrad = this.ctx.createRadialGradient(
            sunX, sunY, 10,
            sunX, sunY, sunRadius
        );
        sunGrad.addColorStop(0, '#fff');
        sunGrad.addColorStop(0.2, '#fff8dc');
        sunGrad.addColorStop(0.65, '#e5c060');
        sunGrad.addColorStop(1, 'rgba(229, 192, 96, 0)');
        
        this.ctx.fillStyle = sunGrad;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Draw Sun rays
        this.drawSunRays(sunX, sunY, sunRadius);
    }

    drawSunRays(sunX, sunY, sunRadius) {
        if (this.sunriseIntensity <= 0) return;
        this.ctx.save();
        this.ctx.globalAlpha = this.sunriseIntensity * 0.22;
        this.ctx.strokeStyle = '#fff8dc';
        this.ctx.lineWidth = 1.5;
        
        const numRays = 18;
        const angleStep = Math.PI / numRays;
        for (let i = 0; i <= numRays; i++) {
            const angle = i * angleStep + Math.PI;
            const rx = sunX + Math.cos(angle) * (sunRadius * 4.5);
            const ry = sunY + Math.sin(angle) * (sunRadius * 4.5);
            
            this.ctx.beginPath();
            this.ctx.moveTo(sunX, sunY);
            this.ctx.lineTo(rx, ry);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawMountains() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.ctx.save();
        // Layer 1 - Far mountains (dark blue-indigo silhouette)
        this.ctx.fillStyle = 'rgba(8, 14, 38, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        this.ctx.lineTo(0, h * 0.72);
        this.ctx.quadraticCurveTo(w * 0.25, h * 0.60, w * 0.5, h * 0.74);
        this.ctx.quadraticCurveTo(w * 0.75, h * 0.64, w, h * 0.76);
        this.ctx.lineTo(w, h);
        this.ctx.closePath();
        this.ctx.fill();

        // Layer 2 - Mid mountains (dark silhouette)
        this.ctx.fillStyle = 'rgba(4, 7, 24, 0.97)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, h);
        this.ctx.lineTo(0, h * 0.82);
        this.ctx.lineTo(w * 0.3, h * 0.68);
        this.ctx.lineTo(w * 0.62, h * 0.84);
        this.ctx.lineTo(w * 0.82, h * 0.76);
        this.ctx.lineTo(w, h * 0.87);
        this.ctx.lineTo(w, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw silhouette Indian flag waving on the mountain peak!
        this.drawSilhouetteFlag(w * 0.3, h * 0.68);
        
        this.ctx.restore();
    }

    drawSilhouetteFlag(x, y) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        this.ctx.lineWidth = 2;
        
        // Flagpole
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y - 48);
        this.ctx.stroke();
        
        // Waving Flag shape (moving outline)
        const wave = Math.sin(this.time * 0.08) * 3;
        this.ctx.fillStyle = '#060a17';
        this.ctx.strokeStyle = '#e5c060';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 48);
        this.ctx.bezierCurveTo(x + 10, y - 48 + wave, x + 20, y - 48 - wave, x + 30, y - 46);
        this.ctx.lineTo(x + 30, y - 28);
        this.ctx.bezierCurveTo(x + 20, y - 30 - wave, x + 10, y - 30 + wave, x, y - 30);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    proceed() {
        this.container.classList.add('scene-exit');
        setTimeout(() => {
            router.navigate('scene9'); // Transition to Scene 9 (Golgappa Date)
        }, 1200);
    }

    exit() {
        console.log("[Scene8] Exiting scene...");
        this.container.classList.add('scene-exit');
    }

    destroy() {
        console.log("[Scene8] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'nda-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #nda-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .nda-layout {
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
            .nda-quote-card {
                max-width: 480px;
                width: 90%;
                padding: 20px 25px;
                text-align: center;
                animation: fade-in 1s ease forwards;
            }
            .nda-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.3rem;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 8px;
                text-shadow: 0 0 10px rgba(229,192,96,0.3);
            }
            .nda-quote {
                font-size: 0.85rem;
                line-height: 1.6;
                color: var(--color-text-secondary);
                font-style: italic;
            }
            
            .nda-badge-container {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 5;
            }
            .nda-badge {
                width: 140px;
                height: 140px;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                border-color: rgba(229,192,96,0.25);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(229,192,96,0.1);
                transition: all 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .nda-badge:hover {
                transform: scale(1.1) rotate(5deg);
                border-color: var(--color-gold);
                box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 30px rgba(229,192,96,0.25);
            }
            .nda-badge.saluted {
                border-color: #00e676;
                box-shadow: 0 0 35px rgba(0, 230, 118, 0.4);
                transform: scale(1.05);
            }
            .salute-icon {
                font-size: 2.8rem;
                margin-bottom: 8px;
                animation: float-slow 3s infinite ease-in-out;
            }
            .badge-label {
                font-size: 0.68rem;
                letter-spacing: 2px;
                font-weight: 700;
                color: var(--color-text-secondary);
            }
            .nda-badge.saluted .badge-label {
                color: #00e676;
            }
            
            .nda-btn {
                border-color: var(--color-gold);
                animation: scale-up 0.5s ease forwards;
                opacity: 0;
                transition: opacity 0.5s ease;
                z-index: 10;
            }
            .hide {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
}
