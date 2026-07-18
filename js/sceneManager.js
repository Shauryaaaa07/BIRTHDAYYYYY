/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE MANAGER (sceneManager.js)
   ========================================================================== */

import { bubbleManager } from './bubbleManager.js';

export class SceneManager {
    constructor() {
        this.appContainer = document.getElementById('app');
        this.currentSceneName = null;
        this.currentSceneInstance = null;
        
        // Registry mapping scene keys to their dynamic module paths and class exports
        this.registry = {
            'countdown': { path: './countdown.js', className: 'CountdownScene' },
            'scene1': { path: '../scenes/scene1.js', className: 'Scene1' },
            'scene2': { path: '../scenes/scene2.js', className: 'Scene2' },
            'scene2_5': { path: '../scenes/scene2_5.js', className: 'Scene2_5' },
            'scene3': { path: '../scenes/scene3.js', className: 'Scene3' },
            'scene4': { path: '../scenes/scene4.js', className: 'Scene4' },
            'scene5': { path: '../scenes/scene5.js', className: 'Scene5' },
            'scene6': { path: '../scenes/scene6.js', className: 'Scene6' },
            'scene7': { path: '../scenes/scene7.js', className: 'Scene7' },
            'scene8': { path: '../scenes/scene8.js', className: 'Scene8' },
            'scene9': { path: '../scenes/scene9.js', className: 'Scene9' },
            'scene10': { path: '../scenes/scene10.js', className: 'Scene10' },
            'scene11': { path: '../scenes/scene11.js', className: 'Scene11' },
            'scene12': { path: '../scenes/scene12.js', className: 'Scene12' },
            'scene13': { path: '../scenes/scene13.js', className: 'Scene13' },
            'scene14': { path: '../scenes/scene14.js', className: 'Scene14' }
        };
    }

    async loadScene(sceneName) {
        if (this.currentSceneName === sceneName) return;
        console.log(`[SceneManager] Transitioning to scene: ${sceneName}`);
        
        const sceneInfo = this.registry[sceneName];
        if (!sceneInfo) {
            console.error(`[SceneManager] Scene '${sceneName}' not found in registry.`);
            return;
        }

        // Cache the outgoing scene instance
        const outgoingInstance = this.currentSceneInstance;
        
        try {
            // Dynamically import the scene module
            const module = await import(sceneInfo.path);
            const SceneClass = module[sceneInfo.className];
            
            if (!SceneClass) {
                throw new Error(`Class '${sceneInfo.className}' not exported from '${sceneInfo.path}'`);
            }

            // Instantiate and initialize the new scene
            const newSceneInstance = new SceneClass();
            const sceneDOMNode = newSceneInstance.init();
            
            if (!(sceneDOMNode instanceof HTMLElement)) {
                throw new Error(`Scene.init() must return a valid DOM HTMLElement.`);
            }

            // Append the new scene DOM node to our app wrapper
            this.appContainer.appendChild(sceneDOMNode);
            
            // Set the new scene as active in state
            this.currentSceneName = sceneName;
            this.currentSceneInstance = newSceneInstance;

            // Trigger floating bubbles from Scene 7 to Scene 13
            const bubbleScenes = ['scene7', 'scene8', 'scene9', 'scene10', 'scene11', 'scene12', 'scene13'];
            if (bubbleScenes.includes(sceneName)) {
                bubbleManager.start();
            } else {
                bubbleManager.stop();
            }

            // Trigger the exit transition on the outgoing scene
            if (outgoingInstance) {
                outgoingInstance.exit();
            }

            // Trigger the enter animation sequence on the new scene
            newSceneInstance.enter();

            // Clean up and destroy the old scene after the exit transition completes (1200ms)
            if (outgoingInstance) {
                setTimeout(() => {
                    outgoingInstance.destroy();
                }, 1200);
            }
            
            // Update the debug selector dropdown if it exists in the DOM
            const debugSelector = document.getElementById('debug-scene-select');
            if (debugSelector) {
                debugSelector.value = sceneName;
            }

        } catch (error) {
            console.error(`[SceneManager] Failed to transition to scene '${sceneName}':`, error);
        }
    }
}

export const sceneManager = new SceneManager();
