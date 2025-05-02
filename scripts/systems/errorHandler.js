import DEBUG from '../utils/debug.js';

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.recoveryStrategies = new Map();
        
        this._initializeRecoveryStrategies();
    }

    handleError(error, context, recoveryData = {}) {
        const errorEntry = {
            timestamp: '2025-05-02 11:44:28',
            context,
            message: error.message,
            stack: error.stack,
            user: 'Zeeb0-0'
        };

        this.errors.push(errorEntry);
        this._trimErrors();
        DEBUG.log(`Error in ${context}: ${error.message}`, 'error');

        return this._attemptRecovery(context, error, recoveryData);
    }

    _initializeRecoveryStrategies() {
        this.recoveryStrategies.set('save', async (error, data) => {
            DEBUG.log('Attempting save recovery...', 'info');
            try {
                // Attempt to create backup save
                if (data.gameState) {
                    const backupKey = `backup_${Date.now()}`;
                    localStorage.setItem(backupKey, JSON.stringify(data.gameState));
                    return { success: true, backupKey };
                }
            } catch (recoveryError) {
                DEBUG.log('Save recovery failed', 'error');
                return { success: false, error: recoveryError };
            }
        });

        this.recoveryStrategies.set('state', async (error, data) => {
            DEBUG.log('Attempting state recovery...', 'info');
            try {
                // Attempt to restore last known good state
                if (data.lastGoodState) {
                    return { success: true, state: data.lastGoodState };
                }
                return { success: false, error: new Error('No recovery state available') };
            } catch (recoveryError) {
                return { success: false, error: recoveryError };
            }
        });

        // Add more recovery strategies as needed
    }

    async _attemptRecovery(context, error, recoveryData) {
        const strategy = this.recoveryStrategies.get(context);
        
        if (strategy) {
            try {
                const result = await strategy(error, recoveryData);
                if (result.success) {
                    DEBUG.log(`Recovery successful for ${context}`, 'info');
                    return result;
                }
            } catch (recoveryError) {
                DEBUG.log(`Recovery failed for ${context}`, 'error');
            }
        }

        return { success: false, error };
    }

    _trimErrors() {
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }
    }

    getErrors() {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
    }
}