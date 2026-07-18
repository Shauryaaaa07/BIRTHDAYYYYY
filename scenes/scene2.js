/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 2: NATURE THEME (scene2.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene2 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.butterflies = [];
        this.leaves = [];
        this.windParticles = [];
        
        this.maxButterflies = 80;
        this.maxLeaves = 40;
        this.maxWind = 50;
        
        this.animationFrameId = null;
        this.time = 0;
        
        this.isTransitioning = false;
        this.transitionTime = 0;
        
        // Mouse interaction vectors
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        
        // Easter Egg particles
        this.eggParticles = [];
    }

    init() {
        console.log("Initializing Nature Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene2-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="nature-canvas"></canvas>
            <div class="nature-overlay">
                <div class="nature-text glass-card">
                    <p class="nature-quote">${content.natureQuote}</p>
                    <p class="nature-prompt">Tap anywhere to release the swarm...</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#nature-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Resize canvas to fill viewport
        this.resizeCanvas();
        
        // Bind window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Capture interaction coordinates
        this.container.addEventListener('mousemove', (e) => {
            this.targetMouseX = e.clientX;
            this.targetMouseY = e.clientY;
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.targetMouseX = e.touches[0].clientX;
                this.targetMouseY = e.touches[0].clientY;
            }
        });
        
        // Tap screen: either trigger butterfly Easter Egg OR release the swarm
        this.container.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            let clickedButterfly = false;
            for (let b of this.butterflies) {
                if (this.isTransitioning || b.isEasterEgg) continue;
                
                const dx = b.x - clickX;
                const dy = b.y - clickY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                // Click threshold radius
                if (dist < 40) {
                    this.triggerButterflyEgg(b);
                    clickedButterfly = true;
                    break;
                }
            }
            
            if (clickedButterfly) return;
            
            // Standard transition if clicked background
            if (!this.isTransitioning) this.startTransition();
        });

        // Initialize particles
        this.spawnParticles();

        // Style specific to this scene
        const styleId = 'nature-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #nature-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                .nature-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    pointer-events: none;
                }
                .nature-text {
                    max-width: 500px;
                    width: 90%;
                    padding: 35px;
                    text-align: center;
                    animation: float-slow 7s infinite ease-in-out;
                    pointer-events: auto; /* Let click pass through card if clicked outside, but card is clickable */
                    cursor: pointer;
                    border: 1px solid rgba(0, 230, 118, 0.15);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 25px rgba(0, 230, 118, 0.04);
                }
                .nature-quote {
                    font-family: var(--font-serif);
                    font-size: 1.15rem;
                    line-height: 1.6;
                    letter-spacing: 1px;
                    color: var(--color-text-primary);
                    margin-bottom: 20px;
                }
                .nature-prompt {
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: var(--color-gold);
                    text-transform: uppercase;
                    animation: pulse-shimmer 2s infinite ease-in-out;
                }
                @keyframes pulse-shimmer {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
                @media (max-width: 480px) {
                    .nature-quote {
                        font-size: 0.95rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    enter() {
        console.log("[Scene2] Entering scene...");
        
        // Activate green nature aurora background
        const gAurora = document.querySelector('.aurora-3');
        if (gAurora) gAurora.style.opacity = '0.5';

        // Animate container in
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Start render loop
        this.render();

        // Safety fallback: if user doesn't click, transition automatically after 18 seconds
        this.autoTransitionTimer = setTimeout(() => {
            if (!this.isTransitioning) this.startTransition();
        }, 18000);
    }

    spawnParticles() {
        // Spawn butterflies
        this.butterflies = [];
        for (let i = 0; i < this.maxButterflies; i++) {
            this.butterflies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height + this.canvas.height * 0.2, // Spawn slightly lower
                size: Math.random() * 8 + 4,
                speedX: Math.random() * 1.5 - 0.75,
                speedY: -(Math.random() * 1.2 + 0.5), // Fly upwards generally
                flapSpeed: Math.random() * 0.15 + 0.1,
                flapOffset: Math.random() * Math.PI,
                // Soft colorful colors (greens, pinks, purples, yellows)
                color: this.getRandomColor(),
                angle: Math.random() * Math.PI * 2,
                wiggleSpeed: Math.random() * 0.02 + 0.01,
                z: Math.random() * 0.5 + 0.5 // Simulated Z depth (0.5 to 1.0)
            });
        }

        // Spawn leaves
        this.leaves = [];
        for (let i = 0; i < this.maxLeaves; i++) {
            this.leaves.push({
                x: Math.random() * this.canvas.width,
                y: -50 - Math.random() * this.canvas.height, // Spawn offscreen top
                size: Math.random() * 12 + 6,
                speedX: Math.random() * 0.8 - 0.2,
                speedY: Math.random() * 1.0 + 0.8, // Drift down
                swaySpeed: Math.random() * 0.02 + 0.01,
                swayRange: Math.random() * 20 + 10,
                swayOffset: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI,
                rotationSpeed: Math.random() * 0.02 - 0.01,
                // Natural tones
                color: Math.random() > 0.4 ? 'rgba(76, 175, 80, 0.45)' : 'rgba(195, 132, 139, 0.4)' // Green / Rose leaves
            });
        }

        // Spawn wind particles
        this.windParticles = [];
        for (let i = 0; i < this.maxWind; i++) {
            this.windParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 80 + 30,
                speedX: Math.random() * 2.0 + 1.5, // Move right
                opacity: Math.random() * 0.2 + 0.05
            });
        }
    }

    getRandomColor() {
        const colors = [
            'rgba(0, 230, 118, 0.7)',  // Emerald Green
            'rgba(195, 132, 139, 0.7)', // Rose Gold
            'rgba(229, 192, 96, 0.7)',  // Soft Gold
            'rgba(240, 98, 146, 0.7)',  // Pink
            'rgba(186, 104, 200, 0.7)'  // Lavender
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    render() {
        this.time++;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Smooth mouse coords interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

        // Draw Sun Rays (radial glows from top center)
        this.drawSunRays();

        // 0. Update & Render Easter Egg Particles
        for (let i = this.eggParticles.length - 1; i >= 0; i--) {
            const p = this.eggParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            
            if (p.alpha <= 0) {
                this.eggParticles.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            
            if (p.type === 'heart') {
                this.ctx.beginPath();
                const hs = p.size;
                this.ctx.translate(p.x, p.y);
                this.ctx.moveTo(0, 0);
                this.ctx.bezierCurveTo(-hs/2, -hs/2, -hs, hs/3, 0, hs);
                this.ctx.bezierCurveTo(hs, hs/3, hs/2, -hs/2, 0, 0);
                this.ctx.fill();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        // 1. Draw & Update Wind Particles
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.windParticles.forEach(p => {
            // Apply wind acceleration if transitioning
            let currentSpeed = p.speedX;
            if (this.isTransitioning) {
                currentSpeed *= (1 + this.transitionTime * 0.15);
            }
            
            p.x += currentSpeed;
            if (p.x > this.canvas.width) {
                p.x = -p.length;
                p.y = Math.random() * this.canvas.height;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p.x + p.length, p.y + (currentSpeed * 0.1));
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
            this.ctx.stroke();
        });

        // 2. Draw & Update Leaves
        this.leaves.forEach(l => {
            // Move down and sway horizontally
            l.y += l.speedY;
            l.swayOffset += l.swaySpeed;
            const swayX = Math.sin(l.swayOffset) * l.swayRange * 0.08;
            l.x += l.speedX + swayX;
            l.rotation += l.rotationSpeed;

            // Boundary checks
            if (l.y > this.canvas.height + 20 || l.x < -20 || l.x > this.canvas.width + 20) {
                l.y = -50;
                l.x = Math.random() * this.canvas.width;
                l.swayOffset = Math.random() * Math.PI * 2;
            }

            // Draw Leaf (double curves path)
            this.ctx.save();
            this.ctx.translate(l.x, l.y);
            this.ctx.rotate(l.rotation);
            this.ctx.fillStyle = l.color;
            this.ctx.beginPath();
            // Simple lens/leaf shape
            this.ctx.moveTo(0, -l.size);
            this.ctx.quadraticCurveTo(l.size * 0.6, 0, 0, l.size);
            this.ctx.quadraticCurveTo(-l.size * 0.6, 0, 0, -l.size);
            this.ctx.fill();
            this.ctx.restore();
        });

        // 3. Draw & Update Butterflies
        this.butterflies.forEach(b => {
            b.flapOffset += b.flapSpeed;
            const flapScale = Math.sin(b.flapOffset);
            
            // Cache last coordinates for orientation tracking during curves
            if (b.lastX === undefined) {
                b.lastX = b.x;
                b.lastY = b.y;
            }
            
            // Movement updates
            if (b.isEasterEgg) {
                // Follow parametric heart shape
                b.t += 0.055;
                
                if (b.t <= Math.PI * 2) {
                    const dx = 16 * Math.pow(Math.sin(b.t), 3);
                    const dy = -(13 * Math.cos(b.t) - 5 * Math.cos(2 * b.t) - 2 * Math.cos(3 * b.t) - Math.cos(4 * b.t));
                    
                    b.x = b.heartStartX + dx * 3.5;
                    b.y = b.heartStartY + dy * 3.5;
                    b.flapSpeed = 0.35; // flap faster while drawing heart
                    
                    // Spawn heart-trail particles
                    if (this.time % 2 === 0) {
                        this.eggParticles.push({
                            x: b.x,
                            y: b.y,
                            vx: Math.random() * 0.4 - 0.2,
                            vy: Math.random() * 0.4 - 0.2,
                            size: Math.random() * 4 + 2,
                            color: b.color,
                            alpha: 1.0,
                            decay: 0.02,
                            type: Math.random() > 0.4 ? 'heart' : 'sparkle'
                        });
                    }
                } else {
                    // Loop completed, rejoin swarm
                    b.isEasterEgg = false;
                    b.speedX = b.originalSpeedX;
                    b.speedY = b.originalSpeedY;
                    b.flapSpeed = Math.random() * 0.15 + 0.1;
                }
            } else if (this.isTransitioning) {
                // Fly rapidly forward (simulate camera passing through)
                b.z -= 0.02; // Zooms closer
                b.x += (b.x - this.canvas.width / 2) * 0.06; // Spread outwards
                b.y += (b.y - this.canvas.height / 2) * 0.06;
                b.flapSpeed = 0.4; // Wild flapping
            } else {
                // Standard flutter behavior
                b.angle += b.wiggleSpeed;
                const wiggle = Math.sin(b.angle) * 0.8;
                b.x += b.speedX + wiggle;
                b.y += b.speedY;

                // Mouse repulsion
                const dx = b.x - this.mouseX;
                const dy = b.y - this.mouseY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    b.x += (dx / dist) * force * 5;
                    b.y += (dy / dist) * force * 5;
                }

                // Wrap-around screen bounds
                if (b.y < -20) {
                    b.y = this.canvas.height + 20;
                    b.x = Math.random() * this.canvas.width;
                }
                if (b.x < -20) b.x = this.canvas.width + 20;
                if (b.x > this.canvas.width + 20) b.x = -20;
            }

            // Draw Butterfly
            this.ctx.save();
            
            let drawSize = b.size;
            let drawOpacity = 1;
            
            // Calculate scale based on Z depth
            if (this.isTransitioning) {
                const scaleZ = 1 / Math.max(b.z, 0.05);
                drawSize *= scaleZ;
                drawOpacity = Math.max(0, Math.min(1, b.z * 2.5));
            }

            this.ctx.translate(b.x, b.y);
            
            // Orient along its heading direction (supports circular curves during heart loops)
            const headingX = b.isEasterEgg ? (b.x - b.lastX) : b.speedX;
            const headingY = b.isEasterEgg ? (b.y - b.lastY) : b.speedY;
            b.lastX = b.x;
            b.lastY = b.y;
            
            this.ctx.rotate(Math.atan2(headingY, headingX) + Math.PI/2);

            // Wing left
            this.ctx.fillStyle = b.color;
            this.ctx.globalAlpha = drawOpacity;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = b.color;
            
            this.ctx.beginPath();
            this.ctx.ellipse(-drawSize * 0.6 * flapScale, -drawSize * 0.4, drawSize * 0.8 * Math.abs(flapScale), drawSize * 0.5, -Math.PI / 6, 0, Math.PI * 2);
            this.ctx.ellipse(-drawSize * 0.5 * flapScale, drawSize * 0.3, drawSize * 0.6 * Math.abs(flapScale), drawSize * 0.4, -Math.PI / 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Wing right
            this.ctx.beginPath();
            this.ctx.ellipse(drawSize * 0.6 * flapScale, -drawSize * 0.4, drawSize * 0.8 * Math.abs(flapScale), drawSize * 0.5, Math.PI / 6, 0, Math.PI * 2);
            this.ctx.ellipse(drawSize * 0.5 * flapScale, drawSize * 0.3, drawSize * 0.6 * Math.abs(flapScale), drawSize * 0.4, Math.PI / 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Antennae
            this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -drawSize * 0.8);
            this.ctx.quadraticCurveTo(-drawSize * 0.3, -drawSize * 1.2, -drawSize * 0.4, -drawSize * 1.5);
            this.ctx.moveTo(0, -drawSize * 0.8);
            this.ctx.quadraticCurveTo(drawSize * 0.3, -drawSize * 1.2, drawSize * 0.4, -drawSize * 1.5);
            this.ctx.stroke();

            // Body
            this.ctx.fillStyle = 'rgba(15, 15, 30, 0.9)';
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, drawSize * 0.15, drawSize * 0.8, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.restore();
        });

        // 4. Update transition metrics
        if (this.isTransitioning) {
            this.transitionTime++;
            if (this.transitionTime > 80) {
                // Done transition, switch scene
                this.completeTransition();
                return;
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    drawSunRays() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, -100, 50,
            this.canvas.width / 2, -100, this.canvas.height * 1.5
        );
        
        // Gentle sunrays pattern
        gradient.addColorStop(0, 'rgba(229, 192, 96, 0.15)'); // Golden center glow
        gradient.addColorStop(0.3, 'rgba(0, 230, 118, 0.03)'); // Soft emerald blend
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dynamic moving beams (LFO sweeps)
        const numBeams = 4;
        const widthFactor = 0.12;
        
        this.ctx.fillStyle = 'rgba(255, 255, 220, 0.015)';
        for (let i = 0; i < numBeams; i++) {
            const sweep = Math.sin(this.time * 0.003 + i * (Math.PI / numBeams)) * this.canvas.width * 0.25;
            const startX = this.canvas.width / 2 + sweep;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, -100);
            this.ctx.lineTo(startX - this.canvas.width * widthFactor, this.canvas.height);
            this.ctx.lineTo(startX + this.canvas.width * widthFactor, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    startTransition() {
        this.isTransitioning = true;
        this.transitionTime = 0;
        
        // Fade out overlay texts
        const textOverlay = this.container.querySelector('.nature-overlay');
        if (textOverlay) {
            textOverlay.style.transition = 'opacity 0.6s ease';
            textOverlay.style.opacity = '0';
        }
        
        // Blur the canvas elements slowly
        this.canvas.style.transition = 'filter 1.2s ease';
        this.canvas.style.filter = 'blur(15px)';
    }

    completeTransition() {
        // Cancel loops
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.autoTransitionTimer) {
            clearTimeout(this.autoTransitionTimer);
        }

        // Navigate to Scene 2.5 (Rain Memory)
        router.navigate('scene2_5');
    }

    triggerButterflyEgg(b) {
        b.isEasterEgg = true;
        b.t = 0;
        b.heartStartX = b.x;
        b.heartStartY = b.y - 25; // center shifted slightly up
        b.originalSpeedX = b.speedX;
        b.originalSpeedY = b.speedY;
        b.speedX = 0;
        b.speedY = 0;
        
        // Spawn pop sparkles
        for (let i = 0; i < 15; i++) {
            this.eggParticles.push({
                x: b.x,
                y: b.y,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                size: Math.random() * 3 + 2,
                color: '#e5c060',
                alpha: 1.0,
                decay: 0.03,
                type: 'sparkle'
            });
        }
        
        this.playChime(659.25); // E5 Chime
    }

    playChime(freq) {
        if (!musicManager || !musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(now + 0.7);
    }

    exit() {
        console.log("[Scene2] Exiting scene...");
        
        // Disable nature green aurora glow
        const gAurora = document.querySelector('.aurora-3');
        if (gAurora) gAurora.style.opacity = '0';
        
        this.container.classList.add('scene-exit');
    }

    destroy() {
        console.log("[Scene2] Destroying scene...");
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.autoTransitionTimer) {
            clearTimeout(this.autoTransitionTimer);
        }
        this.eggParticles = [];
        if (this.container) {
            this.container.remove();
        }
    }
}
