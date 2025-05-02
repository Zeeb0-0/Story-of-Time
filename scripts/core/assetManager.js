import DEBUG from '../utils/debug.js';

class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loadingPromises = new Map();
        this.loadedAt = '2025-05-02 11:50:45';
        this.user = 'Zeeb0-0';
        
        // Asset categories
        this.images = new Map();
        this.audio = new Map();
        this.data = new Map();
    }

    async loadImage(key, src) {
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
    
        const loadPromise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                this.loadingPromises.delete(key);
                DEBUG.log(`Successfully loaded image: ${key}`, 'info');
                resolve(img);
            };
            
            img.onerror = () => {
                this.loadingPromises.delete(key);
                const error = new Error(`Failed to load image: ${src}`);
                DEBUG.log(error.message, 'error');
                reject(error);
            };
            
            // Add timestamp to prevent caching
            img.src = `${src}?t=${Date.now()}`;
        });
    
        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }

    async loadAudio(key, src) {
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
    
        const loadPromise = new Promise((resolve, reject) => {
            const audio = new Audio();
            
            audio.oncanplaythrough = () => {
                this.audio.set(key, audio);
                this.loadingPromises.delete(key);
                DEBUG.log(`Successfully loaded audio: ${key}`, 'info');
                resolve(audio);
            };
            
            audio.onerror = () => {
                this.loadingPromises.delete(key);
                const error = new Error(`Failed to load audio: ${src}`);
                DEBUG.log(error.message, 'error');
                reject(error);
            };
            
            // Add timestamp to prevent caching
            audio.src = `${src}?t=${Date.now()}`;
        });
    
        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }

    async loadJSON(key, src) {
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        const loadPromise = fetch(src)
            .then(response => response.json())
            .then(data => {
                this.data.set(key, data);
                this.loadingPromises.delete(key);
                return data;
            })
            .catch(error => {
                this.loadingPromises.delete(key);
                throw new Error(`Failed to load JSON: ${src}`);
            });

        this.loadingPromises.set(key, loadPromise);
        return loadPromise;
    }

    async loadAll(assets) {
        const promises = [];
        const startTime = performance.now();

        for (const [key, asset] of Object.entries(assets)) {
            switch (asset.type) {
                case 'image':
                    promises.push(this.loadImage(key, asset.src));
                    break;
                case 'audio':
                    promises.push(this.loadAudio(key, asset.src));
                    break;
                case 'json':
                    promises.push(this.loadJSON(key, asset.src));
                    break;
            }
        }

        try {
            await Promise.all(promises);
            const loadTime = performance.now() - startTime;
            DEBUG.log(`All assets loaded in ${loadTime.toFixed(2)}ms`, 'info');
        } catch (error) {
            DEBUG.log('Failed to load all assets', 'error');
            throw error;
        }
    }

    getImage(key) {
        return this.images.get(key);
    }

    getAudio(key) {
        return this.audio.get(key);
    }

    getData(key) {
        return this.data.get(key);
    }

    unload(key) {
        this.images.delete(key);
        this.audio.delete(key);
        this.data.delete(key);
        this.assets.delete(key);
    }

    clear() {
        this.images.clear();
        this.audio.clear();
        this.data.clear();
        this.assets.clear();
        this.loadingPromises.clear();
    }

    getLoadingProgress() {
        const total = this.assets.size;
        const loaded = total - this.loadingPromises.size;
        return {
            loaded,
            total,
            progress: total > 0 ? (loaded / total) * 100 : 100
        };
    }
}

const assetManager = new AssetManager();
export default assetManager;