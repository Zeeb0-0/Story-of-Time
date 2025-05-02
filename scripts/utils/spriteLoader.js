import DEBUG from './debug.js';
import assetManager from '../core/assetManager.js';

export class SpriteLoader {
    constructor() {
        this.sprites = new Map();
        this.animations = new Map();
        this.metadata = {
            lastUpdate: '2025-05-02 13:28:46',
            user: 'Zeeb0-0'
        };
    }

    async loadSprite(name, jsonPath, imagePath) {
        try {
            // Load both the JSON data and the spritesheet image
            const [data, image] = await Promise.all([
                fetch(jsonPath).then(response => response.json()),
                this._loadImage(imagePath)
            ]);

            // Process sprite data
            const spriteData = {
                name,
                image,
                frames: new Map(),
                animations: new Map(),
                metadata: {
                    ...data.meta,
                    lastUpdate: this.metadata.lastUpdate,
                    user: this.metadata.user
                }
            };

            // Process frames
            data.frames.forEach((frame, index) => {
                spriteData.frames.set(frame.filename, {
                    index,
                    ...frame.frame,
                    duration: frame.duration
                });
            });

            // Process animations from frameTags
            data.meta.frameTags.forEach(tag => {
                if (!spriteData.animations.has(tag.name)) {
                    spriteData.animations.set(tag.name, {
                        name: tag.name,
                        from: tag.from,
                        to: tag.to,
                        direction: tag.direction,
                        frames: this._getFramesForTag(data.frames, tag)
                    });
                }
            });

            this.sprites.set(name, spriteData);
            DEBUG.log(`Loaded sprite: ${name}`, 'info');
            return spriteData;

        } catch (error) {
            DEBUG.log(`Failed to load sprite: ${name}`, 'error');
            throw error;
        }
    }

    _loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    _getFramesForTag(frames, tag) {
        const animationFrames = [];
        for (let i = tag.from; i <= tag.to; i++) {
            const frame = frames[i];
            if (frame) {
                animationFrames.push({
                    index: i,
                    ...frame.frame,
                    duration: frame.duration
                });
            }
        }
        return animationFrames;
    }

    getSprite(name) {
        return this.sprites.get(name);
    }

    getAnimation(spriteName, animationName) {
        const sprite = this.sprites.get(spriteName);
        if (!sprite) return null;
        return sprite.animations.get(animationName);
    }
}

// Create singleton instance
const spriteLoader = new SpriteLoader();
export default spriteLoader;