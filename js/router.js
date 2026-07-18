/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - ROUTER SYSTEM (router.js)
   ========================================================================== */

import { sceneManager } from './sceneManager.js';

export class Router {
    constructor() {
        this.currentHash = '';
        this.debugMenu = document.getElementById('debug-menu');
        this.debugTrigger = document.getElementById('debug-trigger');
        this.debugSelect = document.getElementById('debug-scene-select');
        this.skipCountdownBtn = document.getElementById('debug-skip-countdown');
    }

    init() {
        console.log("[Router] Initializing router...");
        
        // Listen to hash changes (for browser back/forward navigation)
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Bind debug triggers
        this.setupDebugMenu();
    }

    start() {
        // Read URL hash, default to 'countdown' if empty
        const initialHash = window.location.hash.substring(1) || 'countdown';
        this.navigate(initialHash);
    }

    navigate(sceneName) {
        // Update hash silently if it differs, which triggers hashchange handler
        if (window.location.hash.substring(1) !== sceneName) {
            window.location.hash = sceneName;
        } else {
            // Force load if the hash is already the target
            sceneManager.loadScene(sceneName);
        }
    }

    handleHashChange() {
        const sceneName = window.location.hash.substring(1) || 'countdown';
        console.log(`[Router] Hash changed to: #${sceneName}`);
        sceneManager.loadScene(sceneName);
    }

    setupDebugMenu() {
        // Hide by default initially
        this.debugMenu.classList.add('hide');
        
        // Toggle dropdown contents on trigger click
        this.debugTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.debugMenu.classList.toggle('expanded');
        });
        
        // Jump on select value change
        this.debugSelect.addEventListener('change', (e) => {
            this.navigate(e.target.value);
        });
        
        // Skip countdown
        this.skipCountdownBtn.addEventListener('click', () => {
            this.navigate('scene1');
        });
        
        // Close menu if clicking elsewhere
        document.addEventListener('click', () => {
            this.debugMenu.classList.remove('expanded');
        });

        // Secret tap zone in the top-left corner to show/hide the menu
        let tapCount = 0;
        let tapTimer = null;

        const secretTrigger = document.createElement('div');
        secretTrigger.id = 'secret-debug-trigger';
        secretTrigger.style.cssText = 'position: fixed; top: 0; left: 0; width: 70px; height: 70px; z-index: 99999; background: transparent; cursor: default;';
        document.body.appendChild(secretTrigger);

        secretTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            tapCount++;
            clearTimeout(tapTimer);

            if (tapCount >= 5) {
                this.debugMenu.classList.toggle('hide');
                tapCount = 0;
                console.log("[Router] Secret debug menu toggled!");
            } else {
                tapTimer = setTimeout(() => {
                    tapCount = 0;
                }, 2000); // Reset tap count if idle for 2 seconds
            }
        });
    }
}

export const router = new Router();
