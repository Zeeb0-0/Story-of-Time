import DEBUG from '../utils/debug.js';
import { CONFIG } from '../core/config.js';

export class UIManager {
    constructor() {
        this.screens = new Map();
        this.currentScreen = null;
        this.isInitialized = false;
        this.lastUpdate = '2025-05-02 13:57:32';
        this.user = 'Zeeb0-0';
    }

    async initialize() {
        try {
            this.createScreens();
            this.bindEvents();
            this.isInitialized = true;
            DEBUG.log('UI Manager initialized', 'info');
        } catch (error) {
            DEBUG.log('UI Manager initialization failed', 'error');
            throw error;
        }
    }

    createScreens() {
        // Loading Screen
        this.screens.set('loading', {
            element: document.getElementById('loading-screen'),
            show: () => {
                this.screens.get('loading').element.style.display = 'flex';
            },
            hide: () => {
                this.screens.get('loading').element.style.display = 'none';
            }
        });

        // Title Screen
        const titleScreen = document.createElement('div');
        titleScreen.id = 'title-screen';
        titleScreen.innerHTML = `
            <div class="title-content">
                <h1>Game Title</h1>
                <div class="menu-buttons">
                    <button id="startGame">Start Game</button>
                    <button id="options">Options</button>
                </div>
            </div>
        `;
        document.body.appendChild(titleScreen);
        this.screens.set('title', {
            element: titleScreen,
            show: () => {
                titleScreen.style.display = 'flex';
                this.bindMenuButtons();
            },
            hide: () => {
                titleScreen.style.display = 'none';
            }
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => this.handleResize());
        
        // Debug menu toggle
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                this.toggleDebugMenu();
            }
        });
    }

    bindMenuButtons() {
        document.getElementById('startGame')?.addEventListener('click', () => {
            this.hideAll();
            window.main.game.start();
        });

        document.getElementById('options')?.addEventListener('click', () => {
            this.showOptions();
        });
    }

    handleResize() {
        // Update UI elements positioning if needed
        if (this.currentScreen) {
            const element = this.screens.get(this.currentScreen).element;
            if (element) {
                // Adjust element size/position based on window size
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                // Add specific resize logic here
            }
        }
    }

    async showLoadingScreen() {
        await this.switchScreen('loading');
    }

    async hideLoadingScreen() {
        const loadingScreen = this.screens.get('loading');
        if (loadingScreen) {
            loadingScreen.hide();
        }
    }

    async showTitleScreen() {
        await this.switchScreen('title');
    }

    async showDebugInterface() {
        const debugInterface = document.createElement('div');
        debugInterface.className = 'debug-interface';
        debugInterface.innerHTML = `
            <div class="debug-panel">
                <h3>Debug Mode</h3>
                <p>Assets skipped. Using fallback graphics.</p>
                <div class="debug-info">
                    <p>Last Update: ${this.lastUpdate}</p>
                    <p>User: ${this.user}</p>
                </div>
                <div class="debug-controls">
                    <button onclick="window.location.reload()">Reload Game</button>
                    <button onclick="window.main.game.start()">Start Game</button>
                    <button onclick="DEBUG.toggle()">Toggle Debug</button>
                </div>
            </div>
        `;
        document.body.appendChild(debugInterface);
        
        // Show performance monitor in debug mode
        this.showPerformanceMonitor();
    }

    showPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.className = 'performance-monitor';
        document.body.appendChild(monitor);

        setInterval(() => {
            if (window.main?.game?.isRunning) {
                const fps = Math.round(1000 / window.main.game.timestep);
                monitor.textContent = `FPS: ${fps} | Memory: ${this.getMemoryUsage()}MB`;
            }
        }, 1000);
    }

    getMemoryUsage() {
        return Math.round(performance.memory?.usedJSHeapSize / 1048576) || 0;
    }

    async switchScreen(screenName) {
        if (this.currentScreen) {
            const currentScreenObj = this.screens.get(this.currentScreen);
            if (currentScreenObj) {
                currentScreenObj.hide();
            }
        }

        const newScreenObj = this.screens.get(screenName);
        if (newScreenObj) {
            newScreenObj.show();
            this.currentScreen = screenName;
        }
    }

    hideAll() {
        for (const [_, screen] of this.screens) {
            screen.hide();
        }
    }

    showMessage(message, type = 'info', duration = 3000) {
        const messageElement = document.createElement('div');
        messageElement.className = `game-message ${type}`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, duration);
    }

    toggleDebugMenu() {
        const debugMenu = document.querySelector('.debug-interface');
        if (debugMenu) {
            debugMenu.style.display = debugMenu.style.display === 'none' ? 'block' : 'none';
        }
    }
}