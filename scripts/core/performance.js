import DEBUG from '../utils/debug.js';
import { CONFIG } from './config.js';

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            drawCalls: 0,
            entityCount: 0,
            lastUpdate: '2025-05-02 11:50:45'
        };

        this.samples = {
            fps: new Array(60).fill(0),
            frameTime: new Array(60).fill(0)
        };

        this.currentSample = 0;
        this.frames = 0;
        this.lastTime = performance.now();
        this.active = CONFIG.GAME.DEBUG;
    }

    startFrame() {
        this.frameStartTime = performance.now();
        this.drawCalls = 0;
    }

    endFrame() {
        if (!this.active) return;

        const now = performance.now();
        const frameTime = now - this.frameStartTime;
        this.frames++;

        // Update samples
        this.samples.frameTime[this.currentSample] = frameTime;
        
        if (now >= this.lastTime + 1000) {
            this.metrics.fps = this.frames;
            this.samples.fps[this.currentSample] = this.frames;
            this.metrics.frameTime = (now - this.lastTime) / this.frames;
            this.metrics.memory = this.getMemoryUsage();
            this.metrics.drawCalls = this.drawCalls;
            this.metrics.lastUpdate = '2025-05-02 11:50:45';

            // Log if performance is below target
            if (this.metrics.fps < CONFIG.PERFORMANCE.TARGET_FPS) {
                DEBUG.log(`Performance warning: ${this.metrics.fps} FPS`, 'warn');
            }

            this.frames = 0;
            this.lastTime = now;
            this.currentSample = (this.currentSample + 1) % 60;
        }
    }

    // Add the missing recordFrame method
    recordFrame() {
        if (!this.active) return;
        
        this.frames++;
        const now = performance.now();
        
        if (now >= this.lastTime + 1000) {
            this.metrics.fps = this.frames;
            this.samples.fps[this.currentSample] = this.frames;
            this.metrics.frameTime = (now - this.lastTime) / this.frames;
            this.metrics.memory = this.getMemoryUsage();
            this.metrics.lastUpdate = '2025-05-02 11:50:45';
            
            this.frames = 0;
            this.lastTime = now;
            this.currentSample = (this.currentSample + 1) % 60;
        }
    }

    recordDrawCall() {
        if (this.active) this.drawCalls++;
    }

    setEntityCount(count) {
        this.metrics.entityCount = count;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1048576);
        }
        return 0;
    }

    getMetrics() {
        return {
            ...this.metrics,
            averageFps: this.calculateAverage(this.samples.fps),
            averageFrameTime: this.calculateAverage(this.samples.frameTime)
        };
    }

    calculateAverage(array) {
        const sum = array.reduce((a, b) => a + b, 0);
        return sum / array.length;
    }

    enable() {
        this.active = true;
    }

    disable() {
        this.active = false;
    }
}

const performanceMonitor = new PerformanceMonitor();
export default performanceMonitor;