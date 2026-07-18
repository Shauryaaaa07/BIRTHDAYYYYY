/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 3: HAPPY BIRTHDAY SCENE (scene3.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene3 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.fireworks = [];
        this.particles = [];
        this.floatingHearts = [];
        this.interactiveStars = [];
        
        this.animationFrameId = null;
        this.textTimelineTimer = null;
        
        this.time = 0;
        
        // Configuration
        this.maxHearts = 25;
        this.shootingStars = [];
    }

    init() {
        console.log("[Scene3] Initializing Happy Birthday Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene3-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="fireworks-canvas"></canvas>
            
            <!-- Glowing Crescent Moon -->
            <div class="celestial-moon">
                <div class="moon-face">
                    <div class="moon-eyes">
                        <span class="moon-eye"></span>
                        <span class="moon-eye"></span>
                    </div>
                    <div class="moon-mouth"></div>
                </div>
                <div class="moon-bubble">Happy Birthday, Moon Girl.</div>
            </div>
            
            <div class="hbd-overlay">
                <div class="hbd-content">
                    <div id="hbd-type-1" class="hbd-sub"></div>
                    <h1 id="hbd-type-2" class="hbd-title"></h1>
                    
                    <div id="hbd-card" class="hbd-card glass-card hide">
                        <p class="hbd-wish">${content.birthdayWishCardText}</p>
                        <button id="hbd-next-btn" class="glass-btn hbd-btn">${content.gatherRoundBtnText || 'Gather round the Cake'}</button>
                    </div>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#fireworks-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Tap screen to spawn custom fireworks OR trigger star wishes
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            let clickedStar = null;
            for (let s of this.interactiveStars) {
                const dx = s.x - clickX;
                const dy = s.y - clickY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 25) {
                    clickedStar = s;
                    break;
                }
            }
            
            if (clickedStar) {
                this.triggerStarEgg(clickedStar);
            } else {
                this.spawnCustomFirework(e.clientX, e.clientY);
            }
        });

        // Click Moon Easter Egg
        const moon = this.container.querySelector('.celestial-moon');
        moon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerMoonEgg(moon);
        });

        // Initialize floating hearts and interactive stars
        this.spawnHearts();
        this.spawnInteractiveStars();

        // Style specific to this scene
        const styleId = 'hbd-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #fireworks-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                    cursor: pointer;
                }
                .celestial-moon {
                    position: absolute;
                    top: 10%;
                    right: 15%;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    box-shadow: -20px 10px 0 0 #fff8dc; /* Crescent moon shade */
                    filter: drop-shadow(0 0 20px rgba(255, 248, 220, 0.45));
                    z-index: 2;
                    animation: float-slow 10s infinite ease-in-out;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    transition: transform 0.3s ease, filter 0.5s ease;
                }
                .celestial-moon.glow-active {
                    filter: drop-shadow(0 0 35px rgba(255, 248, 220, 0.85));
                    transform: scale(1.15);
                }
                .moon-face {
                    position: absolute;
                    width: 35px;
                    height: 35px;
                    left: 10px;
                    top: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }
                .moon-face.show {
                    opacity: 1;
                }
                .moon-eyes {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                .moon-eye {
                    width: 4px;
                    height: 4px;
                    background: #2b2413;
                    border-radius: 50%;
                }
                .moon-mouth {
                    width: 10px;
                    height: 5px;
                    border-bottom: 2px solid #2b2413;
                    border-radius: 0 0 5px 5px;
                }
                .moon-bubble {
                    position: absolute;
                    top: -50px;
                    right: 90px;
                    padding: 8px 14px;
                    background: #fff8dc;
                    color: var(--color-bg-darkest);
                    font-size: 0.72rem;
                    font-weight: 600;
                    border: 1px solid rgba(229, 192, 96, 0.4);
                    border-radius: 12px 12px 0px 12px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    white-space: nowrap;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: opacity 0.4s ease, transform 0.4s ease;
                    z-index: 10;
                    pointer-events: none;
                }
                .moon-bubble.show {
                    opacity: 1;
                    transform: translateY(0);
                }
                .hbd-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 3;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                }
                .hbd-content {
                    text-align: center;
                    width: 90%;
                    max-width: 600px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: auto;
                }
                .hbd-sub {
                    font-family: var(--font-sans);
                    font-size: 1rem;
                    font-weight: 500;
                    letter-spacing: 4px;
                    color: var(--color-rose-gold);
                    margin-bottom: 15px;
                    min-height: 24px;
                    text-shadow: 0 0 10px rgba(195, 132, 139, 0.2);
                    text-transform: uppercase;
                }
                .hbd-title {
                    font-family: var(--font-serif);
                    font-size: clamp(2rem, 6vw, 3.2rem);
                    font-weight: 800;
                    letter-spacing: 5px;
                    color: var(--color-gold);
                    text-shadow: 0 0 25px var(--color-gold-glow);
                    margin-bottom: 40px;
                    min-height: 70px;
                }
                .hbd-card {
                    padding: 30px;
                    border: 1px solid var(--color-glass-border);
                    box-shadow: 0 15px 45px rgba(0,0,0,0.6);
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 1s ease, transform 1s cubic-bezier(0.25, 1, 0.5, 1);
                }
                .hbd-card.show {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: translateY(0);
                }
                .hbd-wish {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: var(--color-text-secondary);
                    margin-bottom: 25px;
                    letter-spacing: 1px;
                }
                .hbd-btn {
                    border-color: rgba(229, 192, 96, 0.3);
                }
                .hbd-btn:hover {
                    border-color: var(--color-gold);
                    box-shadow: 0 0 20px var(--color-gold-glow);
                }
                @keyframes moon-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @media (max-width: 480px) {
                    .celestial-moon {
                        top: 5%;
                        right: 8%;
                        width: 60px;
                        height: 60px;
                        box-shadow: -15px 8px 0 0 #fff8dc;
                    }
                    .moon-face {
                        left: 6px;
                        top: 15px;
                        transform: scale(0.75);
                    }
                    .moon-bubble {
                        top: -40px;
                        right: 70px;
                        font-size: 0.65rem;
                    }
                    .hbd-title {
                        margin-bottom: 25px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Bind proceed button
        this.container.querySelector('#hbd-next-btn').addEventListener('click', () => this.proceed());

        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    enter() {
        console.log("[Scene3] Entering scene...");
        
        // Start BGM 3 on Midnight Fireworks
        musicManager.playTrack(3);
        
        // Fade scene container in
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Start fireworks loop
        this.render();

        // Start typing timeline
        this.startTypingAnimation();
        
        // Randomly launch automatic background fireworks
        this.autoFireworkTimer = setInterval(() => {
            this.spawnAutomaticFirework();
        }, 1500);
    }

    startTypingAnimation() {
        const subText = content.birthdaySubText;
        const titleText = content.birthdayTitleText;
        
        const subEl = this.container.querySelector('#hbd-type-1');
        const titleEl = this.container.querySelector('#hbd-type-2');
        const cardEl = this.container.querySelector('#hbd-card');
        
        let subIndex = 0;
        let titleIndex = 0;

        // Type Subtitle
        const typeSub = () => {
            if (subIndex < subText.length) {
                subEl.textContent += subText.charAt(subIndex);
                subIndex++;
                this.textTimelineTimer = setTimeout(typeSub, 60);
            } else {
                // Done subtitle, start title after a short gap
                this.textTimelineTimer = setTimeout(typeTitle, 400);
            }
        };

        // Type Title
        const typeTitle = () => {
            if (titleIndex < titleText.length) {
                titleEl.textContent += titleText.charAt(titleIndex);
                titleIndex++;
                this.textTimelineTimer = setTimeout(typeTitle, 80);
            } else {
                // Done typing, fade in details card
                this.textTimelineTimer = setTimeout(() => {
                    cardEl.classList.remove('hide');
                    cardEl.classList.add('show');
                }, 600);
            }
        };

        // Trigger typewriter start
        typeSub();
    }

    spawnHearts() {
        this.floatingHearts = [];
        for (let i = 0; i < this.maxHearts; i++) {
            this.floatingHearts.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + Math.random() * 200,
                size: Math.random() * 8 + 4,
                speedY: -(Math.random() * 0.8 + 0.4),
                swaySpeed: Math.random() * 0.03 + 0.01,
                swayRange: Math.random() * 15 + 5,
                swayOffset: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.4 + 0.2
            });
        }
    }

    spawnInteractiveStars() {
        this.interactiveStars = [];
        for (let i = 0; i < 18; i++) {
            this.interactiveStars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight * 0.4) + 40,
                baseSize: Math.random() * 2 + 1.5,
                size: 0,
                alpha: Math.random() * 0.6 + 0.3,
                twinkleSpeed: Math.random() * 0.015 + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1,
                brightness: 1.0
            });
            this.interactiveStars[i].size = this.interactiveStars[i].baseSize;
        }
    }

    triggerStarEgg(star) {
        star.brightness = 4.0;
        star.size = star.baseSize * 3;
        
        // Cause local cascade twinkle
        this.interactiveStars.forEach(s => {
            const dx = s.x - star.x;
            const dy = s.y - star.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 180) {
                s.brightness = 2.5;
                s.twinkleSpeed = 0.06; // increase speed
            }
        });
        
        // Spawn diagonal shooting star
        this.particles.push(new ShootingStar(star.x, star.y));
        
        // Spawn floating wish text
        this.particles.push(new FloatingText(star.x, star.y, "Make a Wish ✨"));
        
        this.playStarChime(987.77); // B5 chime
    }

    triggerMoonEgg(moon) {
        if (moon.classList.contains('glow-active')) return;
        moon.classList.add('glow-active');
        
        const face = moon.querySelector('.moon-face');
        const bubble = moon.querySelector('.moon-bubble');
        
        // Random messages
        const msgs = content.moonMessages;
        
        bubble.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        face.classList.add('show');
        bubble.classList.add('show');
        
        // Trigger bounce animation
        moon.style.animation = 'moon-bounce 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
        
        // Spawns gold stars around the moon in local coordinate space
        const rect = moon.getBoundingClientRect();
        const stageRect = this.container.getBoundingClientRect();
        const mx = rect.left - stageRect.left + rect.width / 2;
        const my = rect.top - stageRect.top + rect.height / 2 - 10;
        
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(mx + (Math.random() * 60 - 30), my + (Math.random() * 60 - 30), '#fff8dc', this.ctx));
        }
        
        this.playStarChime(880.00); // A5 chime
        
        setTimeout(() => {
            face.classList.remove('show');
            bubble.classList.remove('show');
            moon.classList.remove('glow-active');
            moon.style.animation = 'float-slow 10s infinite ease-in-out';
        }, 3800);
    }

    playStarChime(frequency) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(now + 0.6);
    }

    spawnAutomaticFirework() {
        const startX = Math.random() * this.canvas.width * 0.6 + this.canvas.width * 0.2;
        const startY = this.canvas.height;
        const targetX = startX + (Math.random() * 200 - 100);
        const targetY = Math.random() * this.canvas.height * 0.4 + this.canvas.height * 0.15;
        
        this.fireworks.push(new Firework(startX, startY, targetX, targetY, this.ctx));
    }

    spawnCustomFirework(clickX, clickY) {
        const startX = this.canvas.width / 2 + (Math.random() * 200 - 100);
        const startY = this.canvas.height;
        
        this.fireworks.push(new Firework(startX, startY, clickX, clickY, this.ctx));
        
        // Play soft pop sound
        this.playPopTone();
    }

    playPopTone() {
        if (!musicManager.audioCtx) return;
        
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 + Math.random() * 100, musicManager.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, musicManager.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, musicManager.audioCtx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + 0.25);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(musicManager.audioCtx.currentTime + 0.3);
    }

    render() {
        this.time++;
        
        // Subtle trails (alpha clearing)
        this.ctx.fillStyle = 'rgba(4, 4, 12, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Twinkling Stars & Floating Hearts
        this.floatingHearts.forEach(h => {
            h.y += h.speedY;
            h.swayOffset += h.swaySpeed;
            h.x += Math.sin(h.swayOffset) * 0.2;

            if (h.y < -20) {
                h.y = this.canvas.height + 20;
                h.x = Math.random() * this.canvas.width;
            }

            // Draw Heart Shape
            this.ctx.save();
            this.ctx.fillStyle = `rgba(195, 132, 139, ${h.opacity})`; // Rose gold tint
            this.ctx.beginPath();
            const hs = h.size;
            this.ctx.translate(h.x, h.y);
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(-hs/2, -hs/2, -hs, hs/3, 0, hs);
            this.ctx.bezierCurveTo(hs, hs/3, hs/2, -hs/2, 0, 0);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 1.5 Draw & Update Interactive Stars
        this.interactiveStars.forEach(s => {
            s.alpha += s.twinkleSpeed * s.twinkleDir;
            if (s.alpha >= 0.95) {
                s.alpha = 0.95;
                s.twinkleDir = -1;
            } else if (s.alpha <= 0.15) {
                s.alpha = 0.15;
                s.twinkleDir = 1;
            }
            
            // Decelerate flared values back to base state
            if (s.brightness > 1.0) s.brightness -= 0.05;
            if (s.size > s.baseSize) s.size -= 0.08;
            
            this.ctx.save();
            this.ctx.globalAlpha = s.alpha;
            this.ctx.fillStyle = `rgba(255, 248, 220, ${s.alpha})`;
            this.ctx.shadowBlur = 8 * s.brightness;
            this.ctx.shadowColor = '#fff8dc';
            
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 1.7 Update & Draw Shooting Stars
        if (Math.random() > 0.992 && this.shootingStars.length < 3) {
            this.shootingStars.push({
                x: Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.2,
                y: Math.random() * this.canvas.height * 0.3,
                vx: -(Math.random() * 4 + 4),
                vy: Math.random() * 3 + 2,
                len: Math.random() * 60 + 40,
                alpha: 1.0,
                decay: 0.018
            });
        }

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const ss = this.shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.alpha -= ss.decay;
            if (ss.alpha <= 0 || ss.x < -100 || ss.y > this.canvas.height + 100) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            this.ctx.save();
            const grad = this.ctx.createLinearGradient(ss.x, ss.y, ss.x + ss.vx * 3, ss.y + ss.vy * 3);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 1.8;
            this.ctx.beginPath();
            this.ctx.moveTo(ss.x, ss.y);
            this.ctx.lineTo(ss.x + ss.vx * 2, ss.y + ss.vy * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 2. Update and Draw Fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const fw = this.fireworks[i];
            fw.update();
            fw.draw();
            
            if (fw.exploded) {
                // Spawn explosion particles
                const colors = [
                    '#e5c060', // Gold
                    '#c3848b', // Rose Gold
                    '#ad1457', // Pink Glow
                    '#00d2ff', // Cyan Glow
                    '#ab47bc'  // Light Purple
                ];
                const count = Math.floor(Math.random() * 40) + 40;
                const chosenColor = colors[Math.floor(Math.random() * colors.length)];
                
                for (let pIdx = 0; pIdx < count; pIdx++) {
                    this.particles.push(new Particle(fw.x, fw.y, chosenColor, this.ctx));
                }
                
                this.fireworks.splice(i, 1);
            }
        }

        // 3. Update and Draw Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            p.draw();
            
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        
        // Custom panning camera illusion: shifts moon upward rapidly
        const moon = this.container.querySelector('.celestial-moon');
        if (moon) {
            moon.style.transition = 'transform 1.2s ease-in';
            moon.style.transform = 'translateY(-300px)';
        }

        setTimeout(() => {
            router.navigate('scene4');
        }, 1200);
    }

    exit() {
        console.log("[Scene3] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.autoFireworkTimer) clearInterval(this.autoFireworkTimer);
    }

    destroy() {
        console.log("[Scene3] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.textTimelineTimer) clearTimeout(this.textTimelineTimer);
        if (this.autoFireworkTimer) clearInterval(this.autoFireworkTimer);
        if (this.container) {
            this.container.remove();
        }
    }
}

// ==========================================================================
// helper structures: Firework Rocket & Explosion Spark particles
// ==========================================================================

class Firework {
    constructor(sx, sy, tx, ty, ctx) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.ctx = ctx;
        
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 12;
        this.acceleration = 1.01;
        this.brightness = Math.random() * 30 + 50;
        this.exploded = false;
    }

    update() {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        this.speed *= this.acceleration;
        
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        
        this.distanceTraveled = Math.sqrt(Math.pow(this.x + vx - this.sx, 2) + Math.pow(this.y + vy - this.sy, 2));
        
        if (this.distanceTraveled >= this.distanceToTarget) {
            this.exploded = true;
            this.x = this.tx;
            this.y = this.ty;
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        this.ctx.lineTo(this.x, this.y);
        this.ctx.strokeStyle = '#fff8dc'; // White/yellow rocket trail
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
    }
}

class Particle {
    constructor(x, y, color, ctx) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.ctx = ctx;
        
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 6 + 1;
        this.friction = 0.95;
        this.gravity = 0.12;
        this.decay = Math.random() * 0.015 + 0.008;
        this.alpha = 1;
    }

    update() {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        
        this.alpha -= this.decay;
    }

    draw() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        this.ctx.lineTo(this.x, this.y);
        
        this.ctx.save();
        this.ctx.globalAlpha = this.alpha;
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = this.color;
        this.ctx.stroke();
        this.ctx.restore();
    }
}

// Shooting Star Particle Class
class ShootingStar {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = Math.random() * 8 + 6; // fly right
        this.vy = Math.random() * 4 + 3; // fly down
        this.length = 80;
        this.alpha = 1.0;
        this.decay = 0.025;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = 'rgba(255, 248, 220, 0.85)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffe082';
        
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx * 2, this.y - this.vy * 2);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.restore();
    }
}

// Floating Text Particle Class
class FloatingText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y - 20;
        this.text = text;
        this.vy = -0.55; // float slow
        this.alpha = 1.0;
        this.decay = 0.016;
    }
    
    update() {
        this.y += this.vy;
        this.alpha -= this.decay;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.font = '500 12px Montserrat';
        ctx.fillStyle = '#e5c060';
        ctx.textAlign = 'center';
        
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(229,192,96,0.6)';
        
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
