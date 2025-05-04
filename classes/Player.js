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
      },
      // New animation states
      hit: {
        img: null,
        frameCount: 2,
        currentFrame: 0
      },
      attack: {
        img: null,
        frameCount: 3,
        currentFrame: 0
      },
      dead: {
        img: null,
        frameCount: 4,
        currentFrame: 0
      },
      'door-in': {
        img: null,
        frameCount: 8,
        currentFrame: 0
      },
      'door-out': {
        img: null,
        frameCount: 8,
        currentFrame: 0
      }
    }

    this.health = 100
    this.isHit = false
    this.isDead = false
    this.isTransitioning = false
    this.animationLocked = false

    // Add attack-related properties
    this.isAttacking = false
    this.attackCooldown = 0.5 // Half second cooldown between attacks
    this.attackTimer = 0

    
    // Load the run spritesheet using your existing loadImage function
    this.loadSprites()
    
    // Animation state
    this.state = 'idle' // 'idle', 'run', 'jump', 'fall'
    this.frameTimer = 0
    this.frameDuration = 0.1 // Time per frame in seconds
    this.facingDirection = 1 // 1 for right, -1 for left
    
    // Single hitbox definition
    const hitboxWidth = this.width * 0.2  // 20% of sprite width
    const hitboxHeight = this.height * 0.4 // 40% of sprite height
    
    this.hitboxOffset = {
      width: hitboxWidth,
      height: hitboxHeight,
      x: (this.width - hitboxWidth) / 2,  // Center the hitbox
      y: this.height * 0.3                // Start hitbox 30% from top
    }
  }
  
  async loadSprites() {
    try {
      // Load existing sprites
      this.sprites.idle.img = await loadImage('./images/player/idle.png')
      this.sprites.run.img = await loadImage('./images/player/run.png')
      this.sprites.jump.img = await loadImage('./images/player/jump.png')
      this.sprites.fall.img = await loadImage('./images/player/fall.png')
      
      // Load new sprites
      this.sprites.hit.img = await loadImage('./images/player/hit.png')
      this.sprites.attack.img = await loadImage('./images/player/attack.png')
      this.sprites.dead.img = await loadImage('./images/player/dead.png')
      this.sprites['door-in'].img = await loadImage('./images/player/door-in.png')
      this.sprites['door-out'].img = await loadImage('./images/player/door-out.png')
    } catch (error) {
      console.error('Failed to load player sprites:', error)
    }
  }


  draw(c) {
    const sprite = this.sprites[this.state]
    
    if (sprite && sprite.img) {
      c.save()
      
      // Calculate the center point of the sprite
      const centerX = this.x + this.width / 2
      
      if (this.facingDirection === -1) {
        c.translate(centerX, this.y)
        c.scale(-1, 1)
        c.translate(-this.width / 2, 0)
      } else {
        c.translate(this.x, this.y)
      }
      
      c.drawImage(
        sprite.img,
        sprite.currentFrame * this.frameWidth, 0,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.width, this.height
      )
      
      c.restore()
      
      if (window.debugMode) {
        this.drawDebugInfo(c)
      }
    }
  }

  drawDebugInfo(c) {
    const hitbox = this.getHitbox()
    
    // Draw hitbox
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

    // Calculate centers
    const center = {
      x: hitbox.x + hitbox.width / 2,
      y: hitbox.y + hitbox.height / 2
    }
    
    // Draw center point
    c.beginPath()
    c.arc(center.x, center.y, 3, 0, Math.PI * 2)
    c.fillStyle = 'lime'
    c.fill()

    // Debug text
    c.font = '12px monospace'
    c.fillStyle = 'white'
    c.strokeStyle = 'black'
    c.lineWidth = 3
    
    const debugInfo = [
      `Pos: (${Math.round(this.x)}, ${Math.round(this.y)})`,
      `Center: (${Math.round(center.x)}, ${Math.round(center.y)})`,
      `Vel: (${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
      `Facing: ${this.facingDirection === 1 ? 'right' : 'left'}`,
      `State: ${this.state}`,
      `Health: ${this.health}`,
      `OnGround: ${this.isOnGround}`,
      `Attacking: ${this.isAttacking}`,
      `Attack CD: ${this.attackTimer.toFixed(2)}`,  // Add attack cooldown to debug info
      `Hit: ${this.isHit}`,
      `Dead: ${this.isDead}`,
      `Transitioning: ${this.isTransitioning}`
    ]

    const textX = this.facingDirection === -1 ? 
      hitbox.x + hitbox.width + 5 : 
      hitbox.x - 5
    
    debugInfo.forEach((text, index) => {
      const yPos = this.y - 10 - (index * 15)
      c.strokeText(text, textX, yPos)
      c.fillText(text, textX, yPos)
    })
  }

  updateAnimation(deltaTime) {
    // Determine animation state
    if (this.isAttacking) {
      this.state = 'attack'
      
      // Update attack animation
      this.frameTimer += deltaTime
      if (this.frameTimer >= this.frameDuration) {
        this.frameTimer = 0
        this.sprites.attack.currentFrame++
        
        // Check if attack animation is complete
        if (this.sprites.attack.currentFrame >= this.sprites.attack.frameCount) {
          this.isAttacking = false
          this.sprites.attack.currentFrame = 0
        }
        return
      }
    } else if (this.velocity.y < 0) {
      this.state = 'jump'
    } else if (this.velocity.y > 0) {
      this.state = 'fall'
    } else if (this.velocity.x !== 0) {
      this.state = 'run'
    } else {
      this.state = 'idle'
    }
    
    // Update facing direction (only if not attacking)
    if (!this.isAttacking) {
      if (this.velocity.x > 0) this.facingDirection = 1
      else if (this.velocity.x < 0) this.facingDirection = -1
    }
    
    // Update animation frame
    this.frameTimer += deltaTime
    if (this.frameTimer >= this.frameDuration) {
      this.frameTimer = 0
      const sprite = this.sprites[this.state]
      if (sprite) {
        sprite.currentFrame = (sprite.currentFrame + 1) % sprite.frameCount
      }
    }
  }

  takeDamage(amount) {
    if (!this.isHit && !this.isDead) {
      this.health = Math.max(0, this.health - amount)
      this.isHit = true
      
      if (this.health === 0) {
        this.isDead = true
      }
    }
  }

  attack() {
    if (!this.isAttacking && !this.isHit && !this.isDead && !this.isTransitioning) {
      this.isAttacking = true
    }
  }

  enterDoor() {
    if (!this.isTransitioning && !this.isDead) {
      this.isTransitioning = true
      this.isEnteringDoor = true
    }
  }

  exitDoor() {
    if (!this.isTransitioning && !this.isDead) {
      this.isTransitioning = true
      this.isEnteringDoor = false
    }
  }

  // Update handleInput to include attack
  handleInput(keys) {
    // Only allow movement if not in a locked animation
    if (!this.animationLocked && !this.isDead) {
      this.velocity.x = 0
      if (keys.d.pressed) {
        this.velocity.x = X_VELOCITY
      } else if (keys.a.pressed) {
        this.velocity.x = -X_VELOCITY
      }
      
      // Handle attack input
      if (keys.space.pressed) {
        this.attack()
      }
    }
  }

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return
    
    // Update attack cooldown
    if (this.attackTimer > 0) {
      this.attackTimer = Math.max(0, this.attackTimer - deltaTime)
    }
    
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
    // Only handle movement if not attacking
    if (!this.isAttacking) {
      this.velocity.x = 0
      if (keys.d.pressed) {
        this.velocity.x = X_VELOCITY
      } else if (keys.a.pressed) {
        this.velocity.x = -X_VELOCITY
      }
    }

    // Handle attack input
    if (keys.space.pressed && this.attackTimer === 0 && !this.isAttacking) {
      this.attack()
    }
  }

  attack() {
    if (this.attackTimer === 0 && !this.isAttacking) {
      this.isAttacking = true
      this.attackTimer = this.attackCooldown
      // Reset the attack animation frame
      this.sprites.attack.currentFrame = 0
    }
  }

  getHitbox() {
    return {
      x: this.x + this.hitboxOffset.x,
      y: this.y + this.hitboxOffset.y,
      width: this.hitboxOffset.width,
      height: this.hitboxOffset.height
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
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
        if (this.velocity.x < 0) {
          const adjustedX = collisionBlock.x + collisionBlock.width + buffer
          this.x = adjustedX - this.hitboxOffset.x
          break
        }
        
        if (this.velocity.x > 0) {
          const adjustedX = collisionBlock.x - hitbox.width - buffer
          this.x = adjustedX - this.hitboxOffset.x
          break
        }
      }
    }
  }

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
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y + collisionBlock.height - this.hitboxOffset.y + buffer
          break
        }
        
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.y = collisionBlock.y - hitbox.height - this.hitboxOffset.y - buffer
          this.isOnGround = true
          break
        }
      }
    }
  }

  checkPlatformCollisions(platforms, deltaTime) {
    const buffer = 0.0001
    const hitbox = this.getHitbox()
    
    for (let platform of platforms) {
      if (
        hitbox.x + hitbox.width >= platform.x &&
        hitbox.x <= platform.x + platform.width &&
        Math.abs(hitbox.y + hitbox.height - platform.y) <= 5 &&
        this.velocity.y > 0
      ) {
        this.velocity.y = 0
        this.y = platform.y - hitbox.height - this.hitboxOffset.y - buffer
        this.isOnGround = true
        return
      }
    }
    
    if (this.velocity.y > 0 && this.isOnGround) {
      this.isOnGround = false
    }
  }
}