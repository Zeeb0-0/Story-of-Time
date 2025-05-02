import { CompressionUtil } from '../utils/compression.js';
import DEBUG from '../utils/debug.js';

export class SaveSystem {
    constructor() {
        this.maxSlots = 5;
        this.currentUser = 'Zeeb0-0';
        this.autoSaveInterval = 300000; // 5 minutes
        this.autoSaveTimer = null;
    }

    async initialize() {
        try {
            this.loadSaveMetadata();
            this.startAutoSave();
            DEBUG.log('Save system initialized', 'info');
        } catch (error) {
            DEBUG.log('Save system initialization failed', 'error');
            throw error;
        }
    }

    async createSave(slotId, gameState) {
        const saveData = {
            id: slotId,
            user: this.currentUser,
            timestamp: '2025-05-02 11:44:28',
            gameState
        };

        try {
            const compressed = await CompressionUtil.compressSaveData(saveData);
            localStorage.setItem(this._getSaveKey(slotId), compressed);
            this.updateSaveMetadata(slotId, saveData);
            DEBUG.log(`Save created in slot ${slotId}`, 'info');
            return saveData;
        } catch (error) {
            DEBUG.log(`Save creation failed for slot ${slotId}`, 'error');
            throw error;
        }
    }

    async loadSave(slotId) {
        try {
            const compressed = localStorage.getItem(this._getSaveKey(slotId));
            if (!compressed) {
                throw new Error('Save not found');
            }

            const saveData = await CompressionUtil.decompressSaveData(compressed);
            DEBUG.log(`Save loaded from slot ${slotId}`, 'info');
            return saveData;
        } catch (error) {
            DEBUG.log(`Save loading failed for slot ${slotId}`, 'error');
            throw error;
        }
    }

    async autoSave(gameState) {
        try {
            const autoSaveSlot = this.maxSlots - 1; // Use last slot for auto-save
            await this.createSave(autoSaveSlot, gameState);
            DEBUG.log('Auto-save complete', 'info');
        } catch (error) {
            DEBUG.log('Auto-save failed', 'error');
        }
    }

    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        this.autoSaveTimer = setInterval(() => {
            const event = new CustomEvent('autosave-triggered');
            window.dispatchEvent(event);
        }, this.autoSaveInterval);
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    _getSaveKey(slotId) {
        return `${this.currentUser}_save_${slotId}`;
    }

    loadSaveMetadata() {
        const metadataKey = `${this.currentUser}_saves_metadata`;
        const metadata = localStorage.getItem(metadataKey);
        if (metadata) {
            return JSON.parse(metadata);
        }
        return this._createDefaultMetadata();
    }

    updateSaveMetadata(slotId, saveData) {
        const metadata = this.loadSaveMetadata();
        metadata.slots[slotId] = {
            id: slotId,
            timestamp: saveData.timestamp,
            user: saveData.user
        };
        localStorage.setItem(`${this.currentUser}_saves_metadata`, JSON.stringify(metadata));
    }

    _createDefaultMetadata() {
        return {
            slots: Array(this.maxSlots).fill(null).map((_, index) => ({
                id: index,
                isEmpty: true
            }))
        };
    }
}