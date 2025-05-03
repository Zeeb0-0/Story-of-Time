import DEBUG from '../utils/debug.js';
import { SpriteLoader } from '../utils/spriteLoader.js';

export class Player {
    constructor() {
        this.spriteLoader = new SpriteLoader();
        this.animations = new Map();
        this.currentAnimation = null;
        this.position = { x: 0, y: 0 };
        this.lastUpdate = '2025-05-02 13:04:37';
        this.velocity = { x: 0, y: 0 };
        this.size = { width: 32, height: 32 };
        this.speed = 200;
        this.jumpForce = -400;
        this.gravity = 900;
        this.health = 100;
        this.score = 0;
        this.isJumping = false;
        this.input = {
            left: false,
            right: false,
            jump: false
        };
        this.sprite = null;
    }

    // Add the missing loadSprite method that main.js is calling
    loadSprite(spriteImage) {
        if (!spriteImage) {
            DEBUG.log('Failed to load player sprite: Image is null', 'error');
            return;
        }
        
        this.sprite = spriteImage;
        this.size = { width: 96, height: 96 }; // Update size based on sprite
        DEBUG.log('Player sprite loaded successfully', 'info');
    }

    spawn() {
        DEBUG.log('Player spawned', 'info');
        this.position = { x: 100, y: 300 }; // Set initial position
    }

    async loadSprites() {
        try {
            await this.spriteLoader.loadAsepriteData(
                'player',
                './assets/sprites/player/player.json',
                './assets/sprites/player/player.png'
            );

            // Create animations
            this.animations.set('idle', this.spriteLoader.createAnimation('player', 'idle'));
            this.animations.set('walk', this.spriteLoader.createAnimation('player', 'walk'));
            this.animations.set('jump', this.spriteLoader.createAnimation('player', 'jump'));

            // Set default animation
            this.currentAnimation = this.animations.get('idle');
            this.currentAnimation.play();

        } catch (error) {
            console.error('Failed to load player sprites:', error);
        }
    }

    update(deltaTime) {
        if (this.currentAnimation) {
            this.currentAnimation.update(deltaTime);
        }

        // Handle horizontal movement
        this.velocity.x = 0;
        if (this.input.left) this.velocity.x = -this.speed;
        if (this.input.right) this.velocity.x = this.speed;

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        // Ground collision (temporary)
        if (this.position.y > 500) {
            this.position.y = 500;
            this.velocity.y = 0;
            this.isJumping = false;
        }
    }

    render(ctx) {
        if (this.sprite) {
            // Draw the sprite if available
            ctx.drawImage(
                this.sprite,
                0, 0,  // Source x, y (first frame)
                this.size.width, this.size.height, // Source width, height
                this.position.x, this.position.y, // Destination x, y
                this.size.width, this.size.height // Destination width, height
            );
        } else if (this.currentAnimation) {
            this.currentAnimation.draw(ctx, this.position.x, this.position.y);
        } else {
            // Fallback to simple rectangle if no sprite is loaded
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(
                this.position.x,
                this.position.y,
                this.size.width,
                this.size.height
            );
        }
    }

    setAnimation(name) {
        if (this.animations.has(name) && this.currentAnimation !== this.animations.get(name)) {
            this.currentAnimation = this.animations.get(name);
            this.currentAnimation.reset();
            this.currentAnimation.play();
        }
    }

    handleInput(event) {
        const keyState = event.type === 'keydown';
        
        switch(event.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.input.left = keyState;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.input.right = keyState;
                break;
            case 'Space':
            case 'ArrowUp':
            case 'KeyW':
                if (keyState && !this.isJumping) {
                    this.jump();
                }
                break;
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocity.y = this.jumpForce;
            this.isJumping = true;
            DEBUG.log('Player jumped', 'debug');
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        DEBUG.log(`Player took ${amount} damage. Health: ${this.health}`, 'info');
        return this.health <= 0;
    }

    addScore(points) {
        this.score += points;
        DEBUG.log(`Score increased by ${points}. Total: ${this.score}`, 'info');
    }

    getState() {
        return {
            position: { ...this.position },
            velocity: { ...this.velocity },
            health: this.health,
            score: this.score,
            isJumping: this.isJumping
        };
    }

    setState(state) {
        Object.assign(this, state);
    }
}