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
            // Use assetManager's loadSprite method to load the sprite
            const spriteData = await assetManager.loadSprite(name, jsonPath, imagePath);
            
            // Process sprite data
            const processedSprite = {
                name,
                image: spriteData.image,
                frames: new Map(),
                animations: new Map(),
                metadata: {
                    ...spriteData.data.meta,
                    lastUpdate: this.metadata.lastUpdate,
                    user: this.metadata.user
                }
            };

            // Process frames
            spriteData.data.frames.forEach((frame, index) => {
                processedSprite.frames.set(frame.filename, {
                    index,
                    ...frame.frame,
                    duration: frame.duration
                });
            });

            // Process animations from frameTags
            if (spriteData.data.meta && spriteData.data.meta.frameTags) {
                spriteData.data.meta.frameTags.forEach(tag => {
                    if (!processedSprite.animations.has(tag.name)) {
                        processedSprite.animations.set(tag.name, {
                            name: tag.name,
                            from: tag.from,
                            to: tag.to,
                            direction: tag.direction,
                            frames: this._getFramesForTag(spriteData.data.frames, tag)
                        });
                    }
                });
            }

            this.sprites.set(name, processedSprite);
            DEBUG.log(`Loaded sprite: ${name}`, 'info');
            return processedSprite;

        } catch (error) {
            DEBUG.log(`Failed to load sprite: ${name} - ${error.message}`, 'error');
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