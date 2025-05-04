const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1
const CANVAS_WIDTH = 1024
const CANVAS_HEIGHT = 576
const LEVEL_WIDTH = 2000
const LEVEL_HEIGHT = 1000

// Set up canvas with correct sizing
canvas.width = CANVAS_WIDTH * dpr
canvas.height = CANVAS_HEIGHT * dpr
canvas.style.width = `${CANVAS_WIDTH}px`
canvas.style.height = `${CANVAS_HEIGHT}px`

// Initialize camera with logical dimensions
const camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT, LEVEL_WIDTH, LEVEL_HEIGHT)

// Initially hide the canvas until game starts
canvas.style.display = 'none';

const layersData = {
   l_New_Layer_1: l_New_Layer_1,
   l_New_Layer_2: l_New_Layer_2,
   l_New_Layer_3: l_New_Layer_3,
   l_New_Layer_4: l_New_Layer_4,
   l_New_Layer_5: l_New_Layer_5,
   l_New_Layer_6: l_New_Layer_6,
   l_New_Layer_7: l_New_Layer_7,
   l_New_Layer_8: l_New_Layer_8,
   l_New_Layer_9: l_New_Layer_9,
};

const tilesets = {
  l_New_Layer_1: { imageUrl: './images/terrain.png', tileSize: 32 },
  l_New_Layer_2: { imageUrl: './images/terrain.png', tileSize: 32 },
  l_New_Layer_3: { imageUrl: './images/terrain.png', tileSize: 32 },
  l_New_Layer_4: { imageUrl: './images/decorations.png', tileSize: 32 },
  l_New_Layer_5: { imageUrl: './images/decorations.png', tileSize: 32 },
  l_New_Layer_6: { imageUrl: './images/decorations.png', tileSize: 32 },
  l_New_Layer_7: { imageUrl: './images/decorations.png', tileSize: 32 },
  l_New_Layer_8: { imageUrl: './images/decorations.png', tileSize: 32 },
  l_New_Layer_9: { imageUrl: './images/decorations.png', tileSize: 32 },
};


// Tile setup
const collisionBlocks = []
const platforms = []
const TILE_SIZE = 32;
const blockSize = TILE_SIZE; // Assuming each tile is 32x32 pixels

// Debug setup
window.debugMode = false;

// Update collision block creation
collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
          size: TILE_SIZE,
        })
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * TILE_SIZE,
          y: (y+1) * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE / 4,
        })
      )
    }
  })
})

// Update renderLayer to handle tile positioning correctly
const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize)

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        const tileIndex = symbol - 1
        const srcX = (tileIndex % tilesPerRow) * tileSize
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize
        
        context.drawImage(
          tilesetImage,
          srcX, srcY,
          tileSize, tileSize,
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE, TILE_SIZE
        )
      }
    })
  })
}

const renderStaticLayers = async () => {
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = CANVAS_WIDTH * 5
  offscreenCanvas.height = CANVAS_HEIGHT
  const offscreenContext = offscreenCanvas.getContext('2d')

  try {
    for (const [layerName, tilesData] of Object.entries(layersData)) {
      const tilesetInfo = tilesets[layerName]
      if (tilesetInfo) {
        try {
          const tilesetImage = await loadImage(tilesetInfo.imageUrl)
          renderLayer(
            tilesData,
            tilesetImage,
            tilesetInfo.tileSize,
            offscreenContext
          )
        } catch (error) {
          console.error(`Failed to load image for layer ${layerName}:`, error)
        }
      }
    }
    return offscreenCanvas
  } catch (error) {
    console.error('Error in renderStaticLayers:', error)
    return null
  }
}
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 70,
  y: 250,
  size: TILE_SIZE * 2,
  velocity: { x: 0, y: 0 },
})

// Add King Pig right after player creation
const kingPig = new KingPig({
  x: 1650,
  y: 240,
  size: TILE_SIZE,
  player: player  // Pass the player instance we just created
})

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  space: {  // Add this
    pressed: false
  }
}

// Add space key to your event listeners
addEventListener('keydown', ({ code }) => {
  switch (code) {
    case 'KeyW':
      player.jump()  // The jump method will check isOnGround internally
      break
    case 'KeyD':
      keys.d.pressed = true
      break
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'Space':  // Add this
      keys.space.pressed = true
      break
  }
})

addEventListener('keyup', ({ code }) => {
  switch (code) {
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'Space':  // Add this
      keys.space.pressed = false
      player.canAttack = true  // Allow new attacks when space is released
      break
  }
})

let lastTime = performance.now()
let animationFrameId = null
let backgroundCanvas = null

