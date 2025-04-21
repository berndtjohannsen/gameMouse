class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.initializeSounds();
    }

    initializeSounds() {
        const addSound = (key, config) => {
            try {
                if (this.scene.cache.audio.exists(key)) {
                    this.sounds[key] = this.scene.sound.add(key, config);
                }
            } catch (error) {
                console.warn(`Failed to initialize sound: ${key}`, error);
            }
        };

        // Initialize sounds with error handling
        addSound('background', { loop: true, volume: 0.2 });
        addSound('crash', { volume: 0.7 });
        addSound('fail', { volume: 0.7 });
        addSound('complete', { volume: 1 });
        addSound('goal', { volume: 0.7 });
        addSound('engine', { loop: true, volume: 0.5 });
    }

    updateEngineSound(speed) {
        if (this.sounds.engine) {
            if (!this.sounds.engine.isPlaying) {
                this.sounds.engine.play();
            }
            const rate = 0.5 + (speed / 15) * 3.0;
            this.sounds.engine.setRate(rate);
        }
    }

    stopEngine() {
        if (this.sounds.engine) {
            this.sounds.engine.stop();
        }
    }

    playBackground() {
        this.sounds.background.play();
    }

    stopBackground() {
        this.sounds.background.stop();
    }

    playSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].play();
        }
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => sound.stop());
    }
} 