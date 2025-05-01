// Game constants and configurations
// Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Initialize game objects
        this.player = new Player(50, 300);
        this.platforms = [
            new Platform(0, this.canvas.height - 40, this.canvas.width, 40), // Ground
            new Platform(300, 400, 200, 20),
            new Platform(100, 300, 200, 20),
            new Platform(500, 200, 200, 20),
        ];
        
        // Game state
        this.score = 0;
        this.gameTime = 0;
        this.lastTime = 0;
        this.gameRunning = false;  // Start paused

        // Start game loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    setupCanvas() {
        // Set canvas size based on window size
        this.canvas.width = 800;
        this.canvas.height = 600;
    }

    update(deltaTime) {
        if (!this.gameRunning) return;

        // Update player
        this.player.update(deltaTime, this.platforms);
        
        // Update game time
        this.gameTime += deltaTime;
        
        // Update UI
        this.updateUI();
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background (gradient)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000428');
        gradient.addColorStop(1, '#004e92');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx));
        
        // Draw player
        this.player.draw(this.ctx);
    }

    updateUI() {
        // Update score and time display
        document.getElementById('score').textContent = `Score: ${this.score}`;
        const gameTimeSeconds = Math.floor(this.gameTime / 1000);
        document.querySelector('.ui-element:nth-child(2)').textContent = 
            `Time: ${Math.floor(gameTimeSeconds / 60)}:${(gameTimeSeconds % 60).toString().padStart(2, '0')}`;
    }

    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameRunning) {
            this.update(deltaTime);
        }
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}