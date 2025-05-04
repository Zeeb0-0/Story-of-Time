const X_VELOCITY = 100
const JUMP_POWER = 250
const GRAVITY = 580

class Player {
  constructor({ x, y, size, velocity = { x: 78, y: 58 } }) {
    this.x = x
    this.y = y
    
    // Original sprite dimensions
    this.frameWidth = 78 // Width of each frame in the spritesheet
    this.frameHeight = 58 // Height of each frame in the spritesheet
    
    // Calculate width and height to maintain aspect ratio
    // Use size as the height reference
    this.height = size
    this.width = (this.frameWidth / this.frameHeight) * size
    
    this.velocity = velocity
    this.isOnGround = false
    
    // Animation properties
    this.sprites = {
      idle: {
        img: null,
        frameCount: 11,
        currentFrame: 0
      },
      run: {
        img: null,
        frameCount: 8,
        currentFrame: 0
      },
      jump: {
        img: null,
        frameCount: 1,
        currentFrame: 0
      },
      fall: {
        img: null,
        frameCount: 1,
        currentFrame: 0
      }
    }
    
    // Load the run spritesheet using your existing loadImage function
    this.loadSprites()
    
    // Animation state
    this.state = 'idle' // 'idle', 'run', 'jump', 'fall'
    this.frameTimer = 0
    this.frameDuration = 0.1 // Time per frame in seconds
    this.facingDirection = 1 // 1 for right, -1 for left
    
    // Improved hitbox that better matches the character's feet and body
    this.hitboxOffset = {
      x: this.width * 0.3,      // Move hitbox more to the center horizontally
      y: this.height * 0.3,     // Start hitbox lower from the top
      width: this.width * 0.2,  // Make hitbox narrower
      height: this.height * 0.4 // Make hitbox shorter
    }
  }
  
  async loadSprites() {
    try {
      this.sprites.idle.img = await loadImage('./images/player/idle.png')
      this.sprites.run.img = await loadImage('./images/player/run.png')
      this.sprites.jump.img = await loadImage('./images/player/jump.png')
      this.sprites.fall.img = await loadImage('./images/player/fall.png')
    } catch (error) {
      console.error('Failed to load player sprites:', error)
    }
  }

  draw(c) {
    // Get the current sprite based on state
    const sprite = this.sprites[this.state]
    
    // Check if we have a valid sprite for the current state
    if (sprite && sprite.img) {
      // Save context state
      c.save()
      
      // Set up for flipping if facing left
      if (this.facingDirection === -1) {
        c.translate(this.x + this.width, this.y)
        c.scale(-1, 1)
      } else {
        c.translate(this.x, this.y)
      }
      
      // Draw the sprite
      c.drawImage(
        sprite.img,
        sprite.currentFrame * this.frameWidth, 0,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.width, this.height
      )
      
      // Restore context state
      c.restore()
      
      // Debug mode visualization
      if (window.debugMode) {
        this.drawDebugInfo(c)
      }
    }
  }

