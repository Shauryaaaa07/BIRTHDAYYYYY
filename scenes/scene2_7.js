/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 2.7: MEDHAK & KACCHUA POND (scene2_7.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { content } from '../js/content.js';

export class Scene2_7 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.animationFrameId = null;
        this.time = 0;
        this.isTransitioning = false;
        
        // Stars, Fireflies, and Water Ripples
        this.stars = [];
        this.fireflies = [];
        this.ripples = [];
        
        // Lotus leaves (Pads) positions
        this.leaves = [];
        
        // Medhak (Frog) State
        this.frog = {
            leafIndex: 0,
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            isJumping: false,
            jumpProgress: 0,
            jumpSpeed: 0.03, // Controls speed of leap
            jumpHeight: 90,  // Parabolic height peak
            startX: 0,
            startY: 0,
            scaleX: 1,
            scaleY: 1,
            wobbleOffset: 0
        };
        
        // Kacchua (Turtle) State
        this.turtle = {
            x: 100,
            y: 100,
            targetX: 150,
            targetY: 150,
            speed: 1.2,
            angle: 0,
            width: 48,
            height: 32,
            limbAngle: 0,
            isMoving: true,
            idleTimer: 0
        };

        this.boundResize = this.resizeCanvas.bind(this);
        this.boundClick = this.handleCanvasClick.bind(this);
    }

    init() {
        console.log("[Scene2.7] Initializing Pond Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene2-7-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="pond-canvas"></canvas>
            
            <div class="pond-layout">
                <div class="pond-header glass-card">
                    <h3>The Secret Pond</h3>
                    <p class="pond-subtitle">Medhak & Kacchua's Quiet Spot 🐸🐢</p>
                    <p class="pond-instructions">Tap Medhak to watch him jump! Guide Kacchua by clicking anywhere in the pond.</p>
                </div>
                
                <button id="pond-proceed-btn" class="glass-btn pond-btn">Follow the Path ✨</button>
            </div>
            
            <style>
                #scene2-7-container {
                    background: linear-gradient(180deg, #050512 0%, #0c1228 100%);
                    position: relative;
                }
                #pond-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1;
                }
                .pond-layout {
                    position: relative;
                    z-index: 5;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    height: 85%;
                    width: 90%;
                    max-width: 600px;
                    pointer-events: none;
                }
                .pond-header {
                    padding: 22px 30px;
                    text-align: center;
                    pointer-events: auto;
                    width: 100%;
                }
                .pond-header h3 {
                    font-family: var(--font-serif);
                    color: var(--color-gold);
                    font-size: 1.8rem;
                    letter-spacing: 2px;
                    margin-bottom: 5px;
                }
                .pond-subtitle {
                    color: var(--color-rose-gold);
                    font-size: 0.9rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }
                .pond-instructions {
                    font-size: 0.8rem;
                    color: var(--color-text-secondary);
                    line-height: 1.4;
                }
                .pond-btn {
                    pointer-events: auto;
                    margin-top: auto;
                    box-shadow: 0 0 15px rgba(229,192,96,0.15);
                }
            </style>
        `;
        
        this.canvas = this.container.querySelector('#pond-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', this.boundResize);
        this.canvas.addEventListener('click', this.boundClick);
        
        // Proceed button transition
        const proceedBtn = this.container.querySelector('#pond-proceed-btn');
        proceedBtn.addEventListener('click', () => {
            if (this.isTransitioning) return;
            this.isTransitioning = true;
            router.navigate('scene3');
        });
        
        // Populate static components
        this.initStars();
        this.initFireflies();
        
        return this.container;
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Re-calculate leaf positions dynamically based on canvas dimensions
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        this.leaves = [
            { x: w * 0.35, y: h * 0.65, r: Math.min(w, h) * 0.07 + 10 },
            { x: w * 0.65, y: h * 0.56, r: Math.min(w, h) * 0.07 + 10 },
            { x: w * 0.50, y: h * 0.78, r: Math.min(w, h) * 0.07 + 10 }
        ];
        
        // Snap frog to leaf position if not currently jumping
        if (!this.frog.isJumping) {
            const currentLeaf = this.leaves[this.frog.leafIndex];
            if (currentLeaf) {
                this.frog.x = currentLeaf.x;
                this.frog.y = currentLeaf.y - 5;
            }
        }
    }

    initStars() {
        this.stars = [];
        const count = 45;
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * (window.innerHeight * 0.45),
                size: Math.random() * 1.5 + 0.5,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    initFireflies() {
        this.fireflies = [];
        const count = 12;
        for (let i = 0; i < count; i++) {
            this.fireflies.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.65),
                size: Math.random() * 3 + 2,
                angleX: Math.random() * Math.PI * 2,
                angleY: Math.random() * Math.PI * 2,
                speedX: Math.random() * 0.015 + 0.005,
                speedY: Math.random() * 0.015 + 0.005,
                amplitudeX: Math.random() * 35 + 15,
                amplitudeY: Math.random() * 35 + 15,
                baseX: Math.random() * window.innerWidth,
                baseY: window.innerHeight * 0.3 + Math.random() * (window.innerHeight * 0.65),
                alpha: Math.random()
            });
        }
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Check if user clicked on the frog
        const distToFrog = Math.hypot(clickX - this.frog.x, clickY - this.frog.y);
        if (distToFrog < 40 && !this.frog.isJumping) {
            this.triggerFrogJump();
            return;
        }
        
        // If not frog, guide the turtle to the clicked coordinate (must be in water / pond zone)
        if (clickX > this.canvas.width * 0.18) {
            this.turtle.targetX = clickX;
            this.turtle.targetY = clickY;
            this.turtle.isMoving = true;
            this.turtle.idleTimer = 0;
            
            // Add a click ripple
            this.ripples.push({
                x: clickX,
                y: clickY,
                radius: 0,
                maxRadius: 40,
                alpha: 1,
                speed: 1.5
            });
        }
    }

    triggerFrogJump() {
        this.frog.isJumping = true;
        this.frog.jumpProgress = 0;
        this.frog.startX = this.frog.x;
        this.frog.startY = this.frog.y;
        
        // Cycle leaf index: 0 -> 1 -> 2 -> 0 -> ...
        const nextIndex = (this.frog.leafIndex + 1) % this.leaves.length;
        const targetLeaf = this.leaves[nextIndex];
        this.frog.targetX = targetLeaf.x;
        this.frog.targetY = targetLeaf.y - 5;
        this.frog.leafIndex = nextIndex;
        
        this.playJumpSound();
    }

    playJumpSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            const audioCtx = new AudioContextClass();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            // Jump sweeping frequency
            osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + 0.18);
            osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.35);
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.38);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
            // Ignore audio initialization restrictions
        }
    }

    enter() {
        console.log("[Scene2.7] Entering scene...");
        this.container.classList.add('scene-active');
        
        // Reset state variables
        this.isTransitioning = false;
        this.time = 0;
        
        // Set initial positions
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.turtle.x = w * 0.8;
        this.turtle.y = h * 0.75;
        this.turtle.targetX = w * 0.7;
        this.turtle.targetY = h * 0.68;
        this.turtle.isMoving = true;
        
        // Start ticks
        this.tick();
    }

    tick() {
        this.time++;
        this.updateObjects();
        this.draw();
        
        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }

    updateObjects() {
        // 1. Update stars twinkle phases
        this.stars.forEach(s => {
            s.twinklePhase += s.twinkleSpeed;
        });
        
        // 2. Update fireflies (Brownian-style organic floating motion)
        this.fireflies.forEach(f => {
            f.angleX += f.speedX;
            f.angleY += f.speedY;
            f.x = f.baseX + Math.sin(f.angleX) * f.amplitudeX;
            f.y = f.baseY + Math.cos(f.angleY) * f.amplitudeY;
            f.alpha = 0.4 + Math.sin(f.angleX * 1.5) * 0.4;
            
            // Boundary wrap around
            if (f.x < 0) f.baseX = this.canvas.width;
            if (f.x > this.canvas.width) f.baseX = 0;
        });
        
        // 3. Update ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const rip = this.ripples[i];
            rip.radius += rip.speed;
            rip.alpha = 1 - (rip.radius / rip.maxRadius);
            
            if (rip.alpha <= 0) {
                this.ripples.splice(i, 1);
            }
        }
        
        // 4. Update Medhak (Frog) Jump Physics
        if (this.frog.isJumping) {
            this.frog.jumpProgress += this.frog.jumpSpeed;
            
            if (this.frog.jumpProgress >= 1) {
                // Landed!
                this.frog.jumpProgress = 1;
                this.frog.isJumping = false;
                this.frog.x = this.frog.targetX;
                this.frog.y = this.frog.targetY;
                
                // Add splash ripples!
                this.ripples.push({
                    x: this.frog.x,
                    y: this.frog.y + 10,
                    radius: 0,
                    maxRadius: 35,
                    alpha: 1,
                    speed: 1.2
                });
                
                // Squash effect on landing
                this.frog.scaleX = 1.35;
                this.frog.scaleY = 0.65;
            } else {
                // Interpolate X (linear) and Y (parabolic)
                const p = this.frog.jumpProgress;
                this.frog.x = this.frog.startX + p * (this.frog.targetX - this.frog.startX);
                
                // Base linear Y
                const linearY = this.frog.startY + p * (this.frog.targetY - this.frog.startY);
                // Parabolic peak delta: h = height * sin(pi * progress)
                const peak = Math.sin(p * Math.PI) * this.frog.jumpHeight;
                this.frog.y = linearY - peak;
                
                // Stretch effect during flight
                this.frog.scaleX = 0.82;
                this.frog.scaleY = 1.22;
            }
        } else {
            // Restore squish scale back to 1.0 slowly
            this.frog.scaleX += (1 - this.frog.scaleX) * 0.12;
            this.frog.scaleY += (1 - this.frog.scaleY) * 0.12;
            
            // Breathe wobble
            this.frog.wobbleOffset += 0.05;
            this.frog.scaleY += Math.sin(this.frog.wobbleOffset) * 0.003;
        }
        
        // 5. Update Kacchua (Turtle) Swimming AI
        if (this.turtle.isMoving) {
            const dx = this.turtle.targetX - this.turtle.x;
            const dy = this.turtle.targetY - this.turtle.y;
            const distance = Math.hypot(dx, dy);
            
            if (distance < 5) {
                this.turtle.isMoving = false;
                this.turtle.idleTimer = 0;
            } else {
                // Calculate target angle and rotate smoothly
                const targetAngle = Math.atan2(dy, dx);
                let angleDiff = targetAngle - this.turtle.angle;
                
                // Normalize angle diff to (-PI, PI)
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                this.turtle.angle += angleDiff * 0.1;
                
                // Move forward
                this.turtle.x += Math.cos(this.turtle.angle) * this.turtle.speed;
                this.turtle.y += Math.sin(this.turtle.angle) * this.turtle.speed;
                
                // Sine leg paddle frequency
                this.turtle.limbAngle += 0.12;
                
                // Spawn soft path trail ripples periodically
                if (this.time % 22 === 0) {
                    this.ripples.push({
                        x: this.turtle.x - Math.cos(this.turtle.angle) * 15,
                        y: this.turtle.y - Math.sin(this.turtle.angle) * 15,
                        radius: 0,
                        maxRadius: 18,
                        alpha: 0.6,
                        speed: 0.65
                    });
                }
            }
        } else {
            // Idle swimming movement (float gently back and forth)
            this.turtle.idleTimer += 0.015;
            this.turtle.y += Math.sin(this.turtle.idleTimer) * 0.12;
            this.turtle.limbAngle += 0.02; // slow paddle
            
            // Periodically wander on its own if user does not touch
            if (this.time % 400 === 0) {
                const w = this.canvas.width;
                const h = this.canvas.height;
                this.turtle.targetX = w * 0.25 + Math.random() * (w * 0.65);
                this.turtle.targetY = h * 0.5 + Math.random() * (h * 0.38);
                this.turtle.isMoving = true;
            }
        }
    }

    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // 1. Clear background
        this.ctx.fillStyle = '#050614';
        this.ctx.fillRect(0, 0, w, h);
        
        // 2. Draw stars
        this.stars.forEach(s => {
            const opacity = 0.25 + Math.abs(Math.sin(s.twinklePhase)) * 0.75;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 3. Draw deep water pond fill
        const pondGrad = this.ctx.createLinearGradient(0, h * 0.3, 0, h);
        pondGrad.addColorStop(0, '#0c1630');
        pondGrad.addColorStop(0.5, '#07243c');
        pondGrad.addColorStop(1, '#021124');
        this.ctx.fillStyle = pondGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.16, h * 0.35); // Start after the road border
        this.ctx.bezierCurveTo(w * 0.5, h * 0.28, w * 0.8, h * 0.32, w, h * 0.3);
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(w * 0.18, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 4. Draw road on the left side
        this.ctx.fillStyle = '#10101c';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(w * 0.18, 0);
        this.ctx.lineTo(w * 0.18, h);
        this.ctx.lineTo(0, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Road shoulder/border line
        this.ctx.strokeStyle = '#25293d';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.18, 0);
        this.ctx.lineTo(w * 0.18, h);
        this.ctx.stroke();
        
        // 5. Draw warm Street Lamp glow (Soft light cone)
        const lampX = w * 0.11;
        const lampY = h * 0.22;
        const lightConeGrad = this.ctx.createRadialGradient(lampX, lampY, 20, lampX + 50, lampY + 200, 350);
        lightConeGrad.addColorStop(0, 'rgba(235, 190, 80, 0.42)');
        lightConeGrad.addColorStop(0.3, 'rgba(235, 190, 80, 0.18)');
        lightConeGrad.addColorStop(1, 'rgba(235, 190, 80, 0)');
        
        this.ctx.fillStyle = lightConeGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(lampX, lampY);
        this.ctx.lineTo(w * 0.02, h);
        this.ctx.lineTo(w * 0.42, h);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw Street Lamp Pole
        this.ctx.strokeStyle = '#181926';
        this.ctx.lineWidth = 7;
        this.ctx.beginPath();
        this.ctx.moveTo(w * 0.08, h * 0.7); // Base
        this.ctx.lineTo(w * 0.08, h * 0.26); // Go up
        this.ctx.arcTo(w * 0.08, lampY, w * 0.11, lampY, 15); // Curve top
        this.ctx.lineTo(lampX, lampY); // Bulb head arm
        this.ctx.stroke();
        
        // Draw lamp head light source cap
        this.ctx.fillStyle = '#ffd752';
        this.ctx.beginPath();
        this.ctx.arc(lampX, lampY, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#3a3a4c';
        this.ctx.fillRect(lampX - 9, lampY - 8, 18, 5);
        
        // 6. Draw water ripples
        this.ripples.forEach(r => {
            this.ctx.strokeStyle = `rgba(0, 229, 255, ${r.alpha})`;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2); // Oval perspective ripples
            this.ctx.stroke();
        });
        
        // 7. Draw lotus leaves (pads)
        this.leaves.forEach((l, index) => {
            this.ctx.save();
            this.ctx.translate(l.x, l.y);
            
            // Draw radial shadow underneath leaf pad
            const padShadow = this.ctx.createRadialGradient(0, 0, 5, 0, 0, l.r + 5);
            padShadow.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
            padShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = padShadow;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 5, l.r + 2, (l.r + 2) * 0.45, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw green leaf pad with perspective
            this.ctx.fillStyle = '#114a38';
            this.ctx.strokeStyle = '#1e7557';
            this.ctx.lineWidth = 2.5;
            
            this.ctx.beginPath();
            // We draw a circle with a V-shape pie slice missing (classic water lily leaf shape)
            const notchAngle = 0.22 * Math.PI;
            this.ctx.ellipse(0, 0, l.r, l.r * 0.45, 0, notchAngle, Math.PI * 2 - notchAngle);
            this.ctx.lineTo(0, 0);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw subtle white/pink lotus flower on leaf 1 (decorative)
            if (index === 1) {
                this.drawLotusFlower(l.r * 0.5, -l.r * 0.2);
            }
            
            this.ctx.restore();
        });
        
        // 8. Draw Kacchua (Turtle) Swimming
        this.drawTurtle();
        
        // 9. Draw Medhak (Frog)
        this.drawFrog();
        
        // 10. Draw Tree silhouettes hanging from top-right corner
        this.drawWeepingWillowSilhouettes();
        
        // 11. Draw glowing fireflies (bug glows)
        this.fireflies.forEach(f => {
            const glowGrad = this.ctx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.size * 4);
            glowGrad.addColorStop(0, `rgba(235, 255, 110, ${f.alpha})`);
            glowGrad.addColorStop(0.3, `rgba(235, 255, 110, ${f.alpha * 0.4})`);
            glowGrad.addColorStop(1, 'rgba(235, 255, 110, 0)');
            
            this.ctx.fillStyle = glowGrad;
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawLotusFlower(x, y) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(0.8, 0.4); // perspective squish
        
        this.ctx.fillStyle = '#ffb7d5';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        
        // Draw 6 petals radiating
        for (let i = 0; i < 6; i++) {
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, 10, 4, (i * Math.PI) / 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        // Center core
        this.ctx.fillStyle = '#ffd54f';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    drawTurtle() {
        const t = this.turtle;
        this.ctx.save();
        this.ctx.translate(t.x, t.y);
        this.ctx.rotate(t.angle);
        
        // Draw flippers (limbs waving)
        const wave = Math.sin(t.limbAngle) * 0.4;
        this.ctx.fillStyle = '#4e7b4e';
        this.ctx.strokeStyle = '#2d542d';
        this.ctx.lineWidth = 1.5;
        
        // Front flippers
        this.ctx.beginPath();
        this.ctx.ellipse(8, -12, 10, 5, -0.4 + wave, 0, Math.PI * 2); // Left front
        this.ctx.ellipse(8, 12, 10, 5, 0.4 - wave, 0, Math.PI * 2);  // Right front
        this.ctx.fill();
        this.ctx.stroke();
        
        // Back flippers
        this.ctx.beginPath();
        this.ctx.ellipse(-14, -10, 8, 4, 0.4 - wave * 0.5, 0, Math.PI * 2); // Left back
        this.ctx.ellipse(-14, 10, 8, 4, -0.4 + wave * 0.5, 0, Math.PI * 2); // Right back
        this.ctx.fill();
        this.ctx.stroke();
        
        // Tail
        this.ctx.fillStyle = '#4e7b4e';
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 0);
        this.ctx.lineTo(-26, -2);
        this.ctx.lineTo(-26, 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Head
        this.ctx.fillStyle = '#4e7b4e';
        this.ctx.beginPath();
        this.ctx.arc(24, 0, 7, 0, Math.PI * 2); // Head shell
        this.ctx.fill();
        
        // Little black eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(27, -3, 1, 0, Math.PI * 2);
        this.ctx.arc(27, 3, 1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw Shell (Kacchua back)
        this.ctx.fillStyle = '#6d4c41';
        this.ctx.strokeStyle = '#3e2723';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, t.width / 2, t.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw shell plates (hexagons pattern detail)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-10, -5, 20, 10);
        
        this.ctx.restore();
    }

    drawFrog() {
        const f = this.frog;
        this.ctx.save();
        this.ctx.translate(f.x, f.y);
        
        // Apply jump squish/stretch transforms
        this.ctx.scale(f.scaleX, f.scaleY);
        
        // Draw shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 12, 16 * f.scaleX, 6 * f.scaleY, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Legs (Drawn wider if squishing / jumping)
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.strokeStyle = '#1b5e20';
        this.ctx.lineWidth = 2;
        
        if (f.isJumping) {
            // Legs extended in air!
            this.ctx.beginPath();
            this.ctx.ellipse(-12, 6, 4, 10, -0.5, 0, Math.PI * 2); // left leg extended
            this.ctx.ellipse(12, 6, 4, 10, 0.5, 0, Math.PI * 2);  // right leg extended
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // Frog legs tucked in folding shape
            this.ctx.beginPath();
            this.ctx.arc(-13, 8, 7, 0, Math.PI * 2); // left thigh
            this.ctx.arc(13, 8, 7, 0, Math.PI * 2);  // right thigh
            this.ctx.fill();
            this.ctx.stroke();
            
            // Webbed feet
            this.ctx.beginPath();
            this.ctx.ellipse(-14, 13, 8, 3, 0.2, 0, Math.PI * 2);
            this.ctx.ellipse(14, 13, 8, 3, -0.2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Body (Main green oval)
        this.ctx.fillStyle = '#4caf50';
        this.ctx.strokeStyle = '#2e7d32';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Yellow belly
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 3, 9, 6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Big Cartoon Eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.strokeStyle = '#2e7d32';
        this.ctx.lineWidth = 1.5;
        
        // Left Eye base
        this.ctx.beginPath();
        this.ctx.arc(-8, -11, 5.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right Eye base
        this.ctx.beginPath();
        this.ctx.arc(8, -11, 5.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Pupils (black dots looking inward/forward)
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-7.5, -11, 2.5, 0, Math.PI * 2);
        this.ctx.arc(7.5, -11, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Wide cute frog smile
        this.ctx.strokeStyle = '#1b5e20';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.arc(0, -1, 5, 0.1 * Math.PI, 0.9 * Math.PI); // smile curve
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawWeepingWillowSilhouettes() {
        const w = this.canvas.width;
        
        this.ctx.fillStyle = '#040710';
        
        // Left overhead tree branch
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 100, 40, Math.PI / 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right overhead branches
        this.ctx.beginPath();
        this.ctx.ellipse(w, 0, 200, 70, -Math.PI / 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Hanging willow vines (detailed stroke lines)
        this.ctx.strokeStyle = '#040710';
        this.ctx.lineWidth = 2.5;
        
        const vinePositions = [w - 30, w - 80, w - 120, w - 180, w - 240, 20, 70, 120];
        vinePositions.forEach((x, i) => {
            const length = 110 + Math.sin(this.time * 0.01 + i) * 15;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.quadraticCurveTo(x + Math.sin(this.time * 0.015 + i) * 10, length * 0.5, x + Math.sin(this.time * 0.02 + i) * 6, length);
            this.ctx.stroke();
        });
    }

    exit() {
        console.log("[Scene2.7] Exiting scene...");
        this.container.classList.add('scene-exit');
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        console.log("[Scene2.7] Destroying scene...");
        window.removeEventListener('resize', this.boundResize);
        
        if (this.canvas) {
            this.canvas.removeEventListener('click', this.boundClick);
        }
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}
