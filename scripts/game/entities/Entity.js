export class Entity {
    constructor(x = 0, y = 0) {
        this.id = `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.size = { width: 32, height: 32 };
        this.isActive = true;
        this.tags = new Set();
        this.collisionMask = 0xFFFFFFFF;
        this.lastUpdate = '2025-05-02 11:50:45';
    }

    update(deltaTime) {
        // Update velocity based on acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;

        // Update position based on velocity
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        this.lastUpdate = '2025-05-02 11:50:45';
    }

    render(ctx) {
        // Default rendering - override in child classes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
            this.position.x,
            this.position.y,
            this.size.width,
            this.size.height
        );
    }

    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.size.width,
            height: this.size.height
        };
    }

    collidesWith(other) {
        if (!(this.isActive && other.isActive)) return false;
        if (!(this.collisionMask & other.collisionMask)) return false;

        const bounds1 = this.getBounds();
        const bounds2 = other.getBounds();

        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }

    addTag(tag) {
        this.tags.add(tag);
    }

    removeTag(tag) {
        this.tags.delete(tag);
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }

    getState() {
        return {
            id: this.id,
            position: { ...this.position },
            velocity: { ...this.velocity },
            acceleration: { ...this.acceleration },
            size: { ...this.size },
            isActive: this.isActive,
            tags: Array.from(this.tags),
            collisionMask: this.collisionMask,
            lastUpdate: this.lastUpdate
        };
    }

    setState(state) {
        Object.assign(this, state);
        this.tags = new Set(state.tags);
    }
}