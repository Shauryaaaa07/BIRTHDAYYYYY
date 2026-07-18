import { router } from '../js/router.js';
import { musicManager } from '../js/musicManager.js';
import { content } from '../js/content.js';

export class Scene1 {
    constructor() {
        this.container = null;
        this.board = Array(9).fill(null);
        this.gameActive = true;
        this.currentPlayer = 'X'; // User is X, AI is O
        this.cells = [];
        this.statusText = null;
        this.actionBtn = null;
    }

    init() {
        console.log("[Scene1] Initializing Tic Tac Toe...");
        
        this.container = document.createElement('div');
        this.container.id = 'scene1-container';
        this.container.className = 'scene-container';
        
        this.container.innerHTML = `
            <div class="ttt-card glass-card">
                <div class="ttt-subtitle">LET'S PLAY A GAME</div>
                <h2 class="ttt-title">${content.birthdayGirlName}'s Icebreaker</h2>
                
                <div id="ttt-status" class="ttt-status">Your turn! Tap any cell to place X.</div>
                
                <div class="ttt-grid">
                    <div class="ttt-cell" data-index="0"></div>
                    <div class="ttt-cell" data-index="1"></div>
                    <div class="ttt-cell" data-index="2"></div>
                    <div class="ttt-cell" data-index="3"></div>
                    <div class="ttt-cell" data-index="4"></div>
                    <div class="ttt-cell" data-index="5"></div>
                    <div class="ttt-cell" data-index="6"></div>
                    <div class="ttt-cell" data-index="7"></div>
                    <div class="ttt-cell" data-index="8"></div>
                </div>
                
                <button id="ttt-next-btn" class="glass-btn ttt-btn hide">Proceed into the Forest</button>
            </div>
        `;

        this.cells = this.container.querySelectorAll('.ttt-cell');
        this.statusText = this.container.querySelector('#ttt-status');
        this.actionBtn = this.container.querySelector('#ttt-next-btn');

        // Event listeners
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });

        this.actionBtn.addEventListener('click', () => this.proceed());

        // Dynamic styling for Tic Tac Toe
        const styleId = 'ttt-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .ttt-card {
                    text-align: center;
                    padding: 40px;
                    max-width: 450px;
                    width: 90%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                .ttt-subtitle {
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 3px;
                    color: var(--color-rose-gold);
                    margin-bottom: 8px;
                }
                .ttt-title {
                    font-family: var(--font-serif);
                    font-size: 1.8rem;
                    font-weight: 400;
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                    color: var(--color-text-primary);
                }
                .ttt-status {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                    margin-bottom: 25px;
                    min-height: 20px;
                    font-style: italic;
                    letter-spacing: 1px;
                }
                .ttt-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-gap: 12px;
                    width: 270px;
                    height: 270px;
                    margin-bottom: 30px;
                }
                .ttt-cell {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1.5px solid var(--color-glass-border);
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 2.2rem;
                    font-family: var(--font-serif);
                    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                    position: relative;
                }
                .ttt-cell:hover:not(.marked) {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.25);
                }
                .ttt-cell.marked {
                    cursor: default;
                }
                /* Draw X styling */
                .ttt-x {
                    color: var(--color-gold);
                    text-shadow: 0 0 15px var(--color-gold-glow);
                    animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                /* Draw O styling */
                .ttt-o {
                    color: var(--color-rose-gold);
                    text-shadow: 0 0 15px var(--color-rose-glow);
                    animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .ttt-btn {
                    margin-top: 10px;
                }
                @media (max-width: 480px) {
                    .ttt-grid {
                        width: 220px;
                        height: 220px;
                        grid-gap: 8px;
                    }
                    .ttt-cell {
                        font-size: 1.8rem;
                        border-radius: 8px;
                    }
                    .ttt-title {
                        font-size: 1.5rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        return this.container;
    }

    enter() {
        console.log(" Entering ...");
        
        // Ensure Song 1 plays continuously from here
        musicManager.playTrack(1);

        setTimeout(() => {
            this.container.classList.add('scene-active');
        }, 50);
    }

    handleCellClick(e) {
        if (!this.gameActive || this.currentPlayer !== 'X') return;

        const cell = e.target;
        const index = parseInt(cell.getAttribute('data-index'));

        if (this.board[index] !== null) return;

        // Player Move
        this.makeMove(index, 'X');

        // Check if game is over after user's move
        if (this.checkGameOver()) return;

        // AI Move (delays slightly to feel human-like)
        this.currentPlayer = 'O';
        this.statusText.innerText = `${content.birthdayGirlName}'s best friend is thinking...`;
        setTimeout(() => this.aiMove(), 600);
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = this.cells[index];
        cell.classList.add('marked');
        
        if (player === 'X') {
            cell.innerHTML = `<span class="ttt-x">X</span>`;
            this.playMoveTone(523.25); // C5 chime for player
        } else {
            cell.innerHTML = `<span class="ttt-o">O</span>`;
            this.playMoveTone(659.25); // E5 chime for AI
        }
    }

    aiMove() {
        if (!this.gameActive) return;

        // Simple strategy: check if AI can win, then block player, then pick center/corners/random
        let bestMove = this.findWinningMove('O');
        if (bestMove === null) {
            bestMove = this.findWinningMove('X'); // Block
        }
        if (bestMove === null) {
            // Pick center
            if (this.board[4] === null) bestMove = 4;
        }
        if (bestMove === null) {
            // Pick corner
            const corners = [0, 2, 6, 8].filter(i => this.board[i] === null);
            if (corners.length > 0) {
                bestMove = corners[Math.floor(Math.random() * corners.length)];
            }
        }
        if (bestMove === null) {
            // Pick random
            const empties = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
            if (empties.length > 0) {
                bestMove = empties[Math.floor(Math.random() * empties.length)];
            }
        }

        if (bestMove !== null) {
            this.makeMove(bestMove, 'O');
        }

        // Check game over
        if (this.checkGameOver()) return;

        this.currentPlayer = 'X';
        this.statusText.innerText = "Your turn! Tap a cell.";
    }

    findWinningMove(player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            const vals = [this.board[a], this.board[b], this.board[c]];
            const playerCount = vals.filter(v => v === player).length;
            const nullCount = vals.filter(v => v === null).length;

            if (playerCount === 2 && nullCount === 1) {
                if (this.board[a] === null) return a;
                if (this.board[b] === null) return b;
                if (this.board[c] === null) return c;
            }
        }
        return null;
    }

    checkGameOver() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        // Check Win
        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.endGame(this.board[a]);
                return true;
            }
        }

        // Check Draw
        if (this.board.every(cell => cell !== null)) {
            this.endGame('draw');
            return true;
        }

        return false;
    }

    endGame(winner) {
        this.gameActive = false;
        
        // Show status feedback
        if (winner === 'X') {
            this.statusText.innerText = `You won! ${content.gameStartMessage}`;
            this.playVictoryFanfare();
        } else if (winner === 'O') {
            this.statusText.innerText = `AI won! ${content.gameStartMessage}`;
            this.playMoveTone(392.00); // G4 sad chord
        } else {
            this.statusText.innerText = `A perfect draw! ${content.gameStartMessage}`;
            this.playMoveTone(440.00);
        }

        // Reveal the "Next" button
        this.actionBtn.classList.remove('hide');
    }

    playMoveTone(frequency) {
        if (!musicManager.audioCtx) return;
        
        const osc = musicManager.audioCtx.createOscillator();
        const gain = musicManager.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, musicManager.audioCtx.currentTime);
        
        gain.gain.setValueAtTime(0, musicManager.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.12, musicManager.audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, musicManager.audioCtx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(musicManager.masterGain);
        osc.start();
        osc.stop(musicManager.audioCtx.currentTime + 0.5);
    }

    playVictoryFanfare() {
        if (!musicManager.audioCtx) return;
        
        const now = musicManager.audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, idx) => {
            const osc = musicManager.audioCtx.createOscillator();
            const gain = musicManager.audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            gain.gain.setValueAtTime(0, now + idx * 0.1);
            gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.8);
            
            osc.connect(gain);
            gain.connect(musicManager.masterGain);
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.9);
        });
    }

    proceed() {
        this.container.classList.add('scene-exit');
        setTimeout(() => {
            router.navigate('scene2');
        }, 1200);
    }

    exit() {
        console.log("[Scene1] Exiting scene...");
        this.container.classList.add('scene-exit');
    }

    destroy() {
        console.log("[Scene1] Destroying scene...");
        if (this.container) {
            this.container.remove();
        }
    }
}
