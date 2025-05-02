import { UIManager } from './ui/menuManager.js';
import { SaveSystem } from './systems/saveSystem.js';
import { AudioSystem } from './systems/audioSystem.js';
import { StateManager } from './systems/stateManager.js';
import { ErrorHandler } from './systems/errorHandler.js';
import { Game } from './game/Game.js';
import DEBUG from './utils/debug.js';
import performanceMonitor from './core/performance.js';
import assetManager from './core/assetManager.js';
import spriteLoader from './utils/spriteLoader.js';
import { CONFIG } from './core/config.js';
import { CONSTANTS } from './core/constants.js';

class Main {
    constructor() {
        this.settings = {
            currentUser: 'Zeeb0-0',
            debug: true,
            skipAssetLoading: false,
            defaultVolume: {
                master: 1.0,
                music: 0.7,
                sfx: 1.0
            }
        };

        // Initialize core systems
        this.errorHandler = new ErrorHandler();
        this.stateManager = new StateManager();
        this.saveSystem = new SaveSystem(this.settings.currentUser);
        this.audioSystem = new AudioSystem();
        this.uiManager = new UIManager();
        this.game = new Game();
        
        this.lastUpdate = '2025-05-02 13:51:40';
        this.isInitialized = false;

        // Bind error handling
        window.onerror = (msg, src, line, col, error) => {
            this.errorHandler.handleError(error || new Error(msg), 'global');
            return false;
        };
    }

    async initialize() {
        try {
            DEBUG.log('Initializing game systems...', 'info');
            performanceMonitor.startFrame();

            // Initialize systems in order
            await this._initializeSubsystems();

            // Load initial assets if not skipping
            if (!this.settings.skipAssetLoading) {
                await this._loadInitialAssets();
            }

            // Setup event listeners
            this._setupEventListeners();

            // Hide loading screen and show title
            await this.uiManager.hideLoadingScreen();
            await this.uiManager.showTitleScreen();

            this.isInitialized = true;
            DEBUG.log('Game initialization complete', 'info');
            performanceMonitor.enable();
            
        } catch (error) {
            DEBUG.log(`Initialization failed: ${error.message}`, 'error');
            this.errorHandler.handleError(error, 'initialization');
            this._handleInitializationError(error);
        }
    }

    async _initializeSubsystems() {
        try {
            // Initialize basic systems first
            await Promise.all([
                this.errorHandler.initialize?.(),
                this.stateManager.reset(),
                this.audioSystem.initialize()
            ]);

            // Then initialize dependent systems
            await Promise.all([
                this.saveSystem.initialize(),
                this.uiManager.initialize(),
                this.game.initialize()
            ]);

        } catch (error) {
            DEBUG.log('Failed to initialize subsystems', 'error');
            throw error;
        }
    }

    async _loadInitialAssets() {
        try {
            await spriteLoader.loadSprite(
                'kingHuman',
                './assets/images/sprites/player/Player.json',
                './assets/images/sprites/player/Player.png'
            );

            const playerSprite = spriteLoader.getSprite('kingHuman');
            if (playerSprite) {
                this.game.player.loadSprite(playerSprite.image);
                this.game.player.spawn();
            }

            DEBUG.log('Initial assets loaded successfully', 'info');
        } catch (error) {
            DEBUG.log(`Failed to load initial assets: ${error.message}`, 'error');
            throw error;
        }
    }

    _setupEventListeners() {
        // Game state events
        window.addEventListener('stateUpdate', (e) => {
            this.stateManager.update(e.detail);
        });

        // Performance monitoring
        if (CONFIG.GAME.DEBUG) {
            window.addEventListener('gameLoop', () => {
                performanceMonitor.recordFrame();
            });
        }

        // Window events
        window.addEventListener('resize', () => {
            this.uiManager.handleResize();
        });

        // Debug keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                switch(e.key.toLowerCase()) {
                    case 'd':
                        DEBUG.toggle();
                        break;
                    case 'r':
                        this.skipAndContinue();
                        break;
                }
            }
        });
    }

    _handleInitializationError(error) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="error-message">
                    <h2>Failed to Load Game</h2>
                    <p>Please try refreshing the page or continue in debug mode.</p>
                    <p class="error-details">${error.message}</p>
                    <div class="error-buttons">
                        <button onclick="window.location.reload()">Refresh Page</button>
                        <button onclick="window.main.skipAndContinue()">Skip & Continue (Debug)</button>
                    </div>
                </div>
            `;
        }
        console.error('Initialization Error:', error);
    }

    async skipAndContinue() {
        try {
            DEBUG.log('Skipping asset loading and continuing in debug mode...', 'warn');
            this.settings.skipAssetLoading = true;
            
            // Reset systems
            await this._initializeSubsystems();
            
            // Setup minimal game state
            this.game.setupDebugState();
            
            // Show debug interface
            await this.uiManager.hideLoadingScreen();
            await this.uiManager.showDebugInterface();
            
            this.isInitialized = true;
            performanceMonitor.enable();
            
        } catch (error) {
            DEBUG.log(`Failed to continue in debug mode: ${error.message}`, 'error');
        }
    }

    getState() {
        return {
            isInitialized: this.isInitialized,
            lastUpdate: this.lastUpdate,
            currentUser: this.settings.currentUser,
            debug: this.settings.debug,
            skipAssetLoading: this.settings.skipAssetLoading
        };
    }
}

// Create and expose the main instance globally
const main = new Main();
window.main = main;

// Start the game
main.initialize().catch(error => {
    console.error('Failed to start game:', error);
    main._handleInitializationError(error);
});

export default main;