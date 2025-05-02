export const CONFIG = {
    CURRENT_USER: 'Zeeb0-0',
    CURRENT_TIMESTAMP: '2025-05-02 11:50:45',
    
    GAME: {
        WIDTH: 800,
        HEIGHT: 600,
        FPS: 60,
        TIMESTEP: 1000 / 60,
        DEBUG: true
    },

    PHYSICS: {
        GRAVITY: 980,
        MAX_VELOCITY: 1000,
        FRICTION: 0.8,
        AIR_RESISTANCE: 0.99
    },

    PLAYER: {
        SPEED: 300,
        JUMP_FORCE: 600,
        MAX_HEALTH: 100,
        INVINCIBILITY_TIME: 2000
    },

    AUDIO: {
        DEFAULT_VOLUME: 0.7,
        MUSIC_FADE_TIME: 1000,
        MAX_SOUNDS: 8
    },

    SAVE: {
        MAX_SLOTS: 5,
        AUTOSAVE_INTERVAL: 300000,
        COMPRESS_SAVES: true
    },

    PERFORMANCE: {
        TARGET_FPS: 60,
        FRAME_BUDGET: 16,
        CULLING_DISTANCE: 1000,
        MAX_PARTICLES: 1000
    },

    UI: {
        FONT_FAMILY: '"Press Start 2P", monospace',
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000
    },

    STORAGE_KEYS: {
        SAVE_PREFIX: 'Zeeb0-0_save_',
        SETTINGS: 'Zeeb0-0_settings',
        HIGH_SCORES: 'Zeeb0-0_scores'
    }
};