/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - ENDING SCENES (ending.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';

export class EndingScene {
    constructor() {
        this.container = null;
        
        // Active Sub-stage: 1: Memories (Vid 3), 2: Final Surprise (Vid 4), 3: Thank You Scroll, 4: Final Black
        this.stage = 1; 
        
        this.videoElement = null;
        this.canvas = null;
        this.ctx = null;
        
        this.fallbackFrameId = null;
        this.fallbackTimer = null;
        
        // Subtitles sets
        this.subtitlesVid3 = [
            "We compiled this folder of memory loops...",
            "To freeze time, just for a moment.",
            "Thank you for being my constant sanity in a chaotic world.",
            "For all the times you made me feel heard and valued."
        ];
        this.subtitlesVid4 = [
            "And here is one final birthday surprise...",
            "A collection of thoughts from those who love you.",
            "May your days be warm, and your heart be full.",
            "Happy Birthday, Teju! Forever and always."
        ];
    }

    init() {
        console.log("[EndingScene] Initializing Ending Sequence...");
        
        this.container = document.createElement('div');
        this.container.id = 'ending-scene-container';
        this.container.className = 'scene-container';
        
        // Build sub-containers that we toggle through
        this.container.innerHTML = `
            <!-- Memories Video Stage (Video 3) -->
            <div id="ending-stage-1" class="ending-stage-panel">
                <div class="ending-header glass-card">
                    <h2>11:11 Wishhhhh</h2>
                    <p>Reveling the movements beforee .</p>
                </div>
                <div class="ending-video-frame glass-card">
                    <video id="ending-video-3" class="hide" preload="auto" playsinline webkit-playsinline>
                        <source src="./assets/videos/video3.mp4" type="video/mp4">
                    </video>
                    <canvas id="ending-fallback-3" class="hide"></canvas>
                    <div id="subtitles-3" class="ending-subtitles"></div>
                </div>
                <button id="ending-next-3" class="glass-btn ending-btn">View Final Surprise</button>
            </div>

            <!-- Final Surprise Video Stage (Video 4) -->
            <div id="ending-stage-2" class="ending-stage-panel hide">
                <div class="ending-header glass-card">
                    <h2> Final Surprise</h2>
                    <p>A small message to carry with you in the year ahead.</p>
                </div>
                <div class="ending-video-frame glass-card">
                    <video id="ending-video-4" class="hide" preload="auto" playsinline webkit-playsinline>
                        <source src="./assets/videos/video4.mp4" type="video/mp4">
                    </video>
                    <canvas id="ending-fallback-4" class="hide"></canvas>
                    <div id="subtitles-4" class="ending-subtitles"></div>
                </div>
                <button id="ending-next-4" class="glass-btn ending-btn">A Message From Me</button>
            </div>

            <!-- Thank You Credit Scroll Stage -->
            <div id="ending-stage-3" class="ending-stage-panel hide">
                <div class="credits-wrapper">
                    <div class="credits-scroller">
                        <div class="credit-title">TEJU'S STORY</div>
                        <div class="credit-subtitle">A Friendship Beyond Words</div>
                        
                        <div class="credit-section">
                            <div class="credit-role">Starring</div>
                            <div class="credit-name">Teju</div>
                        </div>
                        
                        <div class="credit-section">
                            <div class="credit-role">Co-Star & Director</div>
                            <div class="credit-name">Your Best Friend</div>
                        </div>
                        
                        <div class="credit-section">
                            <div class="credit-role">Music Soundscapes</div>
                            <div class="credit-name">Cosmic Synthesizers & Memories</div>
                        </div>
                        
                        <div class="credit-section">
                            <div class="credit-role">Special Thanks</div>
                            <div class="credit-name">To the universe for bringing you here.</div>
                            <div class="credit-name">To all the shared laughs.</div>
                            <div class="credit-name">To God.</div>
                            <div class="credit-name">To that one of your's friend.</div>
                        </div>
                        
                        <div class="credit-message glass-card">
                            <p>"Friendship is not about who you spend the most time with, but who you have the most beautiful moments with. Thank you for making my life cinematic."</p>
                        </div>
                        
                        <div class="credit-final-hbd">Happy Birthdayyyy, Pakodiiiiiiiiiiiiii.</div>
                        <button id="credits-end-btn" class="glass-btn credits-btn">Fade Out</button>
                    </div>
                </div>
            </div>

            <!-- Fade to Black Stage -->
            <div id="ending-stage-4" class="ending-stage-panel hide fade-out-final">
                <div class="final-emotional-msg">Onceee againnnn Happpyyy Birthdayyy meriiii payarii sakhiiii .</div>
                <div class="final-emotional-msg">Soryyyyyyyy , agar koi glti hui ho tohhh.....</div>
            </div>
        `;

        this.injectStyles();
        
        // Binds buttons
        this.container.querySelector('#ending-next-3').addEventListener('click', () => this.goToStage2());
        this.container.querySelector('#ending-next-4').addEventListener('click', () => this.goToStage3());
        this.container.querySelector('#credits-end-btn').addEventListener('click', () => this.goToStage4());

        return this.container;
    }

    enter() {
        console.log("[EndingScene] Entering scene...");
        
        // Ensure Ending song is playing
        musicManager.playTrack(4);

        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Play Video 3 immediately
        this.playVideo3();
    }

    playVideo3() {
        const video = this.container.querySelector('#ending-video-3');
        const canvas = this.container.querySelector('#ending-fallback-3');
        
        const videoPath = './assets/videos/video3.mp4';
        const isVideoAvailable = window.assetRegistry && window.assetRegistry.videos[videoPath];
        
        if (isVideoAvailable) {
            video.classList.remove('hide');
            this.videoElement = video;
            video.play().catch(err => {
                console.warn("[Ending] Video 3 play failed, using canvas fallback", err);
                this.playVideoFallback(canvas, this.subtitlesVid3, this.container.querySelector('#subtitles-3'));
            });
            video.addEventListener('ended', () => this.goToStage2());
        } else {
            this.playVideoFallback(canvas, this.subtitlesVid3, this.container.querySelector('#subtitles-3'));
        }
    }

    playVideo4() {
        const video = this.container.querySelector('#ending-video-4');
        const canvas = this.container.querySelector('#ending-fallback-4');
        
        const videoPath = './assets/videos/video4.mp4';
        const isVideoAvailable = window.assetRegistry && window.assetRegistry.videos[videoPath];
        
        if (isVideoAvailable) {
            video.classList.remove('hide');
            this.videoElement = video;
            video.play().catch(err => {
                console.warn("[Ending] Video 4 play failed, using canvas fallback", err);
                this.playVideoFallback(canvas, this.subtitlesVid4, this.container.querySelector('#subtitles-4'));
            });
            video.addEventListener('ended', () => this.goToStage3());
        } else {
            this.playVideoFallback(canvas, this.subtitlesVid4, this.container.querySelector('#subtitles-4'));
        }
    }

    playVideoFallback(canvas, subtitles, textContainer) {
        // Clear previous loops
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        if (this.fallbackFrameId) cancelAnimationFrame(this.fallbackFrameId);
        
        canvas.classList.remove('hide');
        const cCtx = canvas.getContext('2d');
        canvas.width = 480;
        canvas.height = 270;
        
        let frame = 0;
        // Sparkle arrays for background simulation
        const sparks = [];
        for (let i = 0; i < 30; i++) {
            sparks.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005
            });
        }

        const render = () => {
            if (this.container.classList.contains('scene-exit')) return;
            frame++;
            
            cCtx.fillStyle = '#04040c';
            cCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw slow floating stars
            sparks.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 1 || s.alpha < 0.1) s.speed = -s.speed;
                s.alpha = Math.max(0.1, Math.min(1, s.alpha));
                
                cCtx.fillStyle = `rgba(229, 192, 96, ${s.alpha})`;
                cCtx.beginPath();
                cCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                cCtx.fill();
            });

            // Gentle center ripple
            const gradient = cCtx.createRadialGradient(
                canvas.width/2, canvas.height/2, 2, 
                canvas.width/2, canvas.height/2, 80 + Math.sin(frame * 0.02) * 10
            );
            gradient.addColorStop(0, 'rgba(195,132,139,0.06)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            cCtx.fillStyle = gradient;
            cCtx.fillRect(0,0,canvas.width,canvas.height);

            this.fallbackFrameId = requestAnimationFrame(render);
        };
        render();

        // Subtitles slide
        let subtitleIdx = 0;
        const showNext = () => {
            if (subtitleIdx < subtitles.length) {
                textContainer.innerText = subtitles[subtitleIdx];
                subtitleIdx++;
                this.fallbackTimer = setTimeout(showNext, 3800);
            } else {
                textContainer.innerText = "❤️";
            }
        };
        showNext();
    }

    cleanMedia() {
        if (this.videoElement) {
            this.videoElement.pause();
            this.videoElement = null;
        }
        if (this.fallbackTimer) {
            clearTimeout(this.fallbackTimer);
            this.fallbackTimer = null;
        }
        if (this.fallbackFrameId) {
            cancelAnimationFrame(this.fallbackFrameId);
            this.fallbackFrameId = null;
        }
    }

    goToStage2() {
        this.cleanMedia();
        this.container.querySelector('#ending-stage-1').classList.add('hide');
        
        const stage2 = this.container.querySelector('#ending-stage-2');
        stage2.classList.remove('hide');
        
        this.playVideo4();
    }

    goToStage3() {
        this.cleanMedia();
        this.container.querySelector('#ending-stage-2').classList.add('hide');
        
        const stage3 = this.container.querySelector('#ending-stage-3');
        stage3.classList.remove('hide');
        
        // Trigger slow credit scrolling
        const scroller = this.container.querySelector('.credits-scroller');
        setTimeout(() => {
            scroller.classList.add('scrolling');
        }, 300);
    }

    goToStage4() {
        // Fade global backdrop canvas to black
        const globalCanvas = document.getElementById('global-bg-canvas');
        if (globalCanvas) globalCanvas.style.opacity = '0';
        
        // Dim the auroras completely
        const auroras = document.querySelectorAll('.aurora-glow');
        auroras.forEach(a => a.style.opacity = '0');

        this.container.querySelector('#ending-stage-3').classList.add('hide');
        
        const stage4 = this.container.querySelector('#ending-stage-4');
        stage4.classList.remove('hide');
        
        // Slowly fade down audio volume over 6 seconds
        this.fadeAudioOut(6.0);
    }

    fadeAudioOut(duration) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        musicManager.masterGain.gain.setValueAtTime(musicManager.masterGain.gain.value, now);
        musicManager.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    }

    proceed() {
        // Simple end flow
    }

    exit() {
        console.log("[EndingScene] Exiting ending sequence...");
        this.cleanMedia();
    }

    destroy() {
        console.log("[EndingScene] Destroying ending sequence...");
        this.cleanMedia();
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'ending-style';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .ending-stage-panel {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                padding: 40px 20px;
                animation: scale-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            }
            .ending-header {
                max-width: 480px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .ending-header h2 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .ending-header p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .ending-video-frame {
                position: relative;
                width: 90%;
                max-width: 520px;
                aspect-ratio: 16/9;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid var(--color-glass-border);
                box-shadow: 0 15px 45px rgba(0,0,0,0.6);
            }
            #ending-video-3, #ending-video-4 {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            #ending-fallback-3, #ending-fallback-4 {
                width: 100%;
                height: 100%;
            }
            .ending-subtitles {
                position: absolute;
                bottom: 12px;
                left: 5%;
                width: 90%;
                text-align: center;
                background: rgba(4, 4, 12, 0.8);
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                color: #fff;
                padding: 8px;
                border-radius: 8px;
                font-size: 0.8rem;
                min-height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .ending-btn {
                border-color: rgba(229, 192, 96, 0.25);
                margin-bottom: 10px;
            }

            /* Credits Scroll Styling */
            .credits-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                overflow: hidden;
                display: flex;
                justify-content: center;
            }
            .credits-scroller {
                position: absolute;
                top: 100%; /* starts below viewport */
                width: 90%;
                max-width: 480px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            /* Class applied to initiate rolling credits */
            .credits-scroller.scrolling {
                animation: credits-crawl 35s linear forwards;
            }
            
            .credit-title {
                font-family: var(--font-serif);
                font-size: 2.2rem;
                font-weight: 800;
                letter-spacing: 6px;
                color: var(--color-gold);
                text-shadow: 0 0 15px var(--color-gold-glow);
                margin-bottom: 8px;
            }
            .credit-subtitle {
                font-size: 0.9rem;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: var(--color-text-secondary);
                margin-bottom: 50px;
            }
            .credit-section {
                margin-bottom: 35px;
            }
            .credit-role {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: var(--color-text-muted);
                margin-bottom: 8px;
            }
            .credit-name {
                font-family: var(--font-serif);
                font-size: 1.15rem;
                color: var(--color-text-primary);
                margin-bottom: 4px;
            }
            .credit-message {
                padding: 25px;
                border: 1px solid rgba(255,255,255,0.06);
                margin: 40px 0;
            }
            .credit-message p {
                font-size: 0.85rem;
                line-height: 1.6;
                color: var(--color-text-secondary);
                font-style: italic;
            }
            .credit-final-hbd {
                font-family: var(--font-serif);
                font-size: 1.6rem;
                color: var(--color-rose-gold);
                text-shadow: 0 0 15px var(--color-rose-glow);
                margin-bottom: 40px;
                letter-spacing: 2px;
            }
            .credits-btn {
                border-color: rgba(195,132,139,0.3);
            }

            /* Stage 4: Fade to Black */
            .final-emotional-msg {
                font-family: var(--font-serif);
                font-size: 2.2rem;
                letter-spacing: 4px;
                color: var(--color-gold);
                text-shadow: 0 0 20px var(--color-gold-glow);
                opacity: 0;
                transform: scale(0.9);
                animation: final-text-fade 6s cubic-bezier(0.25, 1, 0.5, 1) forwards 1s;
            }
            
            /* Scrolling calculation keyframes */
            @keyframes credits-crawl {
                0% {
                    top: 85%;
                }
                100% {
                    top: -160%;
                }
            }
            
            @keyframes final-text-fade {
                0% {
                    opacity: 0;
                    transform: scale(0.95);
                    filter: blur(5px);
                }
                30% {
                    opacity: 1;
                    transform: scale(1.0);
                    filter: blur(0px);
                }
                70% {
                    opacity: 1;
                    transform: scale(1.0);
                    filter: blur(0px);
                }
                100% {
                    opacity: 0;
                    transform: scale(0.98);
                    filter: blur(10px);
                }
            }
            
            .fade-out-final {
                background: black;
                width: 100vw;
                height: 100vh;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fade-in 2.5s ease forwards;
            }
        `;
        document.head.appendChild(style);
    }
}
