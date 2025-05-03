import { CONFIG } from '../core/config.js';
import DEBUG from '../utils/debug.js';
import performanceMonitor from '../core/performance.js';
import { Player } from './Player.js';

export class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.isRunning = false;
        this.lastRender = 0;
        this.fps = CONFIG.GAME.FPS;
        this.timestep = CONFIG.GAME.TIMESTEP;
        this.isDebugMode = false;
        this.lastUpdate = '2025-05-02 13:57:32';
        this.user = 'Zeeb0-0';
    }

    async initialize() {
        try {
            // Initialize canvas
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            
            // Initialize player
            this.player = new Player();
            
            // Bind events
            this.bindEvents();
            
            DEBUG.log('Game initialized', 'info');
        } catch (error) {
            DEBUG.log('Game initialization failed', 'error');
            throw error;
        }
    }

    setupCanvas() {
        this.canvas.width = CONFIG.GAME.WIDTH;
        this.canvas.height = CONFIG.GAME.HEIGHT;
        this.ctx.imageSmoothingEnabled = false;
        this.handleResize();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.handleResize());
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('keyup', (e) => this.handleInput(e));
    }

    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scale = Math.min(
            containerWidth / CONFIG.GAME.WIDTH,
            containerHeight / CONFIG.GAME.HEIGHT
        );

        this.canvas.style.width = `${CONFIG.GAME.WIDTH * scale}px`;
        this.canvas.style.height = `${CONFIG.GAME.HEIGHT * scale}px`;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastRender = performance.now();
            this.gameLoop();
            DEBUG.log('Game started', 'info');
        }
    }

    stop() {
        this.isRunning = false;
        DEBUG.log('Game stopped', 'info');
    }

    gameLoop(timestamp = performance.now()) {
        if (!this.isRunning) return;

        const deltaTime = timestamp - this.lastRender;

        if (deltaTime >= this.timestep) {
            this.update(deltaTime / 1000);
            this.render();
            this.lastRender = timestamp;

            // Emit event for performance monitoring
            window.dispatchEvent(new Event('gameLoop'));
        }

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(deltaTime) {
        if (this.player) {
            this.player.update(deltaTime);
        }

        // Apply gravity in debug mode
        if (this.isDebugMode && this.player) {
            this.player.velocity.y += CONFIG.PHYSICS.GRAVITY * deltaTime;
            // Simple ground collision
            if (this.player.position.y > CONFIG.GAME.HEIGHT - this.player.size.height) {
                this.player.position.y = CONFIG.GAME.HEIGHT - this.player.size.height;
                this.player.velocity.y = 0;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.player) {
            this.player.render(this.ctx);
        }

        if (DEBUG.enabled) {
            this.renderDebugInfo();
        }
    }

    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        
        const debugInfo = [
            `FPS: ${Math.round(1000 / this.timestep)}`,
            `Player Pos: (${Math.round(this.player?.position.x || 0)}, ${Math.round(this.player?.position.y || 0)})`,
            `Debug Mode: ${this.isDebugMode}`,
            `Last Update: ${this.lastUpdate}`,
            `User: ${this.user}`
        ];

        debugInfo.forEach((info, index) => {
            this.ctx.fillText(info, 10, 20 + (index * 15));
        });

        this.ctx.restore();
    }

    handleInput(event) {
        if (!this.player) return;

        const isKeyDown = event.type === 'keydown';
        
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                if (isKeyDown) {
                    this.player.moveLeft();
                } else {
                    this.player.stopMoving();
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (isKeyDown) {
                    this.player.moveRight();
                } else {
                    this.player.stopMoving();
                }
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                if (isKeyDown) {
                    this.player.jump();
                }
                break;
            case 'KeyF':
                if (isKeyDown) {
                    this.player.attack();
                }
                break;
        }
    }

    setupDebugState() {
        this.isDebugMode = true;
        
        // Create a basic rectangle for the player if sprites aren't loaded
        this.player = {
            position: { x: 100, y: 100 },
            size: { width: 96, height: 96 },
            velocity: { x: 0, y: 0 },
            color: '#00ff00',
            lastUpdate: this.lastUpdate,
            
            update(deltaTime) {
                this.position.x += this.velocity.x * deltaTime;
                this.position.y += this.velocity.y * deltaTime;
                
                // Keep player in bounds
                this.position.x = Math.max(0, Math.min(CONFIG.GAME.WIDTH - this.size.width, this.position.x));
            },
            
            render(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(
                    this.position.x,
                    this.position.y,
                    this.size.width,
                    this.size.height
                );

                // Draw direction indicator
                ctx.beginPath();
                ctx.moveTo(
                    this.position.x + this.size.width / 2,
                    this.position.y + this.size.height / 2
                );
                ctx.lineTo(
                    this.position.x + this.size.width / 2 + (this.velocity.x > 0 ? 20 : -20),
                    this.position.y + this.size.height / 2
                );
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            },
            
            moveLeft() { 
                this.velocity.x = -200;
                this.color = '#00ff00';
            },
            
            moveRight() { 
                this.velocity.x = 200;
                this.color = '#00ff00';
            },
            
            stopMoving() { 
                this.velocity.x = 0;
                this.color = '#00ff00';
            },
            
            jump() {
                if (this.position.y >= CONFIG.GAME.HEIGHT - this.size.height) {
                    this.velocity.y = -400;
                    this.color = '#ffff00';
                }
            },
            
            attack() {
                this.color = '#ff0000';
                setTimeout(() => this.color = '#00ff00', 100);
            }
        };

        DEBUG.log('Debug state initialized', 'info');
    }
}