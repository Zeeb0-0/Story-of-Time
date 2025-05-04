class Camera {
    constructor(width, height, levelWidth, levelHeight) {
      this.x = 0
      this.y = 0
      this.width = width
      this.height = height
      this.levelWidth = levelWidth
      this.levelHeight = levelHeight
      
      // Camera smoothing/lerp factor (0 = no smoothing, 1 = instant)
      this.smoothing = 0.1
    }
  
    follow(target) {
      // Calculate desired camera position (centered on target)
      const desiredX = target.x + target.width / 2 - this.width / 2
      const desiredY = target.y + target.height / 2 - this.height / 2
      
      // Smoothly move camera toward target
      this.x += (desiredX - this.x) * this.smoothing
      this.y += (desiredY - this.y) * this.smoothing
      
      // Clamp camera to level bounds
      this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.width))
      this.y = Math.max(0, Math.min(this.y, this.levelHeight - this.height))
    }
  
    apply(c) {
      c.save()
      c.translate(-Math.floor(this.x), -Math.floor(this.y))
    }
  
    restore(c) {
      c.restore()
    }
  
    worldToScreen(x, y) {
      return {
        x: x - this.x,
        y: y - this.y
      }
    }
  
    screenToWorld(x, y) {
      return {
        x: x + this.x,
        y: y + this.y
      }
    }
  }