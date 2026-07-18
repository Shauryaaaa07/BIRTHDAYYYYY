/* ==========================================================================
   TEJU'S BIRTHDAY EXPERIENCE - SCENE 10: HEART RAIN & WISH TREE (scene10.js)
   ========================================================================== */

import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';
import { mediaConfig } from '../js/mediaConfig.js';

export class Scene10 {
    constructor() {
        this.container = null;
        
        // Canvas layers
        this.particlesCanvas = null;
        this.pCtx = null;
        this.treeCanvas = null;
        this.tCtx = null;
        
        this.animationFrameId = null;
        this.portalFallbackFrameId = null;
        
        // Growth mechanics
        this.wishCount = 0;
        this.treeProgress = 0; // 0 to 1 for smooth drawing
        this.isTreeGrowing = false;
        
        // Offscreen cache layers
        this.offscreenCanvas = document.createElement('canvas');
        this.oCtx = this.offscreenCanvas.getContext('2d');
        this.treeCacheValid = false;
        
        // Clickable leaves collections
        this.treeLeaves = [];
        this.collectingLeaves = false;
        
        // Particle arrays
        this.diyas = [];
        this.hearts = [];
        
        // Video variables
        this.videoElement = null;
        this.videoTimer = null;
        
        // Video 2 fallbacks subtitles
        this.subtitleIndex = 0;
        this.subtitles = [
            "We have walked through beautiful paths together...",
            "Through wind, sunbeams, laughter, and stars.",
            "You are the anchor that keeps my world secure.",
            "Make a wish, Teju, and let the tree bloom.",
            "May all your silent prayers find answers today..."
        ];
    }

