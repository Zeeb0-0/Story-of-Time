class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.health = 100;
        
        // Animation properties
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 8;
        this.animationTimer = 0;
        this.animationInterval = 1000 / 12; // 12 FPS
    }

    update(deltaTime, platforms) {
        // Horizontal movement
        if (keys['ArrowRight']) {
            this.velocityX = GAME_CONFIG.playerSpeed;
            this.frameY = 1; // Running right animation
        } else if (keys['ArrowLeft']) {
            this.velocityX = -GAME_CONFIG.playerSpeed;
            this.frameY = 2; // Running left animation
        } else {
            this.velocityX = 0;
            this.frameY = 0; // Idle animation
        }

        // Jump
        if (keys[' '] && !this.isJumping) {
            this.velocityY = GAME_CONFIG.jumpForce;
            this.isJumping = true;
        }

        // Apply gravity
        this.velocityY += GAME_CONFIG.gravity;
        
        // Limit fall speed
        if (this.velocityY > GAME_CONFIG.maxFallSpeed) {
            this.velocityY = GAME_CONFIG.maxFallSpeed;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Platform collision
        this.checkPlatformCollisions(platforms);

        // Animation
        this.updateAnimation(deltaTime);
    }

    checkPlatformCollisions(platforms) {
        platforms.forEach(platform => {
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y + this.height < platform.y + platform.height) {
                
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.isJumping = false;
            }
        });
    }

    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        if (this.animationTimer > this.animationInterval) {
            this.frameX = (this.frameX + 1) % this.maxFrame;
            this.animationTimer = 0;
        }
    }

    draw(ctx) {
        // Draw player hitbox (placeholder)
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw health bar
        const healthBarWidth = 50;
        const healthBarHeight = 5;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 5, this.y - 10, healthBarWidth, healthBarHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 5, this.y - 10, (this.health / 100) * healthBarWidth, healthBarHeight);
    }
}