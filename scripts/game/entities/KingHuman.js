import { Entity } from './Entity.js';
import DEBUG from '../../utils/debug.js';

export class KingHuman extends Entity {
    constructor(x = 0, y = 0) {
        super(x, y);
        
        this.size = { width: 96, height: 96 };
        this.animations = {
            idle: { start: 0, end: 10 },
            jump: { start: 11, end: 11 },
            fall: { start: 12, end: 12 },
            ground: { start: 13, end: 13 },
            run: { start: 14, end: 21 },
            attack: { start: 22, end: 24 },
            hit: { start: 25, end: 26 },
            dead: { start: 27, end: 30 },
            in: { start: 31, end: 38 },
            out: { start: 39, end: 46 }
        };

        this.currentAnimation = 'idle';
        this.currentFrame = 0;
        this.frameTime = 0;
        this.frameDuration = 100; // 100ms per frame
        this.isFlipped = false;
        this.user = 'Zeeb0-0';
        this.lastUpdate = '2025-05-02 13:28:46';
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update animation
        this.frameTime += deltaTime;
        if (this.frameTime >= this.frameDuration) {
            this.frameTime = 0;
            this.currentFrame++;

            const anim = this.animations[this.currentAnimation];
            if (this.currentFrame > anim.end) {
                this.currentFrame = anim.start;
            }
        }
    }

    render(ctx) {
        if (!this.sprite) return;

        const frameX = this.currentFrame * this.size.width;
        
        ctx.save();
        
        if (this.isFlipped) {
            ctx.translate(this.position.x + this.size.width, this.position.y);
            ctx.scale(-1, 1);
        } else {
            ctx.translate(this.position.x, this.position.y);
        }

        ctx.drawImage(
            this.sprite,
            frameX, 0,
            this.size.width, this.size.height,
            0, 0,
            this.size.width, this.size.height
        );

        ctx.restore();

        if (DEBUG.enabled) {
            this._drawDebug(ctx);
        }
    }

    setAnimation(name, force = false) {
        if (!force && this.currentAnimation === name) return;

        if (this.animations[name]) {
            this.currentAnimation = name;
            this.currentFrame = this.animations[name].start;
            this.frameTime = 0;
            DEBUG.log(`Animation changed to: ${name}`, 'debug');
        }
    }

    _drawDebug(ctx) {
        // Draw collision box
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );

        // Draw animation info
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.fillText(
            `${this.currentAnimation} (${this.currentFrame})`,
            this.position.x,
            this.position.y - 5
        );
    }

    loadSprite(sprite) {
        this.sprite = sprite;
    }

    moveLeft() {
        this.isFlipped = true;
        this.setAnimation('run');
        this.velocity.x = -200;
    }

    moveRight() {
        this.isFlipped = false;
        this.setAnimation('run');
        this.velocity.x = 200;
    }

    stopMoving() {
        this.velocity.x = 0;
        if (this.currentAnimation === 'run') {
            this.setAnimation('idle');
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocity.y = -400;
            this.setAnimation('jump');
        }
    }

    fall() {
        if (this.velocity.y > 0) {
            this.setAnimation('fall');
        }
    }

    land() {
        this.isJumping = false;
        this.setAnimation('ground', true);
        setTimeout(() => this.setAnimation('idle'), 100);
    }

    attack() {
        this.setAnimation('attack', true);
        setTimeout(() => {
            if (this.currentAnimation === 'attack') {
                this.setAnimation('idle');
            }
        }, 300);
    }

    hit() {
        this.setAnimation('hit', true);
        setTimeout(() => {
            if (this.currentAnimation === 'hit') {
                this.setAnimation('idle');
            }
        }, 200);
    }

    die() {
        this.setAnimation('dead', true);
    }

    spawn() {
        this.setAnimation('in', true);
        setTimeout(() => {
            if (this.currentAnimation === 'in') {
                this.setAnimation('idle');
            }
        }, 800);
    }

    despawn() {
        this.setAnimation('out', true);
        setTimeout(() => {
            if (this.currentAnimation === 'out') {
                this.setAnimation('idle');
            }
        }, 800);
    }
}