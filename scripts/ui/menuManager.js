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

        // Title Screen - Use existing element in HTML
        const titleScreen = document.getElementById('title-screen');
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

        // Game Container
        const gameContainer = document.getElementById('game-container');
        this.screens.set('game', {
            element: gameContainer,
            show: () => {
                gameContainer.style.display = 'flex';
            },
            hide: () => {
                gameContainer.style.display = 'none';
            }
        });

        // Settings Menu
        const settingsMenu = document.getElementById('settings-menu');
        this.screens.set('settings', {
            element: settingsMenu,
            show: () => {
                settingsMenu.style.display = 'flex';
            },
            hide: () => {
                settingsMenu.style.display = 'none';
            }
        });

        // Save Slots Menu
        const saveSlotsMenu = document.getElementById('save-slots-menu');
        this.screens.set('saveSlots', {
            element: saveSlotsMenu,
            show: () => {
                saveSlotsMenu.style.display = 'flex';
            },
            hide: () => {
                saveSlotsMenu.style.display = 'none';
            }
        });

        // Statistics Menu - Add this new screen
        const statisticsMenu = document.getElementById('statistics-menu');
        this.screens.set('statistics', {
            element: statisticsMenu,
            show: () => {
                statisticsMenu.style.display = 'flex';
                this.updateStatisticsDisplay();
            },
            hide: () => {
                statisticsMenu.style.display = 'none';
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
        // Use the correct IDs from the HTML
        document.getElementById('startJourney')?.addEventListener('click', () => {
            this.hideAll();
            this.screens.get('game').show();
            window.main.game.start();
            DEBUG.log('Game started from title screen', 'info');
        });

        document.getElementById('continueJourney')?.addEventListener('click', () => {
            this.switchScreen('saveSlots');
            DEBUG.log('Showing save slots for continue journey', 'info');
        });

        document.getElementById('settings')?.addEventListener('click', () => {
            this.switchScreen('settings');
            DEBUG.log('Showing settings menu', 'info');
        });

        document.getElementById('statistics')?.addEventListener('click', () => {
            this.switchScreen('statistics');
            DEBUG.log('Showing statistics screen', 'info');
        });

        // Close buttons
        document.getElementById('closeSettings')?.addEventListener('click', () => {
            this.screens.get('settings').hide();
            this.screens.get('title').show();
        });

        document.getElementById('closeSaveMenu')?.addEventListener('click', () => {
            this.screens.get('saveSlots').hide();
            this.screens.get('title').show();
        });

        // Add statistics close button handler
        document.getElementById('closeStatistics')?.addEventListener('click', () => {
            this.screens.get('statistics').hide();
            this.screens.get('title').show();
        });
    }

    // New method to update statistics display
    updateStatisticsDisplay() {
        try {
            // Get player statistics from localStorage or use default values
            const stats = this.getPlayerStatistics();
            
            // Update the statistics display
            document.getElementById('statPlayTime').textContent = this.formatTime(stats.playTime);
            document.getElementById('statLevelsCompleted').textContent = stats.levelsCompleted;
            document.getElementById('statCheckpoints').textContent = stats.checkpoints;
            document.getElementById('statJumps').textContent = stats.jumps;
            document.getElementById('statDistance').textContent = `${stats.distance} px`;
            document.getElementById('statDeaths').textContent = stats.deaths;
            document.getElementById('statCoins').textContent = stats.coins;
            document.getElementById('statPowerups').textContent = stats.powerups;
            document.getElementById('statScore').textContent = stats.score;
            
            DEBUG.log('Statistics display updated', 'info');
        } catch (error) {
            DEBUG.log(`Failed to update statistics: ${error.message}`, 'error');
        }
    }

    // Helper method to get player statistics
    getPlayerStatistics() {
        // Try to get stats from localStorage
        const statsKey = `${CONFIG.CURRENT_USER}_statistics`;
        let stats;
        
        try {
            const savedStats = localStorage.getItem(statsKey);
            if (savedStats) {
                stats = JSON.parse(savedStats);
            }
        } catch (error) {
            DEBUG.log('Failed to load statistics from localStorage', 'error');
        }
        
        // Return saved stats or default values
        return stats || {
            playTime: 0,
            levelsCompleted: 0,
            checkpoints: 0,
            jumps: 0,
            distance: 0,
            deaths: 0,
            coins: 0,
            powerups: 0,
            score: 0,
            lastUpdate: this.lastUpdate
        };
    }

    // Helper method to format time in hours, minutes, seconds
    formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return `${hours}h ${minutes}m ${seconds}s`;
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