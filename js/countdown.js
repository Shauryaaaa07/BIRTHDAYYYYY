import { router } from './router.js';
import { musicManager } from './musicManager.js';
import { content } from './content.js';

export class CountdownScene {
    constructor() {
        this.container = null;
        this.timerInterval = null;
        
        // Target Date: 19 July 2026, 12:00 AM (Midnight)
        // Note: Months are 0-indexed in JS, so July is index 6.
        this.targetDate = new Date(2026, 6, 19, 0, 0, 0);
    }

    init() {
        console.log("[CountdownScene] Initializing...");
        
        // Create container element
        this.container = document.createElement('div');
        this.container.id = 'countdown-scene';
        this.container.className = 'scene-container';
        
        // Set up scene template
        this.container.innerHTML = `
            <div class="countdown-card glass-card">
                <div class="countdown-greeting">FOR ${content.birthdayGirlName.toUpperCase()}</div>
                <h1 class="countdown-heading">The Journey Begins In</h1>
                <div class="timer-grid">
                    <div class="timer-box">
                        <div id="days" class="timer-val">00</div>
                        <div class="timer-lbl">Days</div>
                    </div>
                    <div class="timer-box">
                        <div id="hours" class="timer-val">00</div>
                        <div class="timer-lbl">Hrs</div>
                    </div>
                    <div class="timer-box">
                        <div id="minutes" class="timer-val">00</div>
                        <div class="timer-lbl">Mins</div>
                    </div>
                    <div class="timer-box">
                        <div id="seconds" class="timer-val">00</div>
                        <div class="timer-lbl">Secs</div>
                    </div>
                </div>
                <div class="countdown-footnote">Locked until 19 July 2026, 12:00 AM</div>
            </div>
        `;
        
        // Style specific to this countdown scene
        const styleId = 'countdown-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .countdown-card {
                    text-align: center;
                    padding: 50px 40px;
                    max-width: 550px;
                    width: 90%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    animation: float-slow 8s infinite ease-in-out;
                    border: 1px solid rgba(229, 192, 96, 0.15);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 30px rgba(229, 192, 96, 0.05);
                }
                .countdown-greeting {
                    font-family: var(--font-sans);
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 4px;
                    color: var(--color-rose-gold);
                    margin-bottom: 12px;
                }
                .countdown-heading {
                    font-family: var(--font-serif);
                    font-size: 1.8rem;
                    font-weight: 400;
                    letter-spacing: 3px;
                    margin-bottom: 35px;
                    color: var(--color-text-primary);
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                }
                .timer-grid {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 30px;
                    width: 100%;
                }
                .timer-box {
                    flex: 1;
                    min-width: 80px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.04);
                    padding: 15px 10px;
                    border-radius: 12px;
                    backdrop-filter: blur(5px);
                }
                .timer-val {
                    font-family: var(--font-serif);
                    font-size: 2.2rem;
                    font-weight: 600;
                    color: var(--color-gold);
                    text-shadow: 0 0 15px var(--color-gold-glow);
                    line-height: 1;
                    margin-bottom: 6px;
                }
                .timer-lbl {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: var(--color-text-secondary);
                }
                .countdown-footnote {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    font-style: italic;
                    letter-spacing: 1px;
                }
                @media (max-width: 480px) {
                    .timer-grid {
                        gap: 10px;
                    }
                    .timer-box {
                        min-width: 60px;
                        padding: 10px 5px;
                    }
                    .timer-val {
                        font-size: 1.6rem;
                    }
                    .timer-lbl {
                        font-size: 0.6rem;
                        letter-spacing: 1px;
                    }
                    .countdown-heading {
                        font-size: 1.3rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        return this.container;
    }

    enter() {
        console.log("[CountdownScene] Entering lock screen...");
        
        // Start Countdown Song (Song 1)
        musicManager.playTrack(1);
        
        // Setup clock tick loop
        this.updateClock();
        this.timerInterval = setInterval(() => this.updateClock(), 1000);
        
        // Fade in
        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
    }

    updateClock() {
        const now = new Date();
        const difference = this.targetDate.getTime() - now.getTime();
        
        if (difference <= 0) {
            console.log("[CountdownScene] Target unlock time reached! Opening website...");
            this.unlock();
            return;
        }
        
        // Math conversion
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Write to DOM
        const dEl = this.container.querySelector('#days');
        const hEl = this.container.querySelector('#hours');
        const mEl = this.container.querySelector('#minutes');
        const sEl = this.container.querySelector('#seconds');
        
        if (dEl) dEl.innerText = String(days).padStart(2, '0');
        if (hEl) hEl.innerText = String(hours).padStart(2, '0');
        if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
        if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
    }

    unlock() {
        // Clear interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Trigger a zoom-camera transition
        this.container.classList.add('scene-exit');
        
        // Navigate to Scene 1 (Tic Tac Toe)
        setTimeout(() => {
            router.navigate('scene1');
        }, 1200);
    }

    exit() {
        console.log("[CountdownScene] Exiting lock screen...");
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.container.classList.add('scene-exit');
    }

    destroy() {
        console.log("[CountdownScene] Destroying lock screen...");
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}