function animate() {
  const now = performance.now()
  const deltaTime = (now - lastTime) / 1000
  lastTime = now
  
  // Clear canvas and setup scaling
  c.save()
  c.scale(dpr, dpr)
  
  // Fill background with correct color
  c.fillStyle = '#3f3851' // Changed from sky blue to #3f3851
  c.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  
  // Apply camera transform
  camera.apply(c)
  
  // Draw background layers
  if (backgroundCanvas) {
    c.drawImage(backgroundCanvas, 0, 0)
  }
  
  // Draw collision blocks and platforms in debug mode
  if (window.debugMode) {
    collisionBlocks.forEach(block => {
      block.draw(c)
    })
    
    platforms.forEach(platform => {
      platform.draw(c)
    })
  }
  
  player.checkAttackCollision([kingPig]) // Pass kingPig as enemy
  
  // Add King Pig update and draw here
  kingPig.update(deltaTime, collisionBlocks, platforms)
  kingPig.draw(c)

  // Update and draw player
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)
  player.draw(c)
  
  // Update and restore camera
  camera.follow(player)
  camera.restore(c)
  
  // Draw UI elements
  if (window.debugMode) {
    drawDebugOverlay(c, deltaTime)
  }
  
  // Restore initial transform
  c.restore()
  
  animationFrameId = requestAnimationFrame(animate)
}

// Update debug overlay function to accept deltaTime
function drawDebugOverlay(c, deltaTime) {
  c.font = '16px monospace'
  c.fillStyle = 'black'
  c.strokeStyle = 'white'
  c.lineWidth = 3
  
  const debugInfo = [
    `FPS: ${Math.round(1 / deltaTime)}`,
    `Debug Mode: ${window.debugMode ? 'ON' : 'OFF'}`,
    `Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)})`,
    `Player World Pos: (${Math.round(player.x)}, ${Math.round(player.y)})`
  ]
  
  debugInfo.forEach((text, i) => {
    const x = 10
    const y = 20 + (i * 20)
    c.strokeText(text, x, y)
    c.fillText(text, x, y)
  })
}

// Function to start the game loop (called by UI system)
function startGameLoop() {
  console.log('Starting game loop, backgroundCanvas exists:', !!backgroundCanvas);
  
  const startGame = () => {
    console.log('Showing canvas and starting animation');
    // Show the canvas when game starts
    canvas.style.display = 'block';
    
    // Re-render the initial frame to ensure the map is displayed
    c.save();
    c.scale(dpr, dpr);
    c.clearRect(0, 0, canvas.width, canvas.height);
    
    if (backgroundCanvas) {
      c.drawImage(backgroundCanvas, 0, 0);
      console.log('Drew background canvas to main canvas');
    } else {
      console.error('Background canvas is null when trying to draw');
    }
    
    player.draw(c);
    c.restore();
    
    // Reset time and start animation
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(animate);
  };
  
  if (backgroundCanvas) {
    startGame();
  } else {
    console.log('Background canvas not ready, preparing game first');
    // If backgroundCanvas isn't loaded yet, prepare the game first
    prepareGame().then((success) => {
      console.log('Game preparation complete, success:', success);
      if (success) {
        startGame();
      }
    }).catch(err => {
      console.error('Error preparing game:', err);
    });
  }
}

// Function to stop the game loop (called by UI system)
function stopGameLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    // Hide the canvas when returning to menu
    canvas.style.display = 'none';
  }
}

// Prepare the game and start when needed
const prepareGame = async () => {
  try {
    if (!backgroundCanvas) {
      backgroundCanvas = await renderStaticLayers();
      if (!backgroundCanvas) {
        console.error('Failed to create the background canvas');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error during game preparation:', error);
    return false;
  }
}

// Initialize game assets but don't start animation yet - wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing game assets');
  prepareGame();
  
  // Expose functions to the UI system - make sure UI is defined first
  if (typeof UI !== 'undefined') {
    console.log('UI object found, integrating with game');
    
    // Override UI.startGame
    const originalStartGame = UI.startGame;
    UI.startGame = function() {
      console.log('Start Journey clicked');
      originalStartGame.call(UI);
      startGameLoop();
    };
    
    // Override UI.continueGame
    const originalContinueGame = UI.continueGame;
    UI.continueGame = function(saveIndex) {
      console.log('Continue game from save slot', saveIndex);
      const result = originalContinueGame.call(UI, saveIndex);
      if (result) {
        startGameLoop();
      }
      return result;
    };
    
    // Override UI.showMenu  
    const originalShowMenu = UI.showMenu;
    UI.showMenu = function() {
      console.log('Showing menu');
      originalShowMenu.call(UI);
      stopGameLoop();
      gameState.saveToLocalStorage();
    };
  } else {
    console.warn('UI object not found, menu integration not possible');
  }
});

