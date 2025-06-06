const X_VELOCITY = 100
const JUMP_POWER = 300
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
    
    // Add ground state buffer properties
    this.groundBufferTime = 0.5  // Time in seconds before losing ground state
    this.timeOffGround = 0      // Track how long we've been off the ground
    this.hasGroundContact = false // Actual physical ground contact this frame

    this.velocity = velocity
    this.gravity = 580 // Make sure gravity is defined
    this.isOnGround = false
    this.coyoteTimeCounter = 0
    this.COYOTE_TIME = 0.1  // Seconds of coyote time (adjust as needed) THIS IS JUST A BUFFER RAAAAA
    this.lastGroundY = y    // Track last grounded Y position
    
    // Animation state
    this.state = 'idle'
    this.frameTimer = 0

    // Define the attack hitbox
    // This hitbox is used for the attack animation
    // and is different from the main hitbox
    // The attack hitbox is smaller and only active during the attack animation
    this.attackHitbox = {
      width: this.width * 0.5,  // Half the sprite width
      height: this.height * 0.8, // 80% of sprite height
      active: false             // Only active during attack animation
    }
    // Define specific animation speeds for each state
    this.animationSpeeds = {
      idle: 0.15,      // Slower idle animation (more peaceful)
      run: 0.12,       // Slightly faster run animation
      jump: 0.1,       // Quick jump frame
      fall: 0.1,       // Quick fall frame
      attack: 0.08,    // Fast attack animation
      hit: 0.08,       // Fast hit reaction
      dead: 0.2,       // Slow death animation
      'door-in': 0.15, // Moderate door transition
      'door-out': 0.15 // Moderate door transition
    }

    // Animation properties with updated frameCount
    this.sprites = {
      idle: {
        img: null,
        frameCount: 11,
        currentFrame: 0,
      },
      run: {
        img: null,
        frameCount: 8,
        currentFrame: 0,
      },
      jump: {
        img: null,
        frameCount: 1,
        currentFrame: 0,
      },
      fall: {
        img: null,
        frameCount: 1,
        currentFrame: 0,
      },
      attack: {
        img: null,
        frameCount: 3,
        currentFrame: 0,
      },
      hit: {
        img: null,
        frameCount: 2,
        currentFrame: 0,
      },
      dead: {
        img: null,
        frameCount: 4,
        currentFrame: 0,
      },
      'door-in': {
        img: null,
        frameCount: 8,
        currentFrame: 0,
      },
      'door-out': {
        img: null,
        frameCount: 8,
        currentFrame: 0,
      }
    
      
    }

    this.health = 200
    this.isHit = false
    this.isDead = false
    this.isTransitioning = false
    this.animationLocked = false

    // Add attack-related properties
    this.isAttacking = false
    
    // Load the run spritesheet using your existing loadImage function
    this.loadSprites()
    
    // Animation state
    this.state = 'idle' // 'idle', 'run', 'jump', 'fall'
    this.frameTimer = 0
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
      this.drawHealthBar(c)
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
  
    // Draw attack hitbox if active
    if (this.attackHitbox.active) {
      const attackHitbox = this.getAttackHitbox()
      c.strokeStyle = 'red'
      c.lineWidth = 2
      c.strokeRect(
        attackHitbox.x,
        attackHitbox.y,
        attackHitbox.width,
        attackHitbox.height
      )
  
      c.fillStyle = 'rgba(255, 0, 0, 0.2)'
      c.fillRect(
        attackHitbox.x,
        attackHitbox.y,
        attackHitbox.width,
        attackHitbox.height
      )
    }
  
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
  
    // Convert world position to screen position for text
    const screenPos = camera.worldToScreen(this.x, this.y)
    
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
      `Speed: ${this.animationSpeeds[this.state]}`,
      `Frame: ${this.sprites[this.state]?.currentFrame}/${this.sprites[this.state]?.frameCount}`,
      `Attacking: ${this.isAttacking}`,
      `Attack Box: ${this.attackHitbox.active ? 'active' : 'inactive'}`,
      `Locked: ${this.animationLocked}`,
      `OnGround: ${this.isOnGround}`
    ]
  
    // Position debug text relative to screen space
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
    if (this.isDead) {
      const deadSprite = this.sprites.dead
      if (deadSprite.currentFrame < deadSprite.frameCount - 1) {
          deadSprite.currentFrame++
      }
      return
  } 
    const currentSpeed = this.animationSpeeds[this.state]

    if (this.animationLocked) {
      const currentSprite = this.sprites[this.state]
      
      this.frameTimer += deltaTime
      if (this.frameTimer >= currentSpeed) {
        this.frameTimer = 0
        currentSprite.currentFrame++
        
        if (currentSprite.currentFrame >= currentSprite.frameCount) {
          if (['hit', 'attack', 'door-in', 'door-out'].includes(this.state)) {
            this.animationLocked = false
            this.isAttacking = false
            this.attackHitbox.active = false  // Deactivate attack hitbox
            currentSprite.currentFrame = 0
            this.state = 'idle'
          } else if (this.state === 'dead') {
            currentSprite.currentFrame = currentSprite.frameCount - 1
          }
        }
        
      }
      return
    }
  
    // Regular animation state updates (when not locked)
    if (this.velocity.y < 0) {
      this.state = 'jump'
    } else if (this.velocity.y > 0) {
      this.state = 'fall'
    } else if (this.velocity.x !== 0) {
      this.state = 'run'
    } else {
      this.state = 'idle'
    }
    
    // Update facing direction (only when not locked)
    if (this.velocity.x > 0) this.facingDirection = 1
    else if (this.velocity.x < 0) this.facingDirection = -1
    
    // Update animation frame
    this.frameTimer += deltaTime
    if (this.frameTimer >= currentSpeed) {
      this.frameTimer = 0
      const sprite = this.sprites[this.state]
      if (sprite) {
        sprite.currentFrame = (sprite.currentFrame + 1) % sprite.frameCount
      }
    }
  }

  update() {
    if (this.isDead) {
        // Only update animation if dead
        this.updateAnimation()
        return
    }
  }

  takeDamage(amount) {
    if (!this.isHit && !this.isDead) {
        this.health = Math.max(0, this.health - amount)
        this.isHit = true
        this.state = 'hit'
        this.animationLocked = true
        this.sprites.hit.currentFrame = 0
        
        // Add knockback
        this.velocity.x = (this.facingDirection * -1) * 100
        this.velocity.y = -200
        
        setTimeout(() => {
            this.isHit = false
        }, 500)
        
        if (this.health === 0) {
            this.isDead = true
            this.state = 'dead'
            this.sprites.dead.currentFrame = 0
            this.velocity.x = 0  // Stop movement on death
            this.velocity.y = 0
        }
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


  getAttackHitbox() {
    // Position the attack hitbox based on facing direction
    const x = this.facingDirection === 1 
      ? this.x + this.width * 0.5  // Place on right side
      : this.x                     // Place on left side, starting from player's left edge
    
    // Center vertically relative to player
    const y = this.y + (this.height - this.attackHitbox.height) * 0.5
  
    return {
      x,
      y,
      width: this.attackHitbox.width,
      height: this.attackHitbox.height,
      active: this.attackHitbox.active
    }
  }
  
  attack() {
    if (!this.animationLocked) {
      this.state = 'attack'
      this.isAttacking = true
      this.animationLocked = true
      this.attackHitbox.active = true  // Activate attack hitbox
      this.sprites.attack.currentFrame = 0
    }
  }
  

  update(deltaTime, collisionBlocks) {
    if (!deltaTime) return

    // Store previous ground contact state
    this.hasGroundContact = false // Reset physical ground contact

    // Apply gravity if we don't have actual ground contact
    if (!this.hasGroundContact) {
      this.velocity.y += GRAVITY * deltaTime
    }

    // Update horizontal position and check collisions
    this.x += this.velocity.x * deltaTime
    this.checkForHorizontalCollisions(collisionBlocks)

    // Update vertical position and check collisions
    this.y += this.velocity.y * deltaTime
    
    // Check collisions that might set hasGroundContact to true
    this.checkForVerticalCollisions(collisionBlocks)
    this.checkPlatformCollisions(platforms)

    // Update ground state buffer
    if (this.hasGroundContact) {
      // Reset timer when we have ground contact
      this.timeOffGround = 0
      this.isOnGround = true
    } else {
      // Increment time off ground
      this.timeOffGround += deltaTime
      // Only set isOnGround to false after buffer time has elapsed
      if (this.timeOffGround >= this.groundBufferTime) {
        this.isOnGround = false
      }
    }

    // Cap falling speed
    this.velocity.y = Math.min(this.velocity.y, 700)

    // Update animation state
    this.updateAnimation(deltaTime)
  }

  checkPlatformCollisions(platforms) {
    const hitbox = this.getHitbox()
    
    for (let platform of platforms) {
      if (
        hitbox.x + hitbox.width >= platform.x &&
        hitbox.x <= platform.x + platform.width &&
        Math.abs(hitbox.y + hitbox.height - platform.y) <= 5 &&
        this.velocity.y > 0
      ) {
        this.velocity.y = 0
        this.hasGroundContact = true  // Set physical contact instead of isOnGround
        const offset = hitbox.y - this.y
        this.y = platform.y - hitbox.height - offset
        return
      }
    }
  }

  checkForVerticalCollisions(collisionBlocks) {
    const hitbox = this.getHitbox()
    
    for (const block of collisionBlocks) {
      if (
        hitbox.x < block.x + block.width &&
        hitbox.x + hitbox.width > block.x &&
        hitbox.y + hitbox.height > block.y &&
        hitbox.y < block.y + block.height
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0
          this.hasGroundContact = true  // Set physical contact instead of isOnGround
          const offset = hitbox.y - this.y
          this.y = block.y - hitbox.height - offset
        } else if (this.velocity.y < 0) {
          this.velocity.y = 0
          const offset = hitbox.y - this.y
          this.y = block.y + block.height - offset
        }
      }
    }
  }

  jump() {
    if (this.isOnGround) {
      this.velocity.y = -JUMP_POWER
      this.isOnGround = false
      this.timeOffGround = this.groundBufferTime // Force buffer to expire on jump
    }
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

  getHitbox() {
    return {
      x: this.x + this.hitboxOffset.x,
      y: this.y + this.hitboxOffset.y,
      width: this.hitboxOffset.width,
      height: this.hitboxOffset.height
    }
  }

  checkForHorizontalCollisions(collisionBlocks) {
    const hitbox = this.getHitbox()
    
    for (const block of collisionBlocks) {
      if (
        hitbox.x < block.x + block.width &&
        hitbox.x + hitbox.width > block.x &&
        hitbox.y + hitbox.height > block.y &&
        hitbox.y < block.y + block.height
      ) {
        // Moving right
        if (this.velocity.x > 0) {
          this.velocity.x = 0
          const offset = hitbox.x - this.x
          this.x = block.x - hitbox.width - offset
        }
        // Moving left
        else if (this.velocity.x < 0) {
          this.velocity.x = 0
          const offset = hitbox.x - this.x
          this.x = block.x + block.width - offset
        }
      }
    }
  }

  checkAttackCollision(enemies) {
    if (!this.isAttacking || this.isHit) return

    const attackBox = this.getAttackHitbox()
    
    enemies.forEach(enemy => {
        const enemyBox = enemy.getHitbox()
        
        if (
            attackBox.x < enemyBox.x + enemyBox.width &&
            attackBox.x + attackBox.width > enemyBox.x &&
            attackBox.y < enemyBox.y + enemyBox.height &&
            attackBox.y + attackBox.height > enemyBox.y
        ) {
            enemy.takeDamage(this.attackDamage)
        }
    })
}
  
  drawHealthBar(c) {
    const healthBarWidth = 50
    const healthBarHeight = 5
    const healthPercentage = this.health / 100

    // Position above character
    const x = this.x + (this.width - healthBarWidth) / 2
    const y = this.y + 10

    // Draw background (red)
    c.fillStyle = 'red'
    c.fillRect(x, y, healthBarWidth, healthBarHeight)

    // Draw health (green)
    c.fillStyle = 'green'
    c.fillRect(x, y, healthBarWidth * healthPercentage, healthBarHeight)
}

}