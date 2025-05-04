const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const dpr = window.devicePixelRatio || 1

canvas.width = 1024 * dpr
canvas.height = 576 * dpr

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
const blockSize = 16 // Assuming each tile is 16x16 pixels

collisions.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 1) {
      collisionBlocks.push(
        new CollisionBlock({
          x: x * blockSize,
          y: y * blockSize,
          size: blockSize,
        }),
      )
    } else if (symbol === 2) {
      platforms.push(
        new Platform({
          x: x * blockSize,
          y: y * blockSize + blockSize,
          width: 16,
          height: 4,
        }),
      )
    }
  })
})

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
  // Calculate the number of tiles per row in the tileset
  // We use Math.ceil to ensure we get a whole number of tiles
  const tilesPerRow = Math.ceil(tilesetImage.width / tileSize)

  tilesData.forEach((row, y) => {
    row.forEach((symbol, x) => {
      if (symbol !== 0) {
        // Adjust index to be 0-based for calculations
        const tileIndex = symbol - 1

        // Calculate source coordinates
        const srcX = (tileIndex % tilesPerRow) * tileSize
        const srcY = Math.floor(tileIndex / tilesPerRow) * tileSize

        context.drawImage(
          tilesetImage, // source image
          srcX,
          srcY, // source x, y
          tileSize,
          tileSize, // source width, height
          x * 16,
          y * 16, // destination x, y
          16,
          16, // destination width, height
        )
      }
    })
  })
}

const renderStaticLayers = async () => {
  console.log('Starting to render static layers');
  const offscreenCanvas = document.createElement('canvas')
  offscreenCanvas.width = canvas.width
  offscreenCanvas.height = canvas.height
  const offscreenContext = offscreenCanvas.getContext('2d')

  try {
    for (const [layerName, tilesData] of Object.entries(layersData)) {
      const tilesetInfo = tilesets[layerName]
      if (tilesetInfo) {
        console.log(`Loading image for layer ${layerName}: ${tilesetInfo.imageUrl}`);
        try {
          const tilesetImage = await loadImage(tilesetInfo.imageUrl)
          console.log(`Successfully loaded image for ${layerName}`);
          renderLayer(
            tilesData,
            tilesetImage,
            tilesetInfo.tileSize,
            offscreenContext,
          )
        } catch (error) {
          console.error(`Failed to load image for layer ${layerName}:`, error)
        }
      }
    }
    
    console.log('All static layers rendered successfully');
    return offscreenCanvas;
  } catch (error) {
    console.error('Error in renderStaticLayers:', error);
    return null;
  }
}
// END - Tile setup

// Change xy coordinates to move player's default position
const player = new Player({
  x: 100,
  y: 100,
  size: 16,
  velocity: { x: 0, y: 0 },
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
}

let lastTime = performance.now()
let animationFrameId = null
let backgroundCanvas = null

function animate() {
  // Only animate if the game is started
  if (!UI.isGameStarted) {
    cancelAnimationFrame(animationFrameId);
    return;
  }

  // Calculate delta time
  const currentTime = performance.now()
  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  // Update player position
  player.handleInput(keys)
  player.update(deltaTime, collisionBlocks)

  // Render scene
  c.save()
  c.scale(dpr, dpr)
  c.clearRect(0, 0, canvas.width, canvas.height)
  c.drawImage(backgroundCanvas, 0, 0)
  player.draw(c)
  c.restore()

  animationFrameId = requestAnimationFrame(animate)
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

