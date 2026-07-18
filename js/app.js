/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - BOOTSTRAP ENTRY POINT (app.js)
   ========================================================================== */

import { Preloader } from './preloader.js';
import { musicManager } from './musicManager.js';
import { router } from './router.js';

class App {
    constructor() {
        this.starCanvas = document.getElementById('global-bg-canvas');
        this.ctx = null;
        this.stars = [];
        this.maxStars = 150;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.animationFrameId = null;
    }

    init() {
        console.log("[App] Bootstrapping birthday experience...");
        
        // Initialize Starfield Canvas background
        this.initStarfield();
        
        // Initialize Music controls
        musicManager.init();
        
        // Initialize Router (sets up debug binds, parameters)
        router.init();
        
        // Start Preloader sequence
        const loader = new Preloader(() => {
            console.log("[App] Preloader complete. Starting router...");
            router.start();
        });
        loader.init();
        
        // Bind window resize event
        window.addEventListener('resize', () => this.onResize());
        
        // Bind mouse movement for parallax depth effects
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('touchmove', (e) => this.onTouchMove(e));
    }

    initStarfield() {
        if (!this.starCanvas) return;
        this.ctx = this.starCanvas.getContext('2d');
        this.resizeStarfieldCanvas();
        
        // Generate Star instances
        this.stars = [];
        for (let i = 0; i < this.maxStars; i++) {
            this.stars.push({
                x: Math.random() * this.starCanvas.width,
                y: Math.random() * this.starCanvas.height,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005,
                direction: Math.random() > 0.5 ? 1 : -1,
                // Color layers (cool white, pale yellow, pale gold, soft purple)
                color: this.getRandomStarColor()
            });
        }
        
        // Start render loop
        this.renderStarfield();
    }

    getRandomStarColor() {
        const colors = [
            '255, 255, 255', // White
            '240, 245, 255', // Ice Blue
            '255, 248, 220', // Warm Cornsilk
            '229, 192, 96'   // Gold
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    resizeStarfieldCanvas() {
        this.starCanvas.width = window.innerWidth;
        this.starCanvas.height = window.innerHeight;
    }

    onResize() {
        this.resizeStarfieldCanvas();
        // Regenerate star bounds so they fit the screen
        this.stars.forEach(star => {
            if (star.x > this.starCanvas.width) star.x = Math.random() * this.starCanvas.width;
            if (star.y > this.starCanvas.height) star.y = Math.random() * this.starCanvas.height;
        });
    }

    onMouseMove(e) {
        // Normalize coordinates to ranges -1.0 to 1.0
        this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        this.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    onTouchMove(e) {
        if (e.touches.length > 0) {
            this.targetMouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
            this.targetMouseY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
        }
    }

    renderStarfield() {
        this.ctx.clearRect(0, 0, this.starCanvas.width, this.starCanvas.height);
        
        // Dampen mouse movements (smooth easing/interpolation)
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        
        // Draw and update stars
        this.stars.forEach(star => {
            // Update twinkle state
            star.alpha += star.speed * star.direction;
            if (star.alpha >= 1) {
                star.alpha = 1;
                star.direction = -1;
            } else if (star.alpha <= 0.1) {
                star.alpha = 0.1;
                star.direction = 1;
            }
            
            // Calculate parallax position (stars at different depths move at different speeds)
            // Smaller stars are deeper, so they move slower
            const parallaxMultiplier = star.size * 10;
            const px = star.x - (this.mouseX * parallaxMultiplier);
            const py = star.y - (this.mouseY * parallaxMultiplier);
            
            // Handle boundary wrap-around
            let drawX = px;
            let drawY = py;
            if (drawX < 0) drawX += this.starCanvas.width;
            if (drawX > this.starCanvas.width) drawX -= this.starCanvas.width;
            if (drawY < 0) drawY += this.starCanvas.height;
            if (drawY > this.starCanvas.height) drawY -= this.starCanvas.height;
            
            // Draw star
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${star.color}, ${star.alpha})`;
            this.ctx.fill();
        });
        
        this.animationFrameId = requestAnimationFrame(() => this.renderStarfield());
    }
}

// Instantiate and start app on window load
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
