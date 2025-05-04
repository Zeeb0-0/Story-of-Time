class KingPig {
    constructor({ x, y, size, player }) {
      this.x = x
      this.y = y

      this.groundLeaveTime = 0  // Add this for ground state tracking
      this.isDead = false       // Make sure this exists
      
      // Original sprite dimensions
      this.frameWidth = 38  // Width of each frame
      this.frameHeight = 28 // Height of each frame
      
      // Calculate width and height to maintain aspect ratio
      this.height = size
      this.width = (this.frameWidth / this.frameHeight) * size
      
      this.velocity = {
        x: 0,
        y: 0
      }
      
      this.gravity = 580
      
      // Reference to player for AI targeting
      this.player = player
      
      // AI properties
      this.detectionRange = 200  // Distance to detect player
      this.attackRange = 50     // Distance to start attack
      this.aggroState = false   // Whether pig has seen player
      this.facingDirection = 1  // 1 for right, -1 for left
      
      // Combat properties
      this.health = 100
      this.isHit = false
      this.isDead = false
      this.isAttacking = false
      this.attackDamage = 20
      
      // Animation state
      this.state = 'idle'
      this.frameTimer = 0
      this.animationLocked = false
      
      // Define animation speeds for each state
      this.animationSpeeds = {
        idle: 0.15,
        run: 0.12,
        jump: 0.1,
        fall: 0.1,
        attack: 0.08,
        hit: 0.08,
        dead: 0.2
      }
  
      // Animation properties with frameCount
      this.sprites = {
        idle: {
          img: null,
          frameCount: 12,
          currentFrame: 0,
        },
        run: {
          img: null,
          frameCount: 6,
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
          frameCount: 5,
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
        }
      }
  
      // Hitbox for collision and combat
      const hitboxWidth = this.width * 0.6
      const hitboxHeight = this.height * 0.8
      
      this.hitboxOffset = {
        width: hitboxWidth,
        height: hitboxHeight,
        x: (this.width - hitboxWidth) / 2,
        y: this.height * 0.2
      }
  
      // Attack hitbox
      this.attackHitbox = {
        width: this.width * 0.8,
        height: this.height * 0.6,
        active: false
      }
      
      this.loadSprites()
    }
    
    async loadSprites() {
      try {
        this.sprites.idle.img = await loadImage('./images/kingPig/idle.png')
        this.sprites.run.img = await loadImage('./images/kingPig/run.png')
        this.sprites.jump.img = await loadImage('./images/kingPig/jump.png')
        this.sprites.fall.img = await loadImage('./images/kingPig/fall.png')
        this.sprites.attack.img = await loadImage('./images/kingPig/attack.png')
        this.sprites.hit.img = await loadImage('./images/kingPig/hit.png')
        this.sprites.dead.img = await loadImage('./images/kingPig/dead.png')
      } catch (error) {
        console.error('Failed to load King Pig sprites:', error)
      }
    }
  
    updateAI(deltaTime) {
        if (this.isDead) return
    
        const distanceToPlayer = Math.hypot(
            this.player.x - this.x,
            this.player.y - this.y
        )
    
        // Check if player is in detection range
        if (distanceToPlayer <= this.detectionRange) {
            this.aggroState = true
        }
    
        if (this.aggroState && !this.animationLocked) {
            this.facingDirection = this.player.x > this.x ? 1 : -1
    
            // Get vertical distance to player
            const verticalDistance = this.player.y - this.y
            const horizontalDistance = Math.abs(this.player.x - this.x)
    
            // Debug log ground state and distances
            if (window.debugMode) {
                console.log('King Pig State:', {
                    isOnGround: this.isOnGround,
                    verticalDistance,
                    horizontalDistance,
                    velocity: this.velocity,
                    blocked: this.velocity.x === 0
                })
            }
    
            // Check if we need to jump
            if (this.isOnGround) {
                // Jump if player is above and close enough horizontally
                if (verticalDistance < -50 && horizontalDistance < 150) {
                    console.log('Jumping to reach player above')
                    this.jump()
                }
                // Jump if blocked by collision and player is in range
                else if (Math.abs(this.velocity.x) < 1 && distanceToPlayer <= this.detectionRange) {
                    console.log('Jumping over obstacle')
                    this.jump()
                }
            }
    
            if (distanceToPlayer <= this.attackRange) {
                if (!this.isAttacking) {
                    this.attack()
                }
            } else {
                this.velocity.x = this.facingDirection * 80
            }
        }
    }
    
    jump() {
        if (this.isOnGround) {
            console.log('Executing jump!')
            this.velocity.y = -400
            this.isOnGround = false
            this.state = 'jump'
        } else {
            console.log('Cannot jump - not on ground')
        }
    }
  
    update(deltaTime, collisionBlocks, platforms) {
      if (this.isDead) {
          // Only update animation if dead
          this.updateAnimation(deltaTime)
          return
      }

      if (!deltaTime) return

      // Update AI behavior
      this.updateAI(deltaTime)

      // Check if we've been off ground long enough to change state
      if (!this.hasGroundContact && !this.isOnGround) {
          if (performance.now() - this.groundLeaveTime > 500) {
              this.isOnGround = false
          }
      }

      // Apply gravity if not on ground
      if (!this.isOnGround) {
          this.velocity.y += this.gravity * deltaTime
      }

      // Update position and check collisions
      this.x += this.velocity.x * deltaTime
      this.checkForHorizontalCollisions(collisionBlocks)

      this.y += this.velocity.y * deltaTime
      this.checkForVerticalCollisions(collisionBlocks)
      this.checkPlatformCollisions(platforms)

      // Cap falling speed
      this.velocity.y = Math.min(this.velocity.y, 700)

      // Update animation state
      this.updateAnimation(deltaTime)

      // Check for attack collision with player
      if (this.attackHitbox.active) {
          this.checkAttackCollision()
      }
  }

    // Also update platform collision check to set isOnGround
    checkPlatformCollisions(platforms) {
      if (!platforms) return
      
      const hitbox = this.getHitbox()
      
      for (let platform of platforms) {
          if (
              hitbox.x + hitbox.width >= platform.x &&
              hitbox.x <= platform.x + platform.width &&
              Math.abs(hitbox.y + hitbox.height - platform.y) <= 5 &&
              this.velocity.y > 0
          ) {
              this.velocity.y = 0
              this.hasGroundContact = true
              this.isOnGround = true
              this.groundLeaveTime = performance.now()
              const offset = hitbox.y - this.y
              this.y = platform.y - hitbox.height - offset
              return
          }
      }
  }
  
    updateAnimation(deltaTime) {
      const currentSpeed = this.animationSpeeds[this.state]
  
      if (this.animationLocked) {
        const currentSprite = this.sprites[this.state]
        
        this.frameTimer += deltaTime
        if (this.frameTimer >= currentSpeed) {
          this.frameTimer = 0
          currentSprite.currentFrame++
          
          if (currentSprite.currentFrame >= currentSprite.frameCount) {
            if (['hit', 'attack'].includes(this.state)) {
              this.animationLocked = false
              this.isAttacking = false
              this.attackHitbox.active = false
              currentSprite.currentFrame = 0
              this.state = 'idle'
            } else if (this.state === 'dead') {
              currentSprite.currentFrame = currentSprite.frameCount - 1
            }
          }
        }
        return
      }
  
      // Regular animation state updates
      if (this.velocity.y < 0) {
        this.state = 'jump'
      } else if (this.velocity.y > 0) {
        this.state = 'fall'
      } else if (this.velocity.x !== 0) {
        this.state = 'run'
      } else {
        this.state = 'idle'
      }
      
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
  
    attack() {
      if (!this.animationLocked) {
        this.state = 'attack'
        this.isAttacking = true
        this.animationLocked = true
        this.attackHitbox.active = true
        this.sprites.attack.currentFrame = 0
        this.velocity.x = 0  // Stop moving while attacking
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
          
          // Reset hit state after delay
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
  
    checkAttackCollision() {
      if (!this.isAttacking || this.isHit) return
      
      const attackBox = this.getAttackHitbox()
      const playerBox = this.player.getHitbox()
  
      if (
          attackBox.x < playerBox.x + playerBox.width &&
          attackBox.x + attackBox.width > playerBox.x &&
          attackBox.y < playerBox.y + playerBox.height &&
          attackBox.y + attackBox.height > playerBox.y
      ) {
          this.player.takeDamage(this.attackDamage)
      }
  }
  
    getAttackHitbox() {
      // Position attack hitbox based on facing direction
      const x = this.facingDirection === 1 
        ? this.x + this.width * 0.5
        : this.x - this.attackHitbox.width
  
      return {
        x,
        y: this.y + (this.height - this.attackHitbox.height) * 0.5,
        width: this.attackHitbox.width,
        height: this.attackHitbox.height,
        active: this.attackHitbox.active
      }
    }
  
    draw(c) {
      const sprite = this.sprites[this.state]
      
      if (sprite && sprite.img) {
        c.save()
        
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
      // Add this at the end
    this.drawHealthBar(c)
    }
  
    // ... include the same collision checking methods as Player class
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
  
      // Update the vertical collision check to properly set isOnGround
      checkForVerticalCollisions(collisionBlocks) {
        const hitbox = this.getHitbox()
        this.hasGroundContact = false  // Track physical contact
        
        for (const block of collisionBlocks) {
            if (
                hitbox.x < block.x + block.width &&
                hitbox.x + hitbox.width > block.x &&
                hitbox.y + hitbox.height > block.y &&
                hitbox.y < block.y + block.height
            ) {
                if (this.velocity.y > 0) {
                    this.velocity.y = 0
                    this.hasGroundContact = true
                    this.isOnGround = true
                    this.groundLeaveTime = performance.now()
                    const offset = hitbox.y - this.y
                    this.y = block.y - hitbox.height - offset
                } else if (this.velocity.y < 0) {
                    this.velocity.y = 0
                    const offset = hitbox.y - this.y
                    this.y = block.y + block.height - offset
                }
            }
        }
        
        if (!this.hasGroundContact && this.isOnGround) {
            this.groundLeaveTime = performance.now()
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

      drawDebugInfo(c) {
        // Draw hitbox
        c.strokeStyle = 'red'
        c.lineWidth = 2
        const hitbox = this.getHitbox()
        c.strokeRect(
            hitbox.x,
            hitbox.y,
            hitbox.width,
            hitbox.height
        )
    
        // Draw attack hitbox when active
        if (this.attackHitbox.active) {
            c.strokeStyle = 'orange'
            const attackBox = this.getAttackHitbox()
            c.strokeRect(
                attackBox.x,
                attackBox.y,
                attackBox.width,
                attackBox.height
            )
        }
    
        // Draw detection range
        c.strokeStyle = 'blue'
        c.beginPath()
        c.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.detectionRange,
            0,
            Math.PI * 2
        )
        c.stroke()
    
        // Draw attack range
        c.strokeStyle = 'red'
        c.beginPath()
        c.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.attackRange,
            0,
            Math.PI * 2
        )
        c.stroke()
    
        // Draw state text
        c.fillStyle = 'white'
        c.font = '12px Arial'
        c.fillText(
            `State: ${this.state}`,
            this.x,
            this.y - 10
        )
        c.fillText(
            `Health: ${this.health}`,
            this.x,
            this.y - 25
        )
    }
    drawHealthBar(c) {
        const healthBarWidth = 50
        const healthBarHeight = 5
        const healthPercentage = this.health / 100
    
        // Position above character
        const x = this.x + (this.width - healthBarWidth) / 2
        const y = this.y - 10
    
        // Draw background (red)
        c.fillStyle = 'red'
        c.fillRect(x, y, healthBarWidth, healthBarHeight)
    
        // Draw health (green)
        c.fillStyle = 'green'
        c.fillRect(x, y, healthBarWidth * healthPercentage, healthBarHeight)
    }
  }