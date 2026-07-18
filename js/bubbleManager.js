/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - BUBBLE & RAIN MANAGER (bubbleManager.js)
   ========================================================================== */

class BubbleManager {
    constructor() {
        this.container = null;
        this.bubbles = [];
        this.rainItems = [];
        this.bubbleSpawnTimer = null;
        this.rainSpawnTimer = null;
        this.animationFrameId = null;
        this.isActive = false;
    }

    start() {
        if (this.isActive) return;
        this.isActive = true;
        console.log("[BubbleManager] Activating bubble and rain overlays...");

        // Inject Styles
        this.injectStyles();

        // Create Container
        this.container = document.createElement('div');
        this.container.id = 'bubble-overlay-container';
        document.body.appendChild(this.container);

        this.bubbles = [];
        this.rainItems = [];
        
        // Spawn loops
        this.bubbleSpawnTimer = setInterval(() => this.spawnBubble(), 1000);
        this.rainSpawnTimer = setInterval(() => this.spawnRainItem(), 450); // Frequent gentle rain of emojis

        // Render loop
        this.tick();
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        console.log("[BubbleManager] Deactivating bubble and rain overlays...");

        if (this.bubbleSpawnTimer) {
            clearInterval(this.bubbleSpawnTimer);
            this.bubbleSpawnTimer = null;
        }

        if (this.rainSpawnTimer) {
            clearInterval(this.rainSpawnTimer);
            this.rainSpawnTimer = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        if (this.container) {
            this.container.remove();
            this.container = null;
        }

        this.bubbles = [];
        this.rainItems = [];
    }

    injectStyles() {
        const styleId = 'bubble-manager-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #bubble-overlay-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 45; /* Above canvas backgrounds, below UI text cards */
                overflow: hidden;
            }
            .floating-bubble {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0) 70%);
                box-shadow: 
                    inset 0 15px 25px rgba(255, 255, 255, 0.35), 
                    inset 10px 0 30px rgba(255, 64, 129, 0.45), /* Rich Pink sheen */
                    inset -10px 0 30px rgba(0, 229, 255, 0.45), /* Rich Cyan sheen */
                    inset 0 -15px 25px rgba(255, 235, 59, 0.45), /* Rich Yellow sheen */
                    0 5px 15px rgba(0, 0, 0, 0.2);
                border: 1.5px solid rgba(255, 255, 255, 0.35);
                pointer-events: auto;
                cursor: pointer;
                transition: transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.22s ease;
                transform: translate(-50%, -50%) scale(1);
            }
            .floating-bubble::after {
                content: "";
                position: absolute;
                top: 15%;
                left: 15%;
                width: 20%;
                height: 20%;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.65);
            }
            .floating-bubble.popped {
                transform: translate(-50%, -50%) scale(1.4);
                opacity: 0;
                pointer-events: none;
            }
            .bubble-pop-sparks {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                opacity: 0.9;
                transition: transform 0.4s ease-out, opacity 0.4s ease;
            }
            .rain-item {
                position: absolute;
                pointer-events: none; /* Visual rain only, doesn't capture click events */
                user-select: none;
                z-index: 44; /* Slightly behind bubbles */
                filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
                will-change: transform;
            }
        `;
        document.head.appendChild(style);
    }

    spawnBubble() {
        if (!this.isActive || !this.container) return;

        // Cap concurrent bubbles at 12 to maintain cleanliness
        if (this.bubbles.filter(b => !b.popped).length >= 12) return;

        const size = Math.random() * 40 + 22; // Size between 22px and 62px
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + 50;

        const el = document.createElement('div');
        el.className = 'floating-bubble';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `0px`;
        el.style.top = `0px`;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        // Interaction listener
        const onPop = (e) => {
            e.stopPropagation();
            this.pop(bubbleData);
        };
        el.addEventListener('mousedown', onPop);
        el.addEventListener('touchstart', onPop, { passive: true });

        this.container.appendChild(el);

        const bubbleData = {
            el,
            x,
            y,
            size,
            speedY: Math.random() * 1.3 + 0.8, // Upward speed
            wobbleSpeed: Math.random() * 0.03 + 0.015,
            wobbleRange: Math.random() * 1.8 + 0.6,
            wobbleOffset: Math.random() * Math.PI * 2,
            popped: false
        };

        this.bubbles.push(bubbleData);
    }

    spawnRainItem() {
        if (!this.isActive || !this.container) return;

        // Cap active falling rain elements at 30 to prevent cluttered overlays
        if (this.rainItems.length >= 30) return;

        // Custom flower rain, heart rain, and ribbon elements (Emojis)
        const rainTypes = [
            '🌸', '🌹', '🌺', '🌼', // Flower rain
            '❤️', '💖', '💝', '💕', // Heart rain
            '🎀', '⭐', '✨'        // Ribbon & Sparkle rubber rain
        ];
        
        const emoji = rainTypes[Math.floor(Math.random() * rainTypes.length)];
        const size = Math.random() * 14 + 16; // FontSize between 16px and 30px
        const x = Math.random() * window.innerWidth;
        const y = -40; // Spawn just above screen

        const el = document.createElement('div');
        el.className = 'rain-item';
        el.innerText = emoji;
        el.style.fontSize = `${size}px`;
        el.style.left = `0px`;
        el.style.top = `0px`;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(0deg)`;

        this.container.appendChild(el);

        this.rainItems.push({
            el,
            x,
            y,
            speedY: Math.random() * 1.5 + 1.2, // Gravity fall speed
            wobbleSpeed: Math.random() * 0.02 + 0.01,
            wobbleRange: Math.random() * 1.5 + 0.5,
            wobbleOffset: Math.random() * Math.PI * 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 1.5 - 0.75
        });
    }

    pop(bubble) {
        if (bubble.popped) return;
        bubble.popped = true;

        bubble.el.classList.add('popped');
        this.playPopSound();

        // Spawn colorful circular pop sparks
        const colors = ['#f50057', '#00e5ff', '#ffeb3b', '#00e676', '#d500f9', '#ff9100'];
        const numSparks = 8;
        const sparks = [];

        for (let i = 0; i < numSparks; i++) {
            const sparkEl = document.createElement('div');
            sparkEl.className = 'bubble-pop-sparks';
            sparkEl.style.width = '6px';
            sparkEl.style.height = '6px';
            sparkEl.style.background = colors[Math.floor(Math.random() * colors.length)];
            sparkEl.style.left = `0px`;
            sparkEl.style.top = `0px`;
            sparkEl.style.transform = `translate3d(${bubble.x}px, ${bubble.y}px, 0)`;
            this.container.appendChild(sparkEl);

            const angle = (i / numSparks) * Math.PI * 2;
            const distance = bubble.size * 0.75 + Math.random() * 20;
            const targetX = bubble.x + Math.cos(angle) * distance;
            const targetY = bubble.y + Math.sin(angle) * distance;

            sparks.push({ el: sparkEl, targetX, targetY });
        }

        // Animate sparks outward
        requestAnimationFrame(() => {
            sparks.forEach(s => {
                s.el.style.transform = `translate3d(${s.targetX}px, ${s.targetY}px, 0) scale(0)`;
                s.el.style.opacity = '0';
            });
        });

        // Clean up elements
        setTimeout(() => {
            bubble.el.remove();
            sparks.forEach(s => s.el.remove());
            
            // Remove from list
            const index = this.bubbles.indexOf(bubble);
            if (index > -1) this.bubbles.splice(index, 1);
        }, 400);
    }

    playPopSound() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            
            const popCtx = new AudioContextClass();
            const osc = popCtx.createOscillator();
            const gain = popCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(750 + Math.random() * 300, popCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, popCtx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.04, popCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, popCtx.currentTime + 0.09);
            
            osc.connect(gain);
            gain.connect(popCtx.destination);
            
            osc.start();
            osc.stop(popCtx.currentTime + 0.1);
        } catch (e) {
            // Silence audio errors
        }
    }

    tick() {
        if (!this.isActive) return;

        // 1. Update bubbles moving UP
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            if (b.popped) continue;

            b.y -= b.speedY;
            b.wobbleOffset += b.wobbleSpeed;
            b.x += Math.sin(b.wobbleOffset) * b.wobbleRange;

            b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;

            if (b.y < -100) {
                b.el.remove();
                this.bubbles.splice(i, 1);
            }
        }

        // 2. Update rain items falling DOWN
        for (let i = this.rainItems.length - 1; i >= 0; i--) {
            const r = this.rainItems[i];

            r.y += r.speedY;
            r.wobbleOffset += r.wobbleSpeed;
            r.x += Math.sin(r.wobbleOffset) * r.wobbleRange;
            r.rotation += r.rotationSpeed;

            r.el.style.transform = `translate3d(${r.x}px, ${r.y}px, 0) rotate(${r.rotation}deg)`;

            // Remove if past bottom of viewport
            if (r.y > window.innerHeight + 50) {
                r.el.remove();
                this.rainItems.splice(i, 1);
            }
        }

        this.animationFrameId = requestAnimationFrame(() => this.tick());
    }
}

export const bubbleManager = new BubbleManager();
