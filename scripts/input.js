const keys = {};

// Key event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Add touch controls for mobile devices
function setupTouchControls() {
    const leftBtn = document.createElement('button');
    const rightBtn = document.createElement('button');
    const jumpBtn = document.createElement('button');

    [leftBtn, rightBtn, jumpBtn].forEach(btn => {
        btn.className = 'touch-control';
        document.querySelector('.game-controls').appendChild(btn);
    });

    leftBtn.textContent = '←';
    rightBtn.textContent = '→';
    jumpBtn.textContent = 'Jump';

    // Touch event handlers
    leftBtn.addEventListener('touchstart', () => keys['ArrowLeft'] = true);
    leftBtn.addEventListener('touchend', () => keys['ArrowLeft'] = false);
    
    rightBtn.addEventListener('touchstart', () => keys['ArrowRight'] = true);
    rightBtn.addEventListener('touchend', () => keys['ArrowRight'] = false);
    
    jumpBtn.addEventListener('touchstart', () => keys[' '] = true);
    jumpBtn.addEventListener('touchend', () => keys[' '] = false);
}