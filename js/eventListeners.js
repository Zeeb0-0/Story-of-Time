// Game controls event listeners
window.addEventListener('keydown', (event) => {
  // Only process game controls if the game is active
  if (UI && UI.isGameStarted) {
    switch (event.key) {
      case 'w':
      case 'ArrowUp':
        player.jump()
        keys.w.pressed = true
        break
      case 'a':
      case 'ArrowLeft':
        keys.a.pressed = true
        break
      case 'd':
      case 'ArrowRight':
        keys.d.pressed = true
        break
      case 'Escape':
        UI.handleEscape()
        break
    }
  } else {
    // Menu navigation
    switch (event.key) {
      case 'Escape':
        if (UI) UI.handleEscape()
        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  // Only process game controls if the game is active
  if (UI && UI.isGameStarted) {
    switch (event.key) {
      case 'a':
      case 'ArrowLeft':
        keys.a.pressed = false
        break
      case 'd':
      case 'ArrowRight':
        keys.d.pressed = false
        break
    }
  }
})

// On return to game's tab, ensure delta time is reset
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastTime = performance.now()
    
    // If the game was active, update the lastPlayed timestamp
    if (UI && UI.isGameStarted) {
      gameState.updateLastPlayed()
      gameState.updateUI()
    }
  }
})