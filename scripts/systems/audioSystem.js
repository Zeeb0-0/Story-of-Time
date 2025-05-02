import DEBUG from '../utils/debug.js';
import { CONFIG } from '../core/config.js';
import assetManager from '../core/assetManager.js';

export class AudioSystem {
    constructor() {
        this.initialized = false;
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.sounds = new Map();
        this.music = new Map();
        this.activeMusic = null;
        this.activeSounds = new Set();
        
        this.volumes = {
            master: CONFIG.AUDIO.DEFAULT_VOLUME,
            music: CONFIG.AUDIO.DEFAULT_VOLUME,
            sfx: CONFIG.AUDIO.DEFAULT_VOLUME
        };

        this.metadata = {
            lastUpdate: '2025-05-02 11:59:07',
            user: 'Zeeb0-0'
        };
    }

    async initialize() {
        try {
            // Create AudioContext
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes
            this.masterGain = this.context.createGain();
            this.musicGain = this.context.createGain();
            this.sfxGain = this.context.createGain();

            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.context.destination);

            // Set initial volumes
            this.setVolume('master', this.volumes.master);
            this.setVolume('music', this.volumes.music);
            this.setVolume('sfx', this.volumes.sfx);

            this.initialized = true;
            DEBUG.log('Audio system initialized', 'info');
        } catch (error) {
            DEBUG.log('Failed to initialize audio system', 'error');
            throw error;
        }
    }

    async loadSound(key, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.sounds.set(key, audioBuffer);
            DEBUG.log(`Loaded sound: ${key}`, 'info');
        } catch (error) {
            DEBUG.log(`Failed to load sound: ${key}`, 'error');
            throw error;
        }
    }

    async loadMusic(key, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
            
            this.music.set(key, audioBuffer);
            DEBUG.log(`Loaded music: ${key}`, 'info');
        } catch (error) {
            DEBUG.log(`Failed to load music: ${key}`, 'error');
            throw error;
        }
    }

    playSound(key, options = {}) {
        if (!this.initialized || !this.sounds.has(key)) return null;

        try {
            const source = this.context.createBufferSource();
            source.buffer = this.sounds.get(key);

            // Create gain node for this specific sound
            const gainNode = this.context.createGain();
            gainNode.connect(this.sfxGain);
            source.connect(gainNode);

            // Apply options
            source.loop = options.loop || false;
            gainNode.gain.value = options.volume || 1;

            // Start playback
            source.start(0);

            // Track active sounds
            const soundInstance = { source, gainNode, key };
            this.activeSounds.add(soundInstance);

            // Clean up when sound ends
            source.onended = () => {
                this.activeSounds.delete(soundInstance);
            };

            return soundInstance;
        } catch (error) {
            DEBUG.log(`Failed to play sound: ${key}`, 'error');
            return null;
        }
    }

    async playMusic(key, options = {}) {
        if (!this.initialized || !this.music.has(key)) return;

        try {
            // Stop current music with fadeout
            if (this.activeMusic) {
                await this.stopMusic(true);
            }

            const source = this.context.createBufferSource();
            source.buffer = this.music.get(key);

            const gainNode = this.context.createGain();
            gainNode.connect(this.musicGain);
            source.connect(gainNode);

            // Apply options
            source.loop = options.loop !== false; // Music loops by default
            gainNode.gain.value = 0; // Start at 0 for fade-in

            // Start playback
            source.start(0);

            // Fade in
            const fadeTime = options.fadeTime || CONFIG.AUDIO.MUSIC_FADE_TIME;
            gainNode.gain.linearRampToValueAtTime(
                1,
                this.context.currentTime + fadeTime / 1000
            );

            this.activeMusic = { source, gainNode, key };
        } catch (error) {
            DEBUG.log(`Failed to play music: ${key}`, 'error');
        }
    }

    async stopMusic(fadeOut = true) {
        if (!this.activeMusic) return;

        try {
            if (fadeOut) {
                // Fade out
                const fadeTime = CONFIG.AUDIO.MUSIC_FADE_TIME;
                this.activeMusic.gainNode.gain.linearRampToValueAtTime(
                    0,
                    this.context.currentTime + fadeTime / 1000
                );

                // Stop after fade
                await new Promise(resolve => setTimeout(resolve, fadeTime));
            }

            this.activeMusic.source.stop();
            this.activeMusic = null;
        } catch (error) {
            DEBUG.log('Failed to stop music', 'error');
        }
    }

    setVolume(channel, value) {
        if (!this.initialized) return;

        try {
            value = Math.max(0, Math.min(1, value));
            this.volumes[channel] = value;

            switch (channel) {
                case 'master':
                    this.masterGain.gain.value = value;
                    break;
                case 'music':
                    this.musicGain.gain.value = value;
                    break;
                case 'sfx':
                    this.sfxGain.gain.value = value;
                    break;
            }

            DEBUG.log(`Set ${channel} volume to ${value}`, 'info');
        } catch (error) {
            DEBUG.log(`Failed to set ${channel} volume`, 'error');
        }
    }

    stopSound(soundInstance) {
        if (!soundInstance) return;

        try {
            soundInstance.source.stop();
            this.activeSounds.delete(soundInstance);
        } catch (error) {
            DEBUG.log('Failed to stop sound', 'error');
        }
    }

    stopAllSounds() {
        for (const sound of this.activeSounds) {
            this.stopSound(sound);
        }
        this.activeSounds.clear();
    }

    pauseAll() {
        if (!this.initialized) return;
        this.context.suspend();
    }

    resumeAll() {
        if (!this.initialized) return;
        this.context.resume();
    }

    getState() {
        return {
            volumes: { ...this.volumes },
            metadata: { ...this.metadata }
        };
    }

    setState(state) {
        if (state.volumes) {
            Object.entries(state.volumes).forEach(([channel, value]) => {
                this.setVolume(channel, value);
            });
        }
    }

    cleanup() {
        this.stopAllSounds();
        this.stopMusic(false);
        if (this.context) {
            this.context.close();
        }
        this.initialized = false;
    }
}