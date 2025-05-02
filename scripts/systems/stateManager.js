import DEBUG from '../utils/debug.js';

export class StateManager {
    constructor() {
        this.state = this._getInitialState();
        this.history = [];
        this.maxHistory = 10;
        this.listeners = new Set();
        this.lastUpdate = '2025-05-02 12:06:29';
    }

    _getInitialState() {
        return {
            player: {
                position: { x: 0, y: 0 },
                health: 100,
                score: 0
            },
            world: {
                level: 1,
                time: 0
            },
            settings: {
                audio: {
                    master: 1.0,
                    music: 0.7,
                    sfx: 1.0
                }
            },
            metadata: {
                user: 'Zeeb0-0',
                lastUpdate: this.lastUpdate
            }
        };
    }

    async reset() {
        try {
            this.state = this._getInitialState();
            this.history = [];
            this._notifyListeners();
            DEBUG.log('State manager reset to initial state', 'info');
        } catch (error) {
            DEBUG.log('Failed to reset state manager', 'error');
            throw error;
        }
    }

    update(newState) {
        try {
            this._addToHistory();
            this.state = {
                ...this.state,
                ...newState,
                metadata: {
                    ...this.state.metadata,
                    lastUpdate: this.lastUpdate
                }
            };
            this._notifyListeners();
        } catch (error) {
            DEBUG.log('Failed to update state', 'error');
            throw error;
        }
    }

    _addToHistory() {
        this.history.push({...this.state});
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    getState() {
        return {...this.state};
    }

    getInitialState() {
        return this._getInitialState();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    _notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
}