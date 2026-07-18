/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 5: RELEASE BALLOONS (scene5.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene5 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.balloonsPopped = 0;
        this.balloonsReleased = 0;
        this.requiredPops = 10;
        
        this.balloonSpawner = null;
        this.activeBalloons = [];
        this.confettiParticles = [];
        this.animationFrameId = null;
        
        this.balloonColors = [
            'radial-gradient(circle at 30% 30%, #ff4081, #d81b60)', // Pink
            'radial-gradient(circle at 30% 30%, #e5c060, #b8860b)', // Gold
            'radial-gradient(circle at 30% 30%, #00e676, #00a152)', // Emerald Green
            'radial-gradient(circle at 30% 30%, #00b0ff, #0091ea)', // Sky Blue
            'radial-gradient(circle at 30% 30%, #ab47bc, #7b1fa2)', // Purple
            'radial-gradient(circle at 30% 30%, #ff6e40, #dd2c00)'  // Coral
        ];
    }

    init() {
        console.log("[Scene5] Initializing Balloon Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene5-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="balloon-pop-canvas"></canvas>
            
            <div class="balloon-layout">
                <div class="balloon-header glass-card">
                    <h3>Release Balloons</h3>
                    <p id="balloon-instructions">${content.balloonInstructionsText} (Popped: <span id="pop-count">0</span>/${this.requiredPops})</p>
                </div>
                
                <div class="balloon-arena"></div>
                
                <button id="balloon-skip-btn" class="glass-btn skip-balloon-btn hide">Open the Gift Box</button>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#balloon-pop-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.injectStyles();
        
        this.container.querySelector('#balloon-skip-btn').addEventListener('click', () => this.proceed());

        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    enter() {
        console.log("[Scene5] Entering Balloon Scene...");
        
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Start animation loop for pop particles
        this.render();

        // Start spawning balloons
        this.startSpawning();
    }

    startSpawning() {
        const arena = this.container.querySelector('.balloon-arena');
        
        const spawnOne = () => {
            if (this.balloonsReleased >= 35) { // Stop automatic spawn after 35 balloons
                return;
            }
            
            const balloon = document.createElement('div');
            balloon.className = 'balloon';
            
            // Random properties
            const size = Math.random() * 30 + 50; // 50px to 80px width
            const color = this.balloonColors[Math.floor(Math.random() * this.balloonColors.length)];
            const startX = Math.random() * (window.innerWidth - size - 40) + 20;
            const floatDuration = Math.random() * 6 + 7; // 7s to 13s to rise
            const rotateDeg = Math.random() * 20 - 10;
            
            balloon.style.width = `${size}px`;
            balloon.style.height = `${size * 1.25}px`;
            balloon.style.left = `${startX}px`;
            balloon.style.animation = `balloon-rise ${floatDuration}s linear forwards`;
            
            // Balloon visual & string nested to isolate float sway from rise translation
            balloon.innerHTML = `
                <div class="balloon-visual" style="background: ${color}; width: 100%; height: 100%; animation: float ${Math.random() * 3 + 3}s infinite ease-in-out alternate;">
                    <div class="balloon-knot"></div>
                    <svg class="balloon-string" viewBox="0 0 20 100" width="20" height="100">
                        <path d="M10,0 Q15,25 5,50 T10,100" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
                    </svg>
                </div>
            `;
            
            balloon.addEventListener('click', (e) => this.handleBalloonClick(balloon, e));
            balloon.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleBalloonClick(balloon, e.touches[0]);
            });
            
            arena.appendChild(balloon);
            this.activeBalloons.push(balloon);
            this.balloonsReleased++;
            
            // Monitor when balloon floats offscreen and destroy it
            balloon.addEventListener('animationend', (e) => {
                if (e.animationName.startsWith('balloon-rise')) {
                    this.activeBalloons = this.activeBalloons.filter(b => b !== balloon);
                    balloon.remove();
                }
            });
        };

        // Spawn first 4 immediately
        for (let i = 0; i < 4; i++) {
            setTimeout(spawnOne, i * 400);
        }

        // Keep spawning every 1.5 seconds
        this.balloonSpawner = setInterval(spawnOne, 1500);
    }

    handleBalloonClick(balloon, e) {
        if (balloon.classList.contains('popping')) return;
        
        balloon.clicks = (balloon.clicks || 0) + 1;
        
        if (balloon.clicks < 3) {
            // Squash and stretch the inner visual
            const visual = balloon.querySelector('.balloon-visual');
            if (visual) {
                visual.style.transition = 'transform 0.12s ease-out';
                visual.style.transform = 'scale(1.22, 0.78) rotate(3deg)';
                setTimeout(() => {
                    visual.style.transform = '';
                }, 120);
            }
            
            // Squeak tone
            this.playSqueakTone();
            return;
        }

        // Pop balloon on 3rd click
        this.popBalloon(balloon, e);
    }

    popBalloon(balloon, e) {
        if (balloon.classList.contains('popping')) return;
        balloon.classList.add('popping');
        
        this.balloonsPopped++;
        this.updatePopUI();

        // Get coordinates for confetti burst
        const rect = balloon.getBoundingClientRect();
        const px = rect.left + rect.width / 2;
        const py = rect.top + rect.height / 2;

        // Pop sound
        this.playPopChime();

        // Spawn 30 sparkling confetti particles in Canvas
        const colors = ['#e5c060', '#c3848b', '#ffffff', '#ff4081', '#00e676', '#00b0ff'];
        for (let i = 0; i < 30; i++) {
            this.confettiParticles.push(new BalloonConfetti(px, py, colors));
            // Add a few floating hearts
            if (i % 5 === 0) {
                // Heart shape constructor parameters
                const heart = new BalloonConfetti(px, py, ['#c3848b', '#ff4081']);
                heart.size = Math.random() * 4 + 3;
                this.confettiParticles.push(heart);
            }
        }

        // Spawn floating text message bubble
        const textBubble = document.createElement('div');
        textBubble.className = 'pop-message';
        const msgs = content.balloonPopMessages;
        textBubble.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        textBubble.style.position = 'fixed';
        textBubble.style.left = `${px - 45}px`;
        textBubble.style.top = `${py - 20}px`;
        textBubble.style.zIndex = '999';
        textBubble.style.color = '#e5c060';
        textBubble.style.fontFamily = 'var(--font-sans)';
        textBubble.style.fontWeight = '700';
        textBubble.style.fontSize = '0.75rem';
        textBubble.style.pointerEvents = 'none';
        textBubble.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
        textBubble.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        document.body.appendChild(textBubble);
        
        // Rise and fade
        setTimeout(() => {
            textBubble.style.transform = 'translateY(-30px)';
            textBubble.style.opacity = '0';
            setTimeout(() => textBubble.remove(), 800);
        }, 30);

        // Animate out DOM node and delete
        balloon.style.transform = 'scale(1.3)';
        balloon.style.opacity = '0';
        setTimeout(() => {
            balloon.remove();
            this.activeBalloons = this.activeBalloons.filter(b => b !== balloon);
        }, 150);

        // Check if milestone reached
        if (this.balloonsPopped >= this.requiredPops) {
            this.revealProceedBtn();
        }
    }

    updatePopUI() {
        const countSpan = this.container.querySelector('#pop-count');
        if (countSpan) {
            countSpan.innerText = this.balloonsPopped;
        }
    }

    revealProceedBtn() {
        const btn = this.container.querySelector('#balloon-skip-btn');
        if (btn && btn.classList.contains('hide')) {
            btn.classList.remove('hide');
            this.container.querySelector('#balloon-instructions').innerText = `Wishes released! You can now open ${content.birthdayGirlName}'s Special Box.`;
            this.container.querySelector('#balloon-instructions').style.color = 'var(--color-gold)';
        }
    }

    playPopChime() {
        if (!musicManager.audioCtx) return;
        
        // Random note in pentatonic scale
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5 to C6
        const freq = notes[Math.floor(Math.random() * notes.length)];
        
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, musicManager.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0.08, musicManager.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(musicManager.audioCtx.currentTime + 0.35);
    }

    playSqueakTone() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(now + 0.15);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & Render Canvas Pop Particles
        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const p = this.confettiParticles[i];
            p.update();
            p.draw(this.ctx);
            if (p.alpha <= 0) {
                this.confettiParticles.splice(i, 1);
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    proceed() {
        this.container.classList.add('scene-exit');
        
        // Float all remaining active balloons rapidly into sky
        this.activeBalloons.forEach(b => {
            b.style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease';
            b.style.transform = 'translateY(-1000px) scale(0.5)';
            b.style.opacity = '0';
        });

        setTimeout(() => {
            router.navigate('scene6');
        }, 1200);
    }

    exit() {
        console.log("[Scene5] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.balloonSpawner) clearInterval(this.balloonSpawner);
    }

    destroy() {
        console.log("[Scene5] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.balloonSpawner) clearInterval(this.balloonSpawner);
        this.activeBalloons.forEach(b => b.remove());
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'balloon-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #balloon-pop-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }
            .balloon-layout {
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
            .balloon-header {
                max-width: 450px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .balloon-header h3 {
                font-family: var(--font-serif);
                color: var(--color-rose-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .balloon-header p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .balloon-arena {
                position: relative;
                width: 100%;
                flex: 1;
                overflow: hidden;
            }
            
            /* Glossy DOM Balloon Wrapper */
            .balloon {
                position: absolute;
                bottom: -150px;
                z-index: 3;
                cursor: pointer;
            }
            
            /* Inner visual container that sways */
            .balloon-visual {
                position: relative;
                border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
                box-shadow: inset -6px -12px 20px rgba(0,0,0,0.35), 0 10px 25px rgba(0,0,0,0.3);
            }
            
            /* Gloss Highlight */
            .balloon-visual::after {
                content: '';
                position: absolute;
                top: 10%;
                left: 12%;
                width: 25%;
                height: 25%;
                background: rgba(255, 255, 255, 0.45);
                border-radius: 50%;
                transform: rotate(-30deg);
            }
            
            .balloon-knot {
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 10px;
                height: 6px;
                background: inherit;
                clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
            }
            
            .balloon-string {
                position: absolute;
                bottom: -105px;
                left: 50%;
                transform: translateX(-50%);
                pointer-events: none;
            }
            
            .skip-balloon-btn {
                border-color: rgba(195, 132, 139, 0.3);
                margin-bottom: 10px;
                animation: scale-up 0.5s ease forwards;
            }
            
            @keyframes balloon-rise {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                100% {
                    transform: translateY(-110vh) rotate(5deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Particle system for popped balloons
class BalloonConfetti {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        // Use soft flower petal colors (pinks, reds, golds) or balloon colors
        this.color = colors[Math.floor(Math.random() * colors.length)];
        
        this.type = Math.random() > 0.4 ? 'petal' : 'spark'; // 60% flower petals, 40% sparks
        
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 4 + 2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed - 1.5; // Upward bias
        
        this.size = Math.random() * 6 + 4;
        this.gravity = 0.07; // Slow drifting gravity
        this.friction = 0.97;
        this.alpha = 1.0;
        this.decay = Math.random() * 0.012 + 0.008; // Slower fade for longer visibility
        
        // Sways for flower petals
        this.swaySpeed = Math.random() * 0.06 + 0.02;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.rotation = Math.random() * Math.PI;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        if (this.type === 'petal') {
            this.swayOffset += this.swaySpeed;
            this.x += Math.sin(this.swayOffset) * 0.35 + this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
        } else {
            this.x += this.vx;
            this.y += this.vy;
        }
        
        this.alpha -= this.decay;
    }

    draw(ctx) {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === 'spark' ? 10 : 2;
        ctx.shadowColor = this.color;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        if (this.type === 'petal') {
            // Draw organic ellipse petal
            ctx.ellipse(0, 0, this.size * 1.2, this.size * 0.7, 0, 0, Math.PI * 2);
        } else {
            // Draw 4-point diamond star
            const s = this.size;
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.35, -s * 0.35);
            ctx.lineTo(s, 0);
            ctx.lineTo(s * 0.35, s * 0.35);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.35, s * 0.35);
            ctx.lineTo(-s, 0);
            ctx.lineTo(-s * 0.35, -s * 0.35);
            ctx.closePath();
        }
        ctx.fill();
        ctx.restore();
    }
}