    init() {
        console.log(" Initializing Heart Rain & Wish Tree Scene...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene10-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <!-- Particle layer (diya and heart rain) -->
            <canvas id="wish-particle-canvas"></canvas>
            
            <div class="wish-layout">
                <div class="wish-instructions glass-card">
                    <h3>The Mystical Wish Tree</h3>
                    <p id="wish-instructions-desc">Touch the 6 envelopes hanging from the branches to open the blessings.</p>
                </div>
                
                <div class="tree-viewport">
                    <div class="tree-canvas-wrapper">
                        <!-- Tree Canvas (Draws recursive fractal tree) -->
                        <canvas id="tree-canvas"></canvas>
                        
                        <!-- Interactive Hanging Envelopes -->
                        <div id="envelopes-container" class="envelopes-container">
                            <div class="envelope-node" data-index="0" style="left: 20%; top: 38%;">✉️</div>
                            <div class="envelope-node" data-index="1" style="left: 36%; top: 20%;">✉️</div>
                            <div class="envelope-node" data-index="2" style="left: 52%; top: 12%;">✉️</div>
                            <div class="envelope-node" data-index="3" style="left: 72%; top: 22%;">✉️</div>
                            <div class="envelope-node" data-index="4" style="left: 28%; top: 50%;">✉️</div>
                            <div class="envelope-node" data-index="5" style="left: 64%; top: 45%;">✉️</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Theatrical Curtain Overlay -->
            <div id="curtain-overlay" class="curtain-overlay">
                <div class="curtain-panel curtain-left"></div>
                <div class="curtain-panel curtain-right"></div>
            </div>
        `;
        
        this.particlesCanvas = this.container.querySelector('#wish-particle-canvas');
        this.pCtx = this.particlesCanvas.getContext('2d');
        
        this.treeCanvas = this.container.querySelector('#tree-canvas');
        this.tCtx = this.treeCanvas.getContext('2d');
        
        this.resizeCanvases();
        window.addEventListener('resize', () => this.resizeCanvases());
        
        // Spawn background particles
        this.spawnParticles();
        
        // Bind envelopes clicks
        const envelopes = this.container.querySelectorAll('.envelope-node');
        this.openedEnvelopesCount = 0;
        
        envelopes.forEach((env, idx) => {
            env.addEventListener('click', (e) => {
                if (env.classList.contains('opened')) return;
                
                env.classList.add('opened');
                this.openedEnvelopesCount++;
                
                // Play chord chime
                this.playWishChord(2);
                
                // Show floating blessing popup at envelope position
                this.showBlessingBubble(idx, e.clientX, e.clientY);
                
                const desc = this.container.querySelector('#wish-instructions-desc');
                if (this.openedEnvelopesCount === 6) {
                    desc.innerText = "All blessings received! Proceeding to Special Memories...";
                    setTimeout(() => {
                        this.proceed();
                    }, 2500);
                } else {
                    desc.innerText = `Blessings opened: ${this.openedEnvelopesCount} of 6. Tap more!`;
                }
            });
        });

        // Bind tree leaf click listener for any custom interactions
        this.treeCanvas.addEventListener('click', (e) => {
            if (this.wishCount !== 3 || this.isTreeGrowing) return;
            
            const rect = this.treeCanvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            let clickedLeaf = null;
            for (let leaf of this.treeLeaves) {
                if (leaf.isDetached) continue;
                const dx = leaf.x - clickX;
                const dy = leaf.y - clickY;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 18) {
                    clickedLeaf = leaf;
                    break;
                }
            }
            
            if (clickedLeaf) {
                this.triggerLeafWish(clickedLeaf, e);
            }
        });

        this.injectStyles();
        return this.container;
    }

    resizeCanvases() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        if (this.particlesCanvas) {
            this.particlesCanvas.width = w;
            this.particlesCanvas.height = h;
        }
        
        if (this.treeCanvas) {
            // Match internal resolution directly to its responsive display client size
            const canvasW = this.treeCanvas.clientWidth || 500;
            const canvasH = this.treeCanvas.clientHeight || (canvasW * 0.9);
            
            this.treeCanvas.width = canvasW;
            this.treeCanvas.height = canvasH;
            
            this.offscreenCanvas.width = canvasW;
            this.offscreenCanvas.height = canvasH;
            this.treeCacheValid = false;
            
            this.redrawTree();
        }
    }

    enter() {
        console.log("[Scene10] Entering scene with fully grown Wish Tree...");
        
        // Play track 4 (ending chords)
        musicManager.playTrack(4);

        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);

        // Pre-grow tree and generate leaves instantly
        this.wishCount = 3;
        this.treeProgress = 1.0;
        this.isTreeGrowing = false;
        
        this.treeLeaves = [];
        this.collectingLeaves = true;
        this.redrawTree();
        this.collectingLeaves = false;
        
        this.treeCacheValid = false;
        this.redrawTree();
        
        this.renderParticles();
    }

    spawnParticles() {
        this.hearts = [];
        this.diyas = [];
        
        // Heart Rain (Dense representation for Scene 10)
        for (let i = 0; i < 45; i++) {
            this.hearts.push({
                x: Math.random() * window.innerWidth,
                y: -20 - Math.random() * window.innerHeight,
                size: Math.random() * 8 + 3,
                speedY: Math.random() * 1.3 + 0.7,
                swaySpeed: Math.random() * 0.02 + 0.01,
                swayOffset: Math.random() * Math.PI * 2,
                opacity: Math.random() * 0.45 + 0.2
            });
        }
        
        // Floating Diyas
        for (let i = 0; i < 18; i++) {
            this.diyas.push({
                x: Math.random() * window.innerWidth,
                y: window.innerHeight * 0.75 + Math.random() * (window.innerHeight * 0.2),
                size: Math.random() * 12 + 10,
                swaySpeed: Math.random() * 0.02 + 0.01,
                swayRange: Math.random() * 15 + 5,
                swayOffset: Math.random() * Math.PI * 2,
                speedY: -(Math.random() * 0.15 + 0.05),
                opacity: Math.random() * 0.5 + 0.4
            });
        }
    }

    registerWish() {
        if (this.isTreeGrowing || this.wishCount >= 3) return;
        
        this.wishCount++;
        this.isTreeGrowing = true;
        this.treeProgress = 0;
        
        this.playWishChord(this.wishCount);

        const desc = this.container.querySelector('#wish-instructions-desc');
        
        if (this.wishCount === 1) {
            desc.innerText = "Trunk is growing... Make another wish!";
        } else if (this.wishCount === 2) {
            desc.innerText = "Branches are expanding... One final wish!";
        } else if (this.wishCount === 3) {
            desc.innerText = "Glow leaves sprouted! The tree is opening...";
            this.container.querySelector('.wish-controls').classList.add('hide');
        }

        const animateGrowth = () => {
            this.treeProgress += 0.015;
            this.redrawTree();
            
            if (this.treeProgress < 1) {
                requestAnimationFrame(animateGrowth);
            } else {
                this.isTreeGrowing = false;
                
                // Collect stable leaves once fully grown
                if (this.wishCount === 3) {
                    this.treeLeaves = [];
                    this.collectingLeaves = true;
                    this.redrawTree();
                    this.collectingLeaves = false;
                    this.treeCacheValid = false;
                    this.redrawTree();
                }
                
                // If 3 wishes registered, open portal
                if (this.wishCount === 3) {
                    setTimeout(() => this.openPortal(), 1000);
                }
            }
        };
        animateGrowth();
    }

    playWishChord(stage) {
        if (!musicManager.audioCtx) return;
        const now = musicManager.audioCtx.currentTime;
        
        const chords = {
            1: [196.00, 246.94, 293.66], // G Major
            2: [261.63, 329.63, 392.00, 523.25], // C Major 7
            3: [329.63, 392.00, 440.00, 523.25, 659.25, 783.99] // E Minor sweeps
        };
        
        const notes = chords[stage];
        notes.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = stage === 3 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            
            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.06 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 1.5);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 1.6);
        });
    }

    drawLeafShape(ctx, x, y, size) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 4); // rotate to point leaf upwards-right
        ctx.beginPath();
        // Left side of leaf
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-size * 0.65, -size * 0.85, 0, -size * 1.6);
        // Right side of leaf
        ctx.quadraticCurveTo(size * 0.65, -size * 0.85, 0, 0);
        ctx.closePath();
        ctx.restore();
    }

    cacheTree() {
        const oCtx = this.oCtx;
        const w = this.offscreenCanvas.width;
        const h = this.offscreenCanvas.height;
        
        oCtx.clearRect(0, 0, w, h);
        
        const startX = w / 2;
        const startY = h - 10;
        
        if (this.wishCount === 0) {
            oCtx.beginPath();
            oCtx.arc(startX, startY - 10, 8, 0, Math.PI * 2);
            oCtx.fillStyle = '#e5c060';
            oCtx.shadowBlur = 15;
            oCtx.shadowColor = '#e5c060';
            oCtx.fill();
            this.treeCacheValid = true;
            return;
        }

        const maxDepth = this.wishCount === 1 ? 5 : (this.wishCount === 2 ? 8 : 10);
        
        const drawBranchToCache = (x1, y1, angle, length, depth, width) => {
            if (depth > maxDepth) return;
            
            const x2 = x1 + Math.cos(angle) * length;
            const y2 = y1 + Math.sin(angle) * length;
            
            oCtx.beginPath();
            oCtx.moveTo(x1, y1);
            oCtx.lineTo(x2, y2);
            
            oCtx.strokeStyle = depth < 5 ? '#5d4037' : '#e5c060';
            oCtx.lineWidth = width;
            oCtx.lineCap = 'round';
            
            oCtx.shadowBlur = depth > 4 ? 6 : 0;
            oCtx.shadowColor = '#e5c060';
            oCtx.stroke();
            
            const nextDepth = depth + 1;
            const nextWidth = width * 0.7;
            const nextLen = length * 0.75;
            
            const angleOffset1 = -0.35;
            const angleOffset2 = 0.35;
            
            drawBranchToCache(x2, y2, angle + angleOffset1, nextLen, nextDepth, nextWidth);
            drawBranchToCache(x2, y2, angle + angleOffset2, nextLen, nextDepth, nextWidth);
        };

        const initialLength = h * 0.25;
        drawBranchToCache(startX, startY, -Math.PI / 2, initialLength, 1, 10);
        
        // Draw static (non-detached) leaves on cache
        if (this.wishCount === 3 && this.treeLeaves.length > 0) {
            this.treeLeaves.forEach(leaf => {
                if (!leaf.isDetached) {
                    oCtx.save();
                    oCtx.fillStyle = leaf.color;
                    oCtx.shadowBlur = 5;
                    oCtx.shadowColor = leaf.color;
                    this.drawLeafShape(oCtx, leaf.x, leaf.y, leaf.size);
                    oCtx.fill();
                    oCtx.restore();
                }
            });
        }
        
        this.treeCacheValid = true;
    }

    redrawTree() {
        const ctx = this.tCtx;
        const canvas = this.treeCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // If tree is growing, draw recursively in real-time
        if (this.isTreeGrowing || this.collectingLeaves) {
            const startX = canvas.width / 2;
            const startY = canvas.height - 10;
            const maxDepth = this.wishCount === 1 ? 5 : (this.wishCount === 2 ? 8 : 10);
            
            const drawBranch = (x1, y1, angle, length, depth, width) => {
                if (depth > maxDepth) return;
                
                let currentLen = length;
                if (depth === maxDepth && this.isTreeGrowing) {
                    currentLen *= this.treeProgress;
                }
                
                const x2 = x1 + Math.cos(angle) * currentLen;
                const y2 = y1 + Math.sin(angle) * currentLen;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = depth < 5 ? '#5d4037' : '#e5c060';
                ctx.lineWidth = width;
                ctx.lineCap = 'round';
                ctx.stroke();
                
                if (this.wishCount === 3 && depth >= 8) {
                    if (this.collectingLeaves) {
                        // Only collect a lightweight subset of leaves (~28%) to prevent CPU hogging
                        if (Math.random() < 0.28) {
                            this.treeLeaves.push({
                                x: x2,
                                y: y2,
                                originalX: x2,
                                originalY: y2,
                                size: Math.random() * 3.5 + 3.0,
                                color: Math.random() > 0.5 ? '#c3848b' : '#e5c060',
                                alpha: 1.0,
                                isDetached: false,
                                floatX: x2,
                                floatY: y2,
                                floatSpeed: Math.random() * 0.5 + 0.35,
                                swayOffset: Math.random() * Math.PI * 2
                            });
                        }
                    } else if (this.treeLeaves.length === 0) {
                        ctx.beginPath();
                        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
                        ctx.fillStyle = '#e5c060';
                        ctx.fill();
                    }
                }
                
                const nextDepth = depth + 1;
                const nextWidth = width * 0.7;
                const nextLen = length * 0.75;
                
                const angleOffset1 = -0.35 + Math.sin(this.treeProgress * 0.05) * 0.03;
                const angleOffset2 = 0.35 - Math.sin(this.treeProgress * 0.05) * 0.03;
                
                if (depth < maxDepth || (depth === maxDepth && this.treeProgress > 0.2)) {
                    drawBranch(x2, y2, angle + angleOffset1, nextLen, nextDepth, nextWidth);
                    drawBranch(x2, y2, angle + angleOffset2, nextLen, nextDepth, nextWidth);
                }
            };
            
            const initialLength = canvas.height * 0.25;
            drawBranch(startX, startY, -Math.PI / 2, initialLength, 1, 10);
            
        } else {
            // Draw tree from off-screen cache
            if (!this.treeCacheValid) {
                this.cacheTree();
            }
            ctx.drawImage(this.offscreenCanvas, 0, 0);
            
            // Draw ONLY detached floating leaves dynamically
            if (this.wishCount === 3 && this.treeLeaves.length > 0) {
                this.treeLeaves.forEach(leaf => {
                    if (leaf.isDetached) {
                        leaf.floatY -= leaf.floatSpeed;
                        leaf.swayOffset += 0.03;
                        leaf.floatX = leaf.originalX + Math.sin(leaf.swayOffset) * 14;
                        leaf.alpha -= 0.007;
                        
                        if (leaf.alpha <= 0) return;
                        
                        ctx.save();
                        ctx.globalAlpha = leaf.alpha;
                        ctx.shadowBlur = 8;
                        ctx.shadowColor = leaf.color;
                        ctx.fillStyle = leaf.color;
                        
                        ctx.beginPath();
                        this.drawLeafShape(ctx, leaf.floatX, leaf.floatY, leaf.size);
                        ctx.fill();
                        ctx.restore();
                    }
                });
            }
        }
    }

    openPortal() {
        console.log("[Scene10] Opening Portal...");
        
        const flash = document.createElement('div');
        flash.className = 'flash-bloom';
        this.container.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
            
            const portal = this.container.querySelector('#tree-portal');
            portal.classList.remove('hide');
            this.container.querySelector('.wish-instructions').classList.add('hide');
            
            this.playPortalVideo();
        }, 800);
    }

    playPortalVideo() {
        const video = this.container.querySelector('#portal-video');
        const canvas = this.container.querySelector('#portal-fallback-canvas');
        
        const videoPath = mediaConfig.videos.video2;
        const isVideoAvailable = window.assetRegistry && window.assetRegistry.videos[videoPath];
        
        if (isVideoAvailable) {
            video.classList.remove('hide');
            video.play().catch(err => {
                console.warn("[Scene10] Video 2 play failed, falling back to canvas", err);
                this.startPortalFallback(canvas);
            });
            
            video.addEventListener('ended', () => this.proceed());
        } else {
            this.startPortalFallback(canvas);
        }
    }

    startPortalFallback(canvas) {
        console.log("[Scene10] Playing visual portal fallback...");
        canvas.classList.remove('hide');
        
        const cCtx = canvas.getContext('2d');
        canvas.width = 480;
        canvas.height = 270;
        
        let frame = 0;
        const render = () => {
            if (this.container.classList.contains('scene-exit')) return;
            frame++;
            
            // Draw a beautiful dark space background
            cCtx.fillStyle = '#060613';
            cCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw glowing core
            let grad = cCtx.createRadialGradient(canvas.width / 2, canvas.height / 2, 5, canvas.width / 2, canvas.height / 2, 120);
            grad.addColorStop(0, 'rgba(229, 192, 96, 0.22)');
            grad.addColorStop(0.5, 'rgba(195, 132, 139, 0.08)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            cCtx.fillStyle = grad;
            cCtx.beginPath();
            cCtx.arc(canvas.width / 2, canvas.height / 2, 120, 0, Math.PI * 2);
            cCtx.fill();
            
            // Draw rotating galaxy spiral rings
            cCtx.save();
            cCtx.translate(canvas.width / 2, canvas.height / 2);
            cCtx.rotate(frame * 0.012);
            
            for (let i = 0; i < 8; i++) {
                cCtx.rotate(Math.PI / 4);
                cCtx.beginPath();
                cCtx.ellipse(0, 0, 80 + Math.sin(frame * 0.03 + i) * 6, 25, 0, 0, Math.PI * 2);
                cCtx.strokeStyle = `rgba(195, 132, 139, ${0.16 + Math.sin(frame * 0.02 + i) * 0.06})`;
                cCtx.lineWidth = 1.5;
                cCtx.stroke();
            }
            cCtx.restore();

            // Draw glowing center orb
            cCtx.beginPath();
            cCtx.arc(canvas.width / 2, canvas.height / 2, 35 + Math.sin(frame * 0.05) * 3, 0, Math.PI * 2);
            cCtx.fillStyle = 'rgba(229, 192, 96, 0.12)';
            cCtx.fill();
            cCtx.strokeStyle = 'rgba(229, 192, 96, 0.4)';
            cCtx.lineWidth = 2;
            cCtx.stroke();
            
            // Draw text
            cCtx.font = "italic 11px Montserrat";
            cCtx.fillStyle = "rgba(255, 255, 255, 0.6)";
            cCtx.textAlign = "center";
            cCtx.fillText("Wish Tree Video Portal", canvas.width / 2, canvas.height / 2 + 4);

            this.portalFallbackFrameId = requestAnimationFrame(render);
        };
        render();

        const subContainer = this.container.querySelector('#portal-subtitles');
        this.subtitleIndex = 0;
        
        const showNext = () => {
            if (this.subtitleIndex < this.subtitles.length) {
                subContainer.innerText = this.subtitles[this.subtitleIndex];
                this.subtitleIndex++;
                this.videoTimer = setTimeout(showNext, 3800);
            } else {
                subContainer.innerText = "✨";
            }
        };
        showNext();
    }

    renderParticles() {
        this.pCtx.clearRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
        
        if (this.wishCount === 3 && !this.isTreeGrowing) {
            this.redrawTree();
        }
        
        // Draw Heart Rain
        this.hearts.forEach(h => {
            h.y += h.speedY;
            h.swayOffset += h.swaySpeed;
            h.x += Math.sin(h.swayOffset) * 0.25;
            
            if (h.y > this.particlesCanvas.height) {
                h.y = -20;
                h.x = Math.random() * this.particlesCanvas.width;
            }
            
            this.pCtx.fillStyle = `rgba(195, 132, 139, ${h.opacity})`;
            this.pCtx.beginPath();
            const hs = h.size;
            this.pCtx.save();
            this.pCtx.translate(h.x, h.y);
            this.pCtx.moveTo(0, 0);
            this.pCtx.bezierCurveTo(-hs/2, -hs/2, -hs, hs/3, 0, hs);
            this.pCtx.bezierCurveTo(hs, hs/3, hs/2, -hs/2, 0, 0);
            this.pCtx.fill();
            this.pCtx.restore();
        });
        
        // Draw Floating Diyas
        this.diyas.forEach(d => {
            d.y += d.speedY;
            d.swayOffset += d.swaySpeed;
            const sx = Math.sin(d.swayOffset) * d.swayRange * 0.05;
            
            if (d.y < -30) {
                d.y = this.particlesCanvas.height + 30;
                d.x = Math.random() * this.particlesCanvas.width;
            }
            
            this.pCtx.save();
            this.pCtx.translate(d.x + sx, d.y);
            this.pCtx.globalAlpha = d.opacity;
            
            this.pCtx.fillStyle = '#8d6e63';
            this.pCtx.beginPath();
            this.pCtx.arc(0, 0, d.size, 0, Math.PI);
            this.pCtx.closePath();
            this.pCtx.fill();
            
            this.pCtx.fillStyle = '#5d4037';
            this.pCtx.fillRect(-d.size, -2, d.size * 2, 4);
            
            this.pCtx.fillStyle = 'radial-gradient(circle at bottom, #ffe082, #ffb300)';
            this.pCtx.shadowBlur = 10;
            this.pCtx.shadowColor = '#ffa000';
            
            const flameW = d.size * 0.35 + Math.sin(this.treeProgress + d.swayOffset * 5) * 1.5;
            const flameH = d.size * 0.7 + Math.cos(this.treeProgress + d.swayOffset * 5) * 2;
            
            this.pCtx.beginPath();
            this.pCtx.fillStyle = '#ffa726';
            this.pCtx.ellipse(0, -flameH/2 - 2, flameW, flameH, 0, 0, Math.PI * 2);
            this.pCtx.fill();
            
            this.pCtx.beginPath();
            this.pCtx.fillStyle = '#ffeb3b';
            this.pCtx.ellipse(0, -flameH/2, flameW * 0.6, flameH * 0.6, 0, 0, Math.PI * 2);
            this.pCtx.fill();
            
            this.pCtx.restore();
        });
        
        this.animationFrameId = requestAnimationFrame(() => this.renderParticles());
    }

    proceed() {
        const video = this.container.querySelector('#portal-video');
        if (video) video.pause();
        if (this.videoTimer) clearTimeout(this.videoTimer);
        if (this.portalFallbackFrameId) cancelAnimationFrame(this.portalFallbackFrameId);

        // Close curtains first
        const curtain = this.container.querySelector('#curtain-overlay');
        if (curtain) {
            curtain.classList.add('closed');
        }

        setTimeout(() => {
            router.navigate('scene11'); // Transition to Special Memories Orbs (Scene 11)
        }, 1600);
    }

    showBlessingBubble(index, cx, cy) {
        const bubble = document.createElement('div');
        bubble.className = 'leaf-wish-bubble';
        
        const wishes = content.wishTreeWishes;
        bubble.innerText = wishes[index % wishes.length] || "Happy Birthday!";
        
        bubble.style.position = 'fixed';
        bubble.style.left = `${cx - 85}px`;
        bubble.style.top = `${cy - 30}px`;
        bubble.style.zIndex = '9999';
        document.body.appendChild(bubble);
        
        setTimeout(() => {
            bubble.style.transform = 'translateY(-280px)';
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 4500);
        }, 50);
    }

    triggerLeafWish(leaf, e) {
        leaf.isDetached = true;
        this.treeCacheValid = false; // Invalidate cache so this leaf is not drawn on static tree
        
        const bubble = document.createElement('div');
        bubble.className = 'leaf-wish-bubble';
        
        const wishes = content.wishTreeWishes;
        bubble.innerText = wishes[Math.floor(Math.random() * wishes.length)] || "Happy Birthday!";
        
        bubble.style.position = 'fixed';
        bubble.style.left = `${e.clientX - 65}px`;
        bubble.style.top = `${e.clientY - 25}px`;
        bubble.style.zIndex = '9999';
        document.body.appendChild(bubble);
        
        setTimeout(() => {
            bubble.style.transform = 'translateY(-280px)';
            bubble.style.opacity = '0';
            setTimeout(() => bubble.remove(), 4500);
        }, 50);
        
        this.playWishChord(3);
    }

    exit() {
        console.log("[Scene10] Exiting scene...");
        this.container.classList.add('scene-exit');
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        const video = this.container.querySelector('#portal-video');
        if (video) video.pause();
        if (this.videoTimer) clearTimeout(this.videoTimer);
    }

    destroy() {
        console.log("[Scene10] Destroying scene...");
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        if (this.portalFallbackFrameId) cancelAnimationFrame(this.portalFallbackFrameId);
        if (this.videoTimer) clearTimeout(this.videoTimer);
        this.treeLeaves = [];
        if (this.container) {
            this.container.remove();
        }
    }

    injectStyles() {
        const styleId = 'wish-style-s10';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            #wish-particle-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                pointer-events: none;
            }
            .wish-layout {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                padding: 40px 20px;
            }
            .wish-instructions {
                max-width: 480px;
                width: 90%;
                padding: 15px 25px;
                text-align: center;
            }
            .wish-instructions h3 {
                font-family: var(--font-serif);
                color: var(--color-gold);
                font-size: 1.1rem;
                letter-spacing: 1px;
                margin-bottom: 5px;
            }
            .wish-instructions p {
                font-size: 0.8rem;
                color: var(--color-text-secondary);
            }
            .tree-viewport {
                position: relative;
                width: 100%;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-bottom: 10px;
            }
            .tree-canvas-wrapper {
                position: relative;
                max-width: 520px;
                width: 90%;
                aspect-ratio: 1.1 / 1;
                display: flex;
                justify-content: center;
                align-items: flex-end;
            }
            #tree-canvas {
                width: 100%;
                height: 100%;
                display: block;
            }
            .tree-portal {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 320px;
                padding: 15px;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 10;
                animation: scale-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                border-color: rgba(195, 132, 139, 0.25);
                box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(195,132,139,0.05);
            }
            .portal-video-frame {
                position: relative;
                width: 100%;
                aspect-ratio: 16/9;
                background: #000;
                border-radius: 8px;
                overflow: hidden;
                border: 1px solid var(--color-glass-border);
                margin-bottom: 12px;
            }
            #portal-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            #portal-fallback-canvas {
                width: 100%;
                height: 100%;
            }
            .portal-subtitles {
                position: absolute;
                bottom: 8px;
                left: 5%;
                width: 90%;
                text-align: center;
                background: rgba(4, 4, 12, 0.8);
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                color: #fff;
                padding: 6px;
                border-radius: 6px;
                font-size: 0.75rem;
                min-height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .portal-btn {
                font-size: 0.7rem;
                padding: 8px 16px;
                border-color: rgba(195, 132, 139, 0.3);
            }
            .envelopes-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10;
            }
            .envelope-node {
                position: absolute;
                width: 34px;
                height: 34px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 1.45rem;
                cursor: pointer;
                pointer-events: auto;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(229, 192, 96, 0.32);
                border-radius: 8px;
                backdrop-filter: blur(5px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.35), 0 0 10px rgba(229, 192, 96, 0.15);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease, border-color 0.4s;
                transform-origin: top center;
                animation: hang-sway 4.5s infinite ease-in-out alternate;
            }
            .envelope-node:nth-child(1) { animation-delay: 0.1s; }
            .envelope-node:nth-child(2) { animation-delay: 0.8s; }
            .envelope-node:nth-child(3) { animation-delay: 1.5s; }
            .envelope-node:nth-child(4) { animation-delay: 2.2s; }
            .envelope-node:nth-child(5) { animation-delay: 0.5s; }
            .envelope-node:nth-child(6) { animation-delay: 1.8s; }

            .envelope-node:hover {
                transform: scale(1.22) rotate(6deg);
                border-color: rgba(229, 192, 96, 0.85);
                box-shadow: 0 8px 20px rgba(229, 192, 96, 0.45);
            }
            .envelope-node.opened {
                opacity: 0;
                transform: translateY(35px) scale(0) rotate(-15deg);
                pointer-events: none;
            }

            @keyframes hang-sway {
                0% { transform: rotate(-5deg); }
                100% { transform: rotate(5deg); }
            }
            .leaf-wish-bubble {
                position: fixed;
                background: rgba(13, 13, 30, 0.85);
                backdrop-filter: blur(8px);
                border: 1.5px solid var(--color-gold);
                color: #ffe082;
                padding: 8px 14px;
                border-radius: 12px;
                font-family: var(--font-sans);
                font-size: 0.78rem;
                font-weight: 600;
                pointer-events: none;
                box-shadow: 0 5px 15px rgba(0,0,0,0.6), 0 0 10px rgba(229,192,96,0.25);
                transition: transform 4.5s cubic-bezier(0.1, 0.8, 0.2, 1), opacity 4.5s ease;
                white-space: nowrap;
            }
            .curtain-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
                display: flex;
            }
            .curtain-panel {
                width: 50%;
                height: 100%;
                background: linear-gradient(135deg, #2b0202, #0d0101);
                border-right: 1.5px solid rgba(229, 192, 96, 0.22);
                border-left: 1.5px solid rgba(229, 192, 96, 0.22);
                box-shadow: 0 0 35px rgba(0,0,0,0.85);
                transition: transform 1.6s cubic-bezier(0.77, 0, 0.175, 1);
            }
            .curtain-left {
                transform: translateX(-100%);
            }
            .curtain-right {
                transform: translateX(100%);
            }
            .curtain-overlay.closed .curtain-left {
                transform: translateX(0);
                pointer-events: auto;
            }
            .curtain-overlay.closed .curtain-right {
                transform: translateX(0);
                pointer-events: auto;
            }
            .flash-bloom {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                opacity: 0.95;
                z-index: 100;
                animation: fade-out 0.8s ease-out forwards;
                pointer-events: none;
            }
            @media (max-width: 480px) {
                .tree-portal { width: 90%; }
            }
        `;
        document.head.appendChild(style);
    }
}
