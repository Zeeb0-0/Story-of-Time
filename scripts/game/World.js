import DEBUG from '../utils/debug.js';

export class World {
    constructor() {
        this.platforms = [];
        this.collectibles = [];
        this.enemies = [];
        this.currentLevel = 1;
        this.gravity = 900;
        this.backgroundColor = '#333';
    }

    initialize() {
        this.loadLevel(this.currentLevel);
        DEBUG.log(`World initialized at level ${this.currentLevel}`, 'info');
    }

    loadLevel(levelNumber) {
        // Example level generation
        this.platforms = [
            { x: 0, y: 550, width: 800, height: 50 }, // Ground
            { x: 300, y: 400, width: 200, height: 20 }, // Platform
            { x: 100, y: 300, width: 200, height: 20 }, // Platform
        ];

        this.collectibles = [
            { x: 350, y: 380, type: 'coin' },
            { x: 150, y: 280, type: 'powerup' }
        ];

        this.enemies = [
            { x: 400, y: 500, type: 'basic', direction: 1 }
        ];

        DEBUG.log(`Level ${levelNumber} loaded`, 'info');
    }

    update(deltaTime) {
        this.updateEnemies(deltaTime);
        this.updateCollectibles(deltaTime);
    }

    render(ctx) {
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw platforms
        ctx.fillStyle = '#666';
        this.platforms.forEach(platform => {
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        });

        // Draw collectibles
        ctx.fillStyle = '#ffff00';
        this.collectibles.forEach(collectible => {
            ctx.beginPath();
            ctx.arc(collectible.x, collectible.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw enemies
        ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            ctx.fillRect(enemy.x, enemy.y, 30, 30);
        });
    }

    checkCollisions(player) {
        this.checkPlatformCollisions(player);
        this.checkCollectibleCollisions(player);
        this.checkEnemyCollisions(player);
    }

    checkPlatformCollisions(player) {
        for (const platform of this.platforms) {
            if (this.rectangleCollision(player, platform)) {
                // Handle collision
                this.resolveCollision(player, platform);
            }
        }
    }

    rectangleCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    resolveCollision(player, platform) {
        // Basic collision resolution
        const overlapX = Math.min(
            Math.abs(player.x + player.width - platform.x),
            Math.abs(platform.x + platform.width - player.x)
        );

        const overlapY = Math.min(
            Math.abs(player.y + player.height - platform.y),
            Math.abs(platform.y + platform.height - player.y)
        );

        if (overlapX < overlapY) {
            if (player.x < platform.x) player.x = platform.x - player.width;
            else player.x = platform.x + platform.width;
            player.velocity.x = 0;
        } else {
            if (player.y < platform.y) {
                player.y = platform.y - player.height;
                player.velocity.y = 0;
                player.isJumping = false;
            } else {
                player.y = platform.y + platform.height;
                player.velocity.y = 0;
            }
        }
    }

    getState() {
        return {
            currentLevel: this.currentLevel,
            platforms: [...this.platforms],
            collectibles: [...this.collectibles],
            enemies: [...this.enemies]
        };
    }

    setState(state) {
        Object.assign(this, state);
    }
}