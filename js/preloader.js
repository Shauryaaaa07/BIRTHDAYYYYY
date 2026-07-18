import { mediaConfig } from './mediaConfig.js';

export class Preloader {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.loaderBar = document.getElementById('loader-bar');
        this.loaderPercentage = document.getElementById('loader-percentage');
        this.loaderStatus = document.getElementById('preloader-status');
        this.enterBtn = document.getElementById('enter-btn');
        this.preloaderScreen = document.getElementById('preloader');
        
        this.progress = 0;
        this.statusTexts = [
            "Aligning the stars...",
            "Tuning the memory timelines...",
            "Synthesizing wind and butterflies...",
            "Frosting the birthday cake...",
            "Inflating celebration balloons...",
            "Wrapping the luxury surprises...",
            "Gathering 15 precious moments...",
            "Watering the mystical Wish Tree...",
            "Preparing the final credits..."
        ];
        
        this.assetsToPreload = {
            scripts: [
                './router.js',
                './sceneManager.js',
                './musicManager.js',
                './countdown.js',
                '../scenes/scene1.js',
                '../scenes/scene2.js',
                '../scenes/scene2_5.js',
                '../scenes/scene3.js',
                '../scenes/scene4.js',
                '../scenes/scene5.js',
                '../scenes/scene6.js',
                '../scenes/scene7.js',
                '../scenes/scene8.js',
                '../scenes/scene9.js',
                '../scenes/scene10.js',
                '../scenes/scene11.js',
                '../scenes/scene12.js',
                '../scenes/scene13.js',
                '../scenes/scene14.js'
            ]
        };

        this.loadedCount = 0;
        this.totalCount = this.assetsToPreload.scripts.length;
    }

    async init() {
        console.log("[Preloader] Initializing preloader...");
        this.updateStatus(0, "Initiating cosmic sequence...");
        
        // Slowly advance loading bar for scripts
        for (let i = 0; i < this.assetsToPreload.scripts.length; i++) {
            const scriptUrl = this.assetsToPreload.scripts[i];
            const statusIndex = Math.min(
                Math.floor((i / this.assetsToPreload.scripts.length) * this.statusTexts.length),
                this.statusTexts.length - 1
            );
            
            try {
                // Preload script by dynamic importing it
                await import(scriptUrl);
                this.loadedCount++;
                const percentage = Math.floor((this.loadedCount / this.totalCount) * 80);
                this.updateProgress(percentage, this.statusTexts[statusIndex]);
            } catch (err) {
                // If a scene or module fails to import, log it but keep loading
                console.warn(`[Preloader] Script preload failed: ${scriptUrl}`, err);
                this.loadedCount++;
                const percentage = Math.floor((this.loadedCount / this.totalCount) * 80);
                this.updateProgress(percentage, this.statusTexts[statusIndex]);
            }
            // Add a small cinematic delay
            await new Promise(resolve => setTimeout(resolve, 80));
        }

        // Check media availability in the background (we check headers only, no full download to optimize speed)
        this.updateProgress(85, "Optimizing image containers...");
        await this.checkMediaAssets();

        // Complete the preloading
        this.updateProgress(100, "Cosmic sequence ready.");
        
        // Hide loader metrics and reveal Enter Button
        this.loaderBar.parentElement.classList.add('hide');
        this.loaderPercentage.classList.add('hide');
        this.loaderStatus.classList.add('hide');
        
        this.enterBtn.classList.remove('hide');
        this.enterBtn.addEventListener('click', () => this.finish());
    }

    updateProgress(percentage, statusText) {
        this.progress = percentage;
        if (this.loaderBar) this.loaderBar.style.width = `${percentage}%`;
        if (this.loaderPercentage) this.loaderPercentage.innerText = `${percentage}%`;
        if (statusText) this.updateStatus(percentage, statusText);
    }

    updateStatus(percentage, text) {
        if (this.loaderStatus) {
            this.loaderStatus.innerText = text;
        }
    }

    async checkMediaAssets() {
        window.assetRegistry = {
            photos: {},
            videos: {},
            music: {}
        };

        // Quick check helper
        const testFile = async (url) => {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok;
            } catch {
                return false;
            }
        };

        // Test photos from mediaConfig
        for (let photo of mediaConfig.photos) {
            window.assetRegistry.photos[photo.path] = await testFile(photo.path);
        }

        // Test videos from mediaConfig
        for (let key in mediaConfig.videos) {
            const path = mediaConfig.videos[key];
            window.assetRegistry.videos[path] = await testFile(path);
        }

        // Test songs from mediaConfig
        for (let key in mediaConfig.songs) {
            const path = mediaConfig.songs[key];
            window.assetRegistry.music[path] = await testFile(path);
        }
        
        console.log("[Preloader] Media registry populated:", window.assetRegistry);
    }

    finish() {
        console.log("[Preloader] Dismissing preloader screen.");
        this.preloaderScreen.classList.add('hide');
        
        // Remove from DOM after transition completes
        setTimeout(() => {
            this.preloaderScreen.remove();
            if (this.onComplete) this.onComplete();
        }, 1200);
    }
}
