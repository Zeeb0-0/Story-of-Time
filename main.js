// Import all necessary files
import { Player } from './classes/Player.js'
import { Platform } from './classes/Platform.js'
import { CollisionBlock } from './classes/CollisionBlock.js'
import { Camera } from './classes/Camera.js'
import { initEventListeners } from './js/eventListeners.js'
import { drawUI } from './js/ui.js'
import { gameState } from './js/gameState.js'
import { map1 } from './data/map1/map1.js'
import { map2 } from './data/map2/map2.js'
import { map3 } from './data/map3/map3.js'

// Each map file would look like this:
class Game {
    constructor() {
      this.canvas = document.querySelector('canvas');
      this.c = this.canvas.getContext('2d');
      
      this.mapLoader = new MapLoader(this);
      this.player = new Player({
        game: this,
        x: 0,
        y: 0
      });
      
      this.camera = new Camera(this);
      this.entities = new Set();
      
      this.init();
    }
  
    async init() {
      // Load initial map
      await this.mapLoader.loadMap('map1');
      
      // Start game loop
      this.gameLoop();
    }
  
    gameLoop() {
      // Clear canvas
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Update camera
      this.camera.update();
      
      // Update and draw all entities
      this.entities.forEach(entity => {
        entity.update();
        entity.draw();
      });
      
      // Update and draw player
      this.player.update();
      this.player.draw();
      
      requestAnimationFrame(() => this.gameLoop());
    }
  }