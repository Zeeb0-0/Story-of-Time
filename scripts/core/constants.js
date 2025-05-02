export const CONSTANTS = {
    VERSION: '1.0.0',
    BUILD_TIME: '2025-05-02 11:50:45',
    USER: 'Zeeb0-0',

    EVENTS: {
        GAME_START: 'game:start',
        GAME_PAUSE: 'game:pause',
        GAME_RESUME: 'game:resume',
        GAME_OVER: 'game:over',
        LEVEL_START: 'level:start',
        LEVEL_COMPLETE: 'level:complete',
        CHECKPOINT_REACHED: 'checkpoint:reached',
        PLAYER_DAMAGE: 'player:damage',
        PLAYER_DEATH: 'player:death',
        SCORE_UPDATE: 'score:update',
        SAVE_GAME: 'save:game',
        LOAD_GAME: 'save:load'
    },

    LAYERS: {
        BACKGROUND: 0,
        TERRAIN: 1,
        ENTITIES: 2,
        PLAYER: 3,
        PARTICLES: 4,
        UI: 5
    },

    COLLISIONS: {
        NONE: 0,
        SOLID: 1,
        TRIGGER: 2,
        PLAYER: 4,
        ENEMY: 8,
        PICKUP: 16
    },

    GAME_STATES: {
        LOADING: 'loading',
        TITLE: 'title',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'gameOver'
    },

    DIRECTIONS: {
        NONE: 0,
        UP: 1,
        RIGHT: 2,
        DOWN: 4,
        LEFT: 8
    },

    ANIMATIONS: {
        IDLE: 'idle',
        WALK: 'walk',
        JUMP: 'jump',
        FALL: 'fall',
        ATTACK: 'attack'
    },

    PICKUPS: {
        HEALTH: 'health',
        COIN: 'coin',
        KEY: 'key',
        POWERUP: 'powerup'
    },

    DIFFICULTIES: {
        EASY: { id: 'easy', multiplier: 0.5 },
        NORMAL: { id: 'normal', multiplier: 1.0 },
        HARD: { id: 'hard', multiplier: 2.0 }
    }
};