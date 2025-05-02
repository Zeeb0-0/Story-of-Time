class DebugManager {
    constructor() {
        this.enabled = true;
        this.logs = [];
        this.maxLogs = 1000;
        this.user = 'Zeeb0-0';
        
        this.performance = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            lastUpdate: '2025-05-02 11:38:00'
        };

        this._setupDebugPanel();
    }

    log(message, level = 'debug') {
        if (!this.enabled) return;

        const logEntry = {
            timestamp: '2025-05-02 11:38:00',
            level,
            message,
            user: this.user
        };

        this.logs.push(logEntry);
        this._trimLogs();
        this._updateDebugUI(logEntry);

        const style = this._getLogStyle(level);
        console.log(`%c[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`, style);
    }

    startPerformanceMonitoring() {
        if (!this.enabled) return;

        let lastTime = performance.now();
        let frames = 0;

        const monitor = () => {
            const now = performance.now();
            frames++;

            if (now >= lastTime + 1000) {
                this.performance = {
                    fps: frames,
                    frameTime: (now - lastTime) / frames,
                    memory: this._getMemoryUsage(),
                    lastUpdate: '2025-05-02 11:38:00'
                };

                this._updatePerformanceUI();
                frames = 0;
                lastTime = now;
            }

            if (this.enabled) {
                requestAnimationFrame(monitor);
            }
        };

        requestAnimationFrame(monitor);
    }

    _setupDebugPanel() {
        const panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <span>Debug Panel</span>
                <button id="debugClose">×</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                    <h3>Performance</h3>
                    <div id="debugPerformance"></div>
                </div>
                <div class="debug-section">
                    <h3>Logs</h3>
                    <div id="debugLogs"></div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this._setupStyles();
        this._setupToggle();
    }

    _setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.9);
                color: #00ff00;
                padding: 10px;
                font-family: monospace;
                z-index: 9999;
                max-width: 400px;
                max-height: 600px;
                overflow: auto;
                display: none;
            }

            .debug-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                border-bottom: 1px solid #00ff00;
            }

            #debugClose {
                background: none;
                border: none;
                color: #ff0000;
                cursor: pointer;
            }

            .debug-section {
                margin-bottom: 10px;
            }

            #debugLogs {
                max-height: 300px;
                overflow-y: auto;
            }

            .log-entry {
                margin: 2px 0;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    _setupToggle() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                const panel = document.getElementById('debug-panel');
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });

        document.getElementById('debugClose').onclick = () => {
            document.getElementById('debug-panel').style.display = 'none';
        };
    }

    _getLogStyle(level) {
        const styles = {
            error: 'color: #ff0000; font-weight: bold',
            warn: 'color: #ff9900; font-weight: bold',
            info: 'color: #00ff00',
            debug: 'color: #888888'
        };
        return styles[level] || styles.debug;
    }

    _trimLogs() {
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
    }

    _updateDebugUI(logEntry) {
        const logsContainer = document.getElementById('debugLogs');
        if (logsContainer) {
            const logElement = document.createElement('div');
            logElement.className = `log-entry log-${logEntry.level}`;
            logElement.textContent = `[${logEntry.timestamp}] ${logEntry.message}`;
            logsContainer.appendChild(logElement);
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }
    }

    _updatePerformanceUI() {
        const perfContainer = document.getElementById('debugPerformance');
        if (perfContainer) {
            perfContainer.innerHTML = `
                <div>FPS: ${this.performance.fps}</div>
                <div>Frame Time: ${this.performance.frameTime.toFixed(2)}ms</div>
                <div>Memory: ${this.performance.memory}MB</div>
                <div>Last Update: ${this.performance.lastUpdate}</div>
            `;
        }
    }

    _getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
        return 0;
    }
}

const DEBUG = new DebugManager();
export default DEBUG;