  drawDebugInfo(c) {
    // Draw hitbox
    const hitbox = this.getHitbox()
    c.strokeStyle = 'lime'
    c.lineWidth = 2
    c.strokeRect(
      hitbox.x,
      hitbox.y,
      hitbox.width,
      hitbox.height
    )

     // Draw sprite bounds
     c.strokeStyle = 'yellow'
     c.lineWidth = 1
     c.strokeRect(this.x, this.y, this.width, this.height)
 
     // Calculate center based on hitbox position instead of sprite position
     const centerX = hitbox.x + hitbox.width / 2
     const centerY = hitbox.y + hitbox.height / 2
     
     // Draw center point
     c.beginPath()
     c.arc(centerX, centerY, 3, 0, Math.PI * 2)
     c.fillStyle = 'red'
     c.fill()

    // Draw debug info with position relative to hitbox
    c.font = '12px monospace'
    c.fillStyle = 'white'
    c.strokeStyle = 'black'
    c.lineWidth = 3
    
    const debugInfo = [
      `Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`,
      `Hitbox: (${Math.round(hitbox.x)}, ${Math.round(hitbox.y)})`,
      `Vel: (${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
      `Facing: ${this.facingDirection === 1 ? 'right' : 'left'}`,
      `State: ${this.state}`,
      `OnGround: ${this.isOnGround}`
    ]

    // Position debug text based on facing direction
    const textX = this.facingDirection === -1 ? 
      hitbox.x + hitbox.width + 5 : // When facing left, put text to the right
      hitbox.x - 5;                 // When facing right, put text to the left
      
    debugInfo.forEach((text, index) => {
      const yPos = hitbox.y - 10 - (index * 15)
      c.strokeText(text, textX, yPos)
      c.fillText(text, textX, yPos)
    })
  }
  
  drawHitbox(c) {
    c.fillStyle = 'rgba(0, 255, 0, 0.3)'
    c.fillRect(
      this.x + this.hitboxOffset.x,
      this.y + this.hitboxOffset.y,
      this.hitboxOffset.width,
      this.hitboxOffset.height
    )
  }

  updateAnimation(deltaTime) {
    // Update animation state based on movement
    if (this.velocity.y < 0) {
      this.state = 'jump'
    } else if (this.velocity.y > 0) {
      this.state = 'fall'
    } else if (this.velocity.x !== 0) {
      this.state = 'run'
    } else {
      this.state = 'idle'
    }
    
    // Update facing direction
    if (this.velocity.x > 0) this.facingDirection = 1
    else if (this.velocity.x < 0) this.facingDirection = -1
    
    // Update animation frame
    this.frameTimer += deltaTime
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0
      
      // Get the current sprite
      const sprite = this.sprites[this.state]
      if (sprite) {
        // Advance the frame
        sprite.currentFrame = (sprite.currentFrame + 1) % sprite.frameCount
      }
    }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return
    
    this.applyGravity(deltaTime)
    
    // Update horizontal position and check collisions
    this.updateHorizontalPosition(deltaTime)
    this.checkForHorizontalCollisions(collisionBlocks)
    
    // Check for any platform collisions
    this.checkPlatformCollisions(platforms, deltaTime)
    
    // Update vertical position and check collisions
    this.updateVerticalPosition(deltaTime)
    this.checkForVerticalCollisions(collisionBlocks)
    
    // Update animation
    this.updateAnimation(deltaTime)
  }

  jump() {
    this.velocity.y = -JUMP_POWER
    this.isOnGround = false
  }

  updateHorizontalPosition(deltaTime) {
    this.x += this.velocity.x * deltaTime
  }

  updateVerticalPosition(deltaTime) {
    this.y += this.velocity.y * deltaTime
  }

  applyGravity(deltaTime) {
    this.velocity.y += GRAVITY * deltaTime
  }

  handleInput(keys) {
    this.velocity.x = 0
    if (keys.d.pressed) {
      this.velocity.x = X_VELOCITY
    } else if (keys.a.pressed) {
      this.velocity.x = -X_VELOCITY
    }
  }

  // Get hitbox coordinates for collision detection
  // Update getHitbox to be more precise with the sprite direction
  getHitbox() {
    let hitboxX;
    
    if (this.facingDirection === -1) {
      // When facing left, adjust hitbox position
      hitboxX = this.x + (this.width - this.hitboxOffset.x - this.hitboxOffset.width);
    } else {
      // When facing right, use normal offset
      hitboxX = this.x + this.hitboxOffset.x;
    }

    return {
      x: hitboxX,
      y: this.y + this.hitboxOffset.y,
      width: this.hitboxOffset.width,
      height: this.hitboxOffset.height
    }
  }

  // Also update the checkForHorizontalCollisions method to handle flipped hitbox
  checkForHorizontalCollisions(collisionBlocks) {
    const buffer = 0.0001
    const hitbox = this.getHitbox()
    
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]
      
      // Check if a collision exists
      if (
        hitbox.x <= collisionBlock.x + collisionBlock.width &&
        hitbox.x + hitbox.width >= collisionBlock.x &&
        hitbox.y + hitbox.height >= collisionBlock.y &&
        hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // When going left
        if (this.velocity.x < 0) {
          const hitboxOffset = this.facingDirection === -1 ?
            (this.width - this.hitboxOffset.x - this.hitboxOffset.width) :
            this.hitboxOffset.x;
          
          this.x = collisionBlock.x + collisionBlock.width - hitboxOffset + buffer;
          break;
        }
        
        // When going right
        if (this.velocity.x > 0) {
          const hitboxOffset = this.facingDirection === -1 ?
            (this.width - this.hitboxOffset.x - this.hitboxOffset.width) :
            this.hitboxOffset.x;
            
          this.x = collisionBlock.x - this.hitboxOffset.width - hitboxOffset - buffer;
          break;
        }
      }
    }
  }

  // Update vertical collision check to use the correct hitbox position
  checkForVerticalCollisions(collisionBlocks) {
    const buffer = 0.0001
    const hitbox = this.getHitbox()
    
    for (let i = 0; i < collisionBlocks.length; i++) {
      const collisionBlock = collisionBlocks[i]
      
      if (
        hitbox.x <= collisionBlock.x + collisionBlock.width &&
        hitbox.x + hitbox.width >= collisionBlock.x &&
        hitbox.y + hitbox.height >= collisionBlock.y &&
        hitbox.y <= collisionBlock.y + collisionBlock.height
      ) {
        // Going up
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          const hitboxOffset = this.hitboxOffset.y
          this.y = collisionBlock.y + collisionBlock.height - hitboxOffset + buffer
          break
        }
        
        // Going down
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          const hitboxOffset = this.hitboxOffset.y
          this.y = collisionBlock.y - hitbox.height - hitboxOffset - buffer
          this.isOnGround = true
          break
        }
      }
    }
  }

  // Update platform collision check as well
  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001
    const hitbox = this.getHitbox()
    
    for (let platform of platforms) {
      // Check if the bottom of the hitbox is at or slightly above the platform
      // and the player is moving downward
      if (
        hitbox.x + hitbox.width >= platform.x &&
        hitbox.x <= platform.x + platform.width &&
        Math.abs(hitbox.y + hitbox.height - platform.y) <= 5 &&
        this.velocity.y > 0
      ) {
        this.velocity.y = 0
        const hitboxOffset = this.hitboxOffset.y
        this.y = platform.y - hitbox.height - hitboxOffset - buffer
        this.isOnGround = true
        return
      }
    }
    
    // If no platform collision was detected and we're not on ground from block collisions
    if (this.velocity.y > 0 && this.isOnGround) {
      this.isOnGround = false
    }
  }

  // Add this helper method to make hitbox offset calculations clearer
  getHitboxOffset() {
    return this.facingDirection === -1 ?
      (this.width - this.hitboxOffset.x - this.hitboxOffset.width) :
      this.hitboxOffset.x;
  }
}
