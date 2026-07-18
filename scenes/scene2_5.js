/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 2.5: RAIN MEMORY (scene2_5.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene2_5 {
    constructor() {
        this.container = null;
        this.canvas = null;
        this.ctx = null;
        
        this.raindrops = [];
        this.ripples = [];
        this.trails = [];
        this.hearts = [];
        
        this.animationFrameId = null;
        this.time = 0;
        this.isTransitioning = false;
        this.lightningFlash = 0;
        
        // Audio nodes for synthesized rain noise
        this.rainNoiseSource = null;
        this.rainGainNode = null;
        
        // Paper Boat state
        this.boat = {
            x: -100,
            y: 0,
            width: 70,
            height: 35,
            speedX: 0.45,
            isClicked: false,
            clickedTime: 0,
            amplitude: 4,
            frequency: 0.02
        };
    }

    init() {
        console.log(" Initializing Rain Memory Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene2-5-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <canvas id="rain-canvas"></canvas>
            <div class="rain-overlay">
                <div id="rain-quote-card" class="rain-quote-card">
                    <p class="rain-quote-text">${content.rainQuote}</p>
                </div>
            </div>
        `;
        
        this.canvas = this.container.querySelector('#rain-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize boat position based on screen
        this.boat.x = -120;
        this.boat.y = window.innerHeight * 0.72;
        
        // Capture mouse movement for water trails
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.trails.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                size: Math.random() * 6 + 4,
                alpha: 0.7,
                decay: 0.02
            });
        });
        
        // Canvas clicks for ripples and paper boat
        this.container.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Check if clicked the paper boat
            const boatYOffset = Math.sin(this.time * this.boat.frequency) * this.boat.amplitude;
            const bx = this.boat.x;
            const by = this.boat.y + boatYOffset;
            
            if (clickX > bx && clickX < bx + this.boat.width &&
                clickY > by - 25 && clickY < by + this.boat.height) {
                this.triggerBoatAction();
                return;
            }
            
            // Create custom ripple on click
            this.ripples.push({
                x: clickX,
                y: clickY,
                radius: 1,
                maxRadius: Math.random() * 35 + 25,
                alpha: 0.8,
                speed: 1.2
            });
            
            this.playWaterPlop();
        });
        
        this.injectStyles();
        
        // Setup initial raindrops
        for (let i = 0; i < 90; i++) {
            this.raindrops.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                len: Math.random() * 25 + 15,
                speedY: Math.random() * 9 + 8,
                speedX: -1 - Math.random() * 1.5, // Wind blow angle
                opacity: Math.random() * 0.25 + 0.1
            });
        }
        
        return this.container;
    }

    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.boat.y = window.innerHeight * 0.72;
        }
    }

    enter() {
        console.log("[Scene2.5] Entering Rain Memory...");
        
        // Ensure Song 1 plays continuously
        musicManager.playTrack(1);
        
        // Programmatically Synthesize Rain Noise
        this.startRainSynthesis();
        
        // Fade in quote card
        setTimeout(() => {
            this.container.classList.add('scene-active');
            const card = this.container.querySelector('#rain-quote-card');
            if (card) card.classList.add('reveal');
        }, 100);
        
        // Start animation loop
        this.render();
        
        // Transition trigger after 11 seconds
        this.transitionTimer = setTimeout(() => {
            this.startTransition();
        }, 11000);
    }

    startRainSynthesis() {
        if (!musicManager.audioCtx) return;
        const ctx = musicManager.audioCtx;
        
        try {
            const bufferSize = 2 * ctx.sampleRate;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            this.rainNoiseSource = ctx.createBufferSource();
            this.rainNoiseSource.buffer = noiseBuffer;
            this.rainNoiseSource.loop = true;
            
            // Soft lowpass filter to make it sound like gentle outdoor rain
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, ctx.currentTime);
            
            this.rainGainNode = ctx.createGain();
            this.rainGainNode.gain.setValueAtTime(0, ctx.currentTime);
            
            this.rainNoiseSource.connect(filter);
            filter.connect(this.rainGainNode);
            this.rainGainNode.connect(musicManager.masterGain || ctx.destination);
            
            this.rainNoiseSource.start();
            
            // Softly fade in rain sound
            this.rainGainNode.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 1.5);
        } catch (e) {
            console.warn("[Scene2.5] Rain Audio synthesis failed", e);
        }
    }

    stopRainSynthesis() {
        if (this.rainGainNode && musicManager.audioCtx) {
            const ctx = musicManager.audioCtx;
            this.rainGainNode.gain.cancelScheduledValues(ctx.currentTime);
            this.rainGainNode.gain.setValueAtTime(this.rainGainNode.gain.value, ctx.currentTime);
            this.rainGainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
            
            setTimeout(() => {
                if (this.rainNoiseSource) {
                    try {
                        this.rainNoiseSource.stop();
                    } catch(e){}
                    this.rainNoiseSource = null;
                }
            }, 1300);
        }
    }

    playWaterPlop() {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 + Math.random() * 100, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
        
        gain.gain.setValueAtTime(0.012, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain || musicManager.audioCtx.destination);
        osc.start();
        osc.stop(now + 0.18);
    }

    triggerBoatAction() {
        if (this.boat.isClicked) return;
        this.boat.isClicked = true;
        this.boat.speedX = 2.8; // Sail fast away!
        
        // Spawn floating hearts
        for (let i = 0; i < 12; i++) {
            this.hearts.push({
                x: this.boat.x + 35,
                y: this.boat.y - 10,
                vx: Math.random() * 1.5 - 0.75,
                vy: -(Math.random() * 1.2 + 0.6),
                size: Math.random() * 6 + 3,
                alpha: 1.0,
                decay: 0.015
            });
        }
        
        // Play sweet chime
        this.playWaterPlop();
    }

    render() {
        this.time++;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water background puddles base (cool blue glow reflection overlay)
        this.drawPuddlesBase();

        // Simulate lightning strikes
        if (Math.random() > 0.994 && this.lightningFlash <= 0 && !this.isTransitioning) {
            this.lightningFlash = Math.random() * 0.4 + 0.2;
        }
        if (this.lightningFlash > 0) {
            this.lightningFlash -= 0.025;
            this.ctx.fillStyle = `rgba(224, 242, 255, ${this.lightningFlash})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Update & Draw Raindrops
        this.ctx.lineWidth = 1.2;
        this.raindrops.forEach(drop => {
            drop.y += drop.speedY;
            drop.x += drop.speedX;
            
            if (drop.y > this.canvas.height) {
                drop.y = -50;
                drop.x = Math.random() * this.canvas.width;
                
                // Spawn ripple at bottom impact
                if (Math.random() > 0.45 && !this.isTransitioning) {
                    this.ripples.push({
                        x: drop.x,
                        y: this.canvas.height * 0.65 + Math.random() * (this.canvas.height * 0.35),
                        radius: 0.5,
                        maxRadius: Math.random() * 12 + 6,
                        alpha: 0.4,
                        speed: 0.45
                    });
                }
            }
            
            this.ctx.strokeStyle = `rgba(174, 219, 255, ${drop.opacity})`;
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x + drop.speedX * 1.5, drop.y + drop.len);
            this.ctx.stroke();
        });
        
        // Update & Draw Water Ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += r.speed;
            r.alpha -= 0.015;
            
            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
                continue;
            }
            
            this.ctx.strokeStyle = `rgba(180, 224, 255, ${r.alpha})`;
            this.ctx.lineWidth = 0.8;
            this.ctx.beginPath();
            // Draw ellipse for flat perspective puddles
            this.ctx.ellipse(r.x, r.y, r.radius * 1.5, r.radius * 0.6, 0, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Update & Draw Mouse Trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const t = this.trails[i];
            t.alpha -= t.decay;
            if (t.alpha <= 0) {
                this.trails.splice(i, 1);
                continue;
            }
            
            this.ctx.fillStyle = `rgba(174, 219, 255, ${t.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Update & Draw Floating Hearts
        for (let i = this.hearts.length - 1; i >= 0; i--) {
            const h = this.hearts[i];
            h.x += h.vx;
            h.y += h.vy;
            h.alpha -= h.decay;
            
            if (h.alpha <= 0) {
                this.hearts.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.globalAlpha = h.alpha;
            this.ctx.fillStyle = '#ff69b4';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ff69b4';
            
            this.ctx.beginPath();
            const hs = h.size;
            this.ctx.translate(h.x, h.y);
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(-hs/2, -hs/2, -hs, hs/3, 0, hs);
            this.ctx.bezierCurveTo(hs, hs/3, hs/2, -hs/2, 0, 0);
            this.ctx.fill();
            this.ctx.restore();
        }
        
        // Update & Draw Paper Boat
        this.drawPaperBoat();
        
        this.animationFrameId = requestAnimationFrame(() => this.render());
    }

    drawPuddlesBase() {
        this.ctx.save();
        const grad = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 10,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        grad.addColorStop(0, 'rgba(11, 16, 38, 0.4)');
        grad.addColorStop(1, 'rgba(6, 6, 18, 0.8)');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    drawPaperBoat() {
        this.boat.x += this.boat.speedX;
        
        // Boat wraps around if not clicked
        if (this.boat.x > this.canvas.width + 100) {
            this.boat.x = -100;
            this.boat.isClicked = false;
            this.boat.speedX = 0.45;
        }
        
        const floatYOffset = Math.sin(this.time * this.boat.frequency) * this.boat.amplitude;
        const bx = this.boat.x;
        const by = this.boat.y + floatYOffset;
        
        this.ctx.save();
        this.ctx.translate(bx, by);
        
        // Subtle rocking rotation
        const rockAngle = Math.cos(this.time * this.boat.frequency) * 0.05;
        this.ctx.rotate(rockAngle);
        
        // Drawing detailed white origami paper boat
        this.ctx.fillStyle = 'rgba(240, 245, 255, 0.9)';
        this.ctx.strokeStyle = 'rgba(100, 150, 200, 0.35)';
        this.ctx.lineWidth = 1;
        
        // Base main hull
        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);
        this.ctx.lineTo(70, 20);
        this.ctx.lineTo(55, 35);
        this.ctx.lineTo(15, 35);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Middle sail triangle
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.moveTo(35, 0);
        this.ctx.lineTo(50, 20);
        this.ctx.lineTo(20, 20);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Left hull flap
        this.ctx.fillStyle = 'rgba(220, 230, 250, 0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);
        this.ctx.lineTo(35, 20);
        this.ctx.lineTo(15, 35);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right hull flap
        this.ctx.beginPath();
        this.ctx.moveTo(70, 20);
        this.ctx.lineTo(35, 20);
        this.ctx.lineTo(55, 35);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    startTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Stop rain synthesis
        this.stopRainSynthesis();
        
        // Fade out quote card
        const card = this.container.querySelector('#rain-quote-card');
        if (card) {
            card.classList.remove('reveal');
            card.style.opacity = '0';
        }
        
        // Slowly blur and transition
        this.canvas.style.transition = 'filter 1.2s ease, opacity 1.2s ease';
        this.canvas.style.filter = 'blur(10px)';
        this.canvas.style.opacity = '0';
        
        setTimeout(() => {
            this.completeTransition();
        }, 1200);
    }

    completeTransition() {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.transitionTimer) clearTimeout(this.transitionTimer);
        router.navigate('scene2_7');
    }

    exit() {
        console.log("[Scene2.5] Exiting scene...");
        this.container.classList.add('scene-exit');
        this.stopRainSynthesis();
        if (this.transitionTimer) clearTimeout(this.transitionTimer);
    }

    destroy() {
        console.log("[Scene2.5] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.transitionTimer) clearTimeout(this.transitionTimer);
        this.stopRainSynthesis();
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'rain-style';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #rain-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
            }
            .rain-overlay {
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
            .rain-quote-card {
                max-width: 480px;
                width: 90%;
                text-align: center;
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 1.2s ease, transform 1.2s ease;
            }
            .rain-quote-card.reveal {
                opacity: 1;
                transform: scale(1);
            }
            .rain-quote-text {
                font-family: var(--font-serif);
                font-size: 1.25rem;
                font-style: italic;
                line-height: 1.6;
                color: #e3f2fd;
                text-shadow: 0 0 10px rgba(174, 219, 255, 0.4), 0 2px 5px rgba(0,0,0,0.6);
            }
            @media (max-width: 480px) {
                .rain-quote-text {
                    font-size: 1.05rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}
