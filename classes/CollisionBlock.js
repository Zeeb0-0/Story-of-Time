class CollisionBlock {
  constructor({ x, y, size }) {
    this.x = x
    this.y = y
    this.width = size
    this.height = size
  }

  draw(c) {
    if (window.debugMode) {
      c.strokeStyle = 'rgba(255, 0, 0, 0.5)'
      c.lineWidth = 1
      c.strokeRect(this.x, this.y, this.width, this.height)
    }
  }
}