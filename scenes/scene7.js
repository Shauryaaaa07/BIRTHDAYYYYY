/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 7: SLIDESHOW & LETTER (scene7.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';
import { mediaConfig } from '../js/mediaConfig.js';

export class Scene7 {
    constructor() {
        this.container = null;
        this.currentSlideIndex = 0;
        this.totalSlides = 15;
        this.slideInterval = null;
        this.isSlideshowComplete = false;
        
        // Parallax coordinates
        this.parallaxX = 0;
        this.parallaxY = 0;
    }

    init() {
        console.log("[Scene7] Initializing Slideshow Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene7-container';
        this.container.className = 'scene-container';
        
        const letter = content.bestFriendLetter;
        const paragraphsHTML = letter.paragraphs.map(p => `<p class="letter-paragraph">${p}</p>`).join('');
        
        this.container.innerHTML = `
            <div class="slideshow-wrapper">
                <h2 class="gallery-title">Birthday Girl 👑</h2>
                <!-- Slide viewport -->
                <div id="slideshow-frame" class="slideshow-frame glass-card">
                    <div class="slides-container"></div>
                    <div id="slide-caption" class="slide-caption">Memory #01</div>
                    <div class="slide-indicator">1 / ${this.totalSlides}</div>
                </div>
            </div>
            
            <!-- Envelope Container (floating in background initially) -->
            <div id="envelope-wrapper" class="envelope-wrapper in-background">
                <div id="letter-envelope" class="letter-envelope grab">
                    <div class="envelope-back"></div>
                    <div class="envelope-paper glass-card">
                        <div class="letter-scroll-box">
                            <h2 class="letter-title">${letter.title}</h2>
                            ${paragraphsHTML}
                            <button id="letter-close-btn" class="glass-btn letter-btn">${content.followLightBtnText || 'Follow the Light'}</button>
                        </div>
                    </div>
                    <div class="envelope-front"></div>
                    <div class="envelope-flap"></div>
                    <!-- Wax Seal -->
                    <div id="wax-seal" class="wax-seal">
                        <div class="seal-inner">T</div>
                    </div>
                </div>
                <div class="envelope-prompt">${content.breakSealText || 'Break the seal to read the letter...'}</div>
            </div>
        `;

        this.injectStyles();
        this.setupSlides();
        
        // Parallax hover movement
        this.container.addEventListener('mousemove', (e) => this.handleParallax(e));
        
        // Click envelope seal to open
        this.container.querySelector('#wax-seal').addEventListener('click', () => this.openEnvelope());
        
        // Proceed button inside letter
        this.container.querySelector('#letter-close-btn').addEventListener('click', () => this.proceed());

        return this.container;
    }

    enter() {
        console.log("[Scene7] Entering Slideshow Scene...");
        musicManager.playTrack(4);

        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Start slide rotation timer
        this.startSlideshow();
    }

    setupSlides() {
        const container = this.container.querySelector('.slides-container');
        container.innerHTML = '';

        const transitionStyles = [
            'transition-fade-blur',
            'transition-slide-right',
            'transition-zoom-in',
            'transition-slide-up',
            'transition-rotate-enter'
        ];

        for (let i = 1; i <= this.totalSlides; i++) {
            const slide = document.createElement('div');
            const tStyle = transitionStyles[(i - 1) % transitionStyles.length];
            slide.className = `slide-item ${tStyle} ${i === 1 ? 'active' : ''}`;
            
            // Get path dynamically from mediaConfig
            const photoInfo = mediaConfig.photos[i - 1];
            const imgPath = photoInfo ? photoInfo.path : `./assets/photos/photo${i}.jpg`;
            
            const img = document.createElement('img');
            img.className = 'slide-img';
            img.onerror = () => {
                img.src = this.generatePlaceholderPhoto(i);
            };
            img.src = imgPath;
            
            // Enable slide click to trigger manual skip
            img.addEventListener('click', () => this.nextSlide());
            
            slide.appendChild(img);
            container.appendChild(slide);
            
            // Initial caption setup
            if (i === 1) {
                const captionEl = this.container.querySelector('#slide-caption');
                if (captionEl) {
                    captionEl.innerText = photoInfo ? photoInfo.caption : `Memory #${i}`;
                }
            }
        }
    }

    generatePlaceholderPhoto(index) {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');

        // Draw deep cinematic base gradients
        const grad = ctx.createRadialGradient(400, 250, 50, 400, 250, 450);
        grad.addColorStop(0, '#10162f');
        grad.addColorStop(1, '#050711');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid overlay
        ctx.strokeStyle = 'rgba(229, 192, 96, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Inner glowing border frame
        ctx.strokeStyle = 'rgba(229, 192, 96, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

        // Predefined list of photo descriptions
        const quotes = [
            "A special smile that lights up the world.",
            "Laughter shared in moments of friendship.",
            "Chasing big dreams with an NDA spirit.",
            "Walking together under beautiful skies.",
            "The warmth of early morning chats.",
            "Inside jokes that nobody else understands.",
            "Chances we took, memories we made.",
            "Standing strong through every storm.",
            "A spark that inspires everyone around.",
            "Joy found in the simplest of dates.",
            "Glances of hope looking towards the sky.",
            "The rhythm of music playing in the background.",
            "Shining brighter than a crescent moon.",
            "Looking forward to the beautiful years ahead.",
            "The best chapters are still yet to be written."
        ];

        // Header
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 12px Montserrat';
        ctx.textAlign = 'center';
        ctx.fillText(`M O M E N T   0 ${index}`, canvas.width / 2, canvas.height * 0.22);

        // Text
        ctx.fillStyle = '#e5c060';
        ctx.font = 'italic italic 18px Cinzel, serif';
        ctx.fillText(`"${quotes[index - 1]}"`, canvas.width / 2, canvas.height * 0.52);

        // Footnote
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '500 10px Montserrat';
        ctx.fillText("TAP PHOTO TO VIEW NEXT MEMORY", canvas.width / 2, canvas.height * 0.82);

        return canvas.toDataURL('image/jpeg');
    }

    startSlideshow() {
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, 5500); // Shift every 5.5s
    }

    nextSlide() {
        if (this.isSlideshowComplete) return;

        const slides = this.container.querySelectorAll('.slide-item');
        slides[this.currentSlideIndex].classList.remove('active');
        
        this.currentSlideIndex++;
        
        if (this.currentSlideIndex >= this.totalSlides) {
            this.endSlideshow();
            return;
        }

        slides[this.currentSlideIndex].classList.add('active');
        
        // Update indicator and caption
        this.container.querySelector('.slide-indicator').innerText = `${this.currentSlideIndex + 1} / ${this.totalSlides}`;
        const captionEl = this.container.querySelector('#slide-caption');
        
        const photoInfo = mediaConfig.photos[this.currentSlideIndex];
        if (captionEl) {
            captionEl.innerText = photoInfo ? photoInfo.caption : `Memory #${this.currentSlideIndex + 1}`;
        }
        
        this.playSlideTone();
    }

    playSlideTone() {
        if (!musicManager.audioCtx) return;
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, musicManager.audioCtx.currentTime); // E5
        gain.gain.setValueAtTime(0.02, musicManager.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(musicManager.audioCtx.currentTime + 0.35);
    }

    handleParallax(e) {
        if (this.isSlideshowComplete) return;

        this.parallaxX = ((e.clientX / window.innerWidth) * 2 - 1) * -15;
        this.parallaxY = ((e.clientY / window.innerHeight) * 2 - 1) * -15;
        
        const frame = this.container.querySelector('#slideshow-frame');
        if (frame) {
            frame.style.transform = `translate3d(${this.parallaxX}px, ${this.parallaxY}px, 0)`;
        }
    }

    endSlideshow() {
        this.isSlideshowComplete = true;
        
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }

        // Add special gallery fade-out class
        const wrapper = this.container.querySelector('.slideshow-wrapper');
        if (wrapper) {
            wrapper.classList.add('fade-out-gallery');
        }
        
        setTimeout(() => {
            if (wrapper) wrapper.remove();
            this.revealEnvelope();
        }, 1100);
    }

    revealEnvelope() {
        const envelope = this.container.querySelector('#envelope-wrapper');
        if (envelope) {
            envelope.classList.remove('in-background');
            envelope.offsetHeight; // force repaint
            envelope.classList.add('active-focus');
        }
    }

    openEnvelope() {
        const envelopeNode = this.container.querySelector('#letter-envelope');
        const seal = this.container.querySelector('#wax-seal');
        
        if (envelopeNode.classList.contains('opened')) return;
        envelopeNode.classList.add('opened');
        
        seal.classList.add('broken');
        
        if (musicManager.audioCtx) {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, musicManager.audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, musicManager.audioCtx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.04, musicManager.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + 0.22);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start();
            osc.stop(musicManager.audioCtx.currentTime + 0.25);
        }
    }

    proceed() {
        this.container.classList.add('scene-exit');
        setTimeout(() => {
            router.navigate('scene8'); // Transition to NDA Dream (Scene 8)
        }, 1200);
    }

    exit() {
        console.log("[Scene7] Exiting scene...");
        this.container.classList.add('scene-exit');
        if (this.slideInterval) clearInterval(this.slideInterval);
    }

    destroy() {
        console.log("[Scene7] Destroying scene...");
        if (this.slideInterval) clearInterval(this.slideInterval);
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'slideshow-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .slideshow-wrapper {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column; /* Center header above slideshow */
                justify-content: center;
                align-items: center;
                z-index: 5;
                transition: all 1.2s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .gallery-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: clamp(1.4rem, 4vw, 1.9rem);
                margin-bottom: 22px;
                letter-spacing: 4px;
                text-shadow: 0 0 15px rgba(229, 192, 96, 0.45);
                text-transform: uppercase;
                animation: fade-in-down 1.2s ease-out;
            }
            @keyframes fade-in-down {
                0% { transform: translateY(-20px); opacity: 0; }
                100% { transform: translateY(0); opacity: 1; }
            }
            .slideshow-wrapper.fade-out-gallery {
                opacity: 0;
                transform: translateY(-80px) scale(0.85);
                pointer-events: none;
            }
            .slideshow-frame {
                position: relative;
                width: 90%;
                max-width: 800px;
                aspect-ratio: 16/10;
                padding: 10px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 15px 50px rgba(0,0,0,0.6);
                transition: transform 0.1s ease-out;
                overflow: hidden;
            }
            .slides-container {
                width: 100%;
                height: 100%;
                position: relative;
                overflow: hidden;
                border-radius: 12px;
                background: #030309;
            }
            .slide-item {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0;
                visibility: hidden;
                will-change: transform, opacity, filter;
            }
            
            /* Dynamic Transition style 1: Fade and Blur */
            .slide-item.transition-fade-blur {
                filter: blur(8px);
                transition: opacity 1.2s ease-in-out, filter 1.2s ease-in-out, visibility 1.2s;
            }
            .slide-item.transition-fade-blur.active {
                opacity: 1;
                visibility: visible;
                filter: blur(0px);
            }

            /* Dynamic Transition style 2: Slide from Right */
            .slide-item.transition-slide-right {
                transform: translate3d(60px, 0, 0);
                transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), visibility 1.2s;
            }
            .slide-item.transition-slide-right.active {
                opacity: 1;
                visibility: visible;
                transform: translate3d(0, 0, 0);
            }

            /* Dynamic Transition style 3: Zoom In */
            .slide-item.transition-zoom-in {
                transform: scale(0.92);
                transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), visibility 1.2s;
            }
            .slide-item.transition-zoom-in.active {
                opacity: 1;
                visibility: visible;
                transform: scale(1);
            }

            /* Dynamic Transition style 4: Slide from Bottom */
            .slide-item.transition-slide-up {
                transform: translate3d(0, 60px, 0);
                transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), visibility 1.2s;
            }
            .slide-item.transition-slide-up.active {
                opacity: 1;
                visibility: visible;
                transform: translate3d(0, 0, 0);
            }

            /* Dynamic Transition style 5: Rotate Swing Enter */
            .slide-item.transition-rotate-enter {
                transform: scale(0.95) rotate(-3deg);
                transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), visibility 1.2s;
            }
            .slide-item.transition-rotate-enter.active {
                opacity: 1;
                visibility: visible;
                transform: scale(1) rotate(0deg);
            }
            .slide-img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                animation: ken-burns 12s ease-in-out infinite alternate;
                cursor: pointer;
            }
            .slide-indicator {
                position: absolute;
                bottom: 25px;
                right: 25px;
                background: rgba(13, 13, 30, 0.5);
                backdrop-filter: blur(5px);
                border: 1px solid var(--color-glass-border);
                color: var(--color-gold);
                font-size: 0.75rem;
                padding: 5px 12px;
                border-radius: 12px;
                letter-spacing: 1px;
                font-weight: 600;
                z-index: 6;
            }
            .slide-caption {
                position: absolute;
                bottom: 25px;
                left: 25px;
                max-width: 70%;
                background: rgba(13, 13, 30, 0.6);
                backdrop-filter: blur(8px);
                border: 1.5px solid var(--color-glass-border);
                color: #fff;
                padding: 7px 15px;
                border-radius: 10px;
                font-family: var(--font-sans);
                font-size: 0.8rem;
                letter-spacing: 0.5px;
                z-index: 6;
                text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            }

            /* 3D Envelope Positioning */
            .envelope-wrapper {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                pointer-events: auto;
                transition: all 1.8s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .envelope-wrapper.in-background {
                opacity: 0.12;
                transform: translate(-50%, -18%) scale(0.68) rotateX(32deg) rotateY(-18deg) rotateZ(-5deg);
                pointer-events: none;
                z-index: 1;
                filter: blur(2px);
                animation: float-background 8s infinite ease-in-out;
            }
            .envelope-wrapper.active-focus {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.05) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
                pointer-events: auto;
                z-index: 12;
                filter: blur(0);
            }

            .letter-envelope {
                position: relative;
                width: 320px;
                height: 200px;
                background: #111e3b;
                border: 1.5px solid rgba(229, 192, 96, 0.25);
                border-radius: 4px;
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
                perspective: 1000px;
                cursor: grab;
                transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            }
            .envelope-front {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #182b54, #081126);
                clip-path: polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%);
                border-radius: 0 0 4px 4px;
                z-index: 3;
            }
            .envelope-back {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #0f1a33;
                clip-path: polygon(0 0, 50% 60%, 100% 0, 100% 100%, 0 100%);
                z-index: 1;
            }
            .envelope-flap {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(180deg, #1b305c, #132447);
                border-top: 1.5px solid rgba(229, 192, 96, 0.25);
                clip-path: polygon(0 0, 50% 55%, 100% 0);
                transform-origin: top center;
                z-index: 4;
                transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), z-index 0.3s;
            }
            .letter-envelope.opened .envelope-flap {
                transform: rotateX(180deg);
                z-index: 2;
            }
            
            .wax-seal {
                position: absolute;
                top: 90px;
                left: 50%;
                transform: translateX(-50%);
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #c62828, #b71c1c);
                border: 2px solid #880e4f;
                border-radius: 50%;
                z-index: 5;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2);
                transition: transform 0.3s, opacity 0.5s ease;
            }
            .wax-seal:hover {
                transform: translateX(-50%) scale(1.1);
            }
            .wax-seal.broken {
                opacity: 0;
                transform: translateX(-50%) scale(0.6);
                pointer-events: none;
            }
            .seal-inner {
                color: #fff;
                font-family: var(--font-serif);
                font-size: 0.95rem;
                font-weight: 800;
            }
            
            /* Letter Paper sliding upwards */
            .envelope-paper {
                position: absolute;
                top: 5px;
                left: 10px;
                width: 300px;
                height: 185px;
                padding: 15px;
                z-index: 2;
                border-color: rgba(229,192,96,0.15);
                transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), height 0.8s ease;
                overflow: hidden;
            }
            .letter-envelope.opened .envelope-paper {
                transform: translateY(-160px);
                height: 320px;
                z-index: 10;
            }
            
            .letter-scroll-box {
                width: 100%;
                height: 100%;
                overflow-y: auto;
                padding-right: 4px;
                text-align: left;
            }
            .letter-title {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.05rem;
                margin-bottom: 12px;
                text-align: center;
            }
            .letter-paragraph {
                font-size: 0.8rem;
                line-height: 1.5;
                color: var(--color-text-secondary);
                margin-bottom: 12px;
                text-indent: 10px;
            }
            .letter-btn {
                width: 100%;
                font-size: 0.72rem;
                margin-top: 15px;
                border-color: rgba(229,192,96,0.3);
            }
            .envelope-prompt {
                font-size: 0.75rem;
                color: var(--color-text-muted);
                margin-top: 20px;
                letter-spacing: 1px;
                text-transform: uppercase;
                animation: pulse 2s infinite;
            }
            
            @keyframes float-background {
                0%, 100% { transform: translate(-50%, -18%) scale(0.68) rotateX(32deg) rotateY(-18deg) rotateZ(-5deg) translateY(0); }
                50% { transform: translate(-50%, -18%) scale(0.68) rotateX(30deg) rotateY(-15deg) rotateZ(-4deg) translateY(-10px); }
            }
            @keyframes ken-burns {
                0% { transform: scale(1.0); }
                100% { transform: scale(1.15) translate(-10px, -5px); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 0.95; }
            }
            @media (max-width: 480px) {
                .slideshow-frame { aspect-ratio: 16/11; }
                .slide-caption { font-size: 0.72rem; bottom: 15px; left: 15px; }
                .slide-indicator { bottom: 15px; right: 15px; font-size: 0.65rem; }
            }
        `;
        document.head.appendChild(style);
    }
}
