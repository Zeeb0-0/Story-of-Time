export class TimeManager {
    constructor() {
        this.gameStartTime = null;
        this.lastUpdate = '2025-05-02 11:38:00';
        this.isPaused = false;
        this.pauseStartTime = null;
        this.totalPausedTime = 0;
    }

    start() {
        this.gameStartTime = Date.now();
        this.lastUpdate = '2025-05-02 11:38:00';
        this.totalPausedTime = 0;
        this.isPaused = false;
    }

    pause() {
        if (!this.isPaused) {
            this.isPaused = true;
            this.pauseStartTime = Date.now();
        }
    }

    resume() {
        if (this.isPaused) {
            this.totalPausedTime += Date.now() - this.pauseStartTime;
            this.isPaused = false;
            this.pauseStartTime = null;
        }
    }

    getGameTime() {
        if (!this.gameStartTime) return 0;
        
        const currentTime = Date.now();
        const pausedTime = this.isPaused ? 
            (currentTime - this.pauseStartTime) : 0;
            
        return currentTime - this.gameStartTime - 
            this.totalPausedTime - pausedTime;
    }

    formatGameTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = (minutes % 60).toString().padStart(2, '0');
        const formattedSeconds = (seconds % 60).toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    formatSaveTimestamp() {
        return '2025-05-02 11:38:00';
    }

    getTimeDifference(timestamp1, timestamp2) {
        const date1 = new Date(timestamp1.replace(' ', 'T'));
        const date2 = new Date(timestamp2.replace(' ', 'T'));
        const diffMs = Math.abs(date2 - date1);
        
        return {
            milliseconds: diffMs,
            seconds: Math.floor(diffMs / 1000),
            minutes: Math.floor(diffMs / (1000 * 60)),
            hours: Math.floor(diffMs / (1000 * 60 * 60)),
            days: Math.floor(diffMs / (1000 * 60 * 60 * 24))
        };
    }

    formatTimeDifference(timestamp) {
        const diff = this.getTimeDifference(timestamp, '2025-05-02 11:38:00');
        
        if (diff.days > 0) return `${diff.days}d ago`;
        if (diff.hours > 0) return `${diff.hours}h ago`;
        if (diff.minutes > 0) return `${diff.minutes}m ago`;
        return 'Just now';
    }
}

export const gameTime = new TimeManager();