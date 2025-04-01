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
                } else {
                    console.warn(`Sound not found: ${key}`);
                }
            } catch (error) {
                console.warn(`Failed to initialize sound: ${key}`, error);
            }
        };

        // Initialize sounds with error handling
        addSound('background', { loop: true, volume: 0.5 });
        addSound('crash', { volume: 0.7 });
        addSound('fail', { volume: 0.7 });
        addSound('complete', { volume: 1 });
        addSound('goal', { volume: 0.7 });  // Single goal sound
    }

    playBackground() {
        this.sounds.background.play();
    }

    stopBackground() {
        this.sounds.background.stop();
    }

    playSound(key) {
        if (this.sounds[key]) {
            try {
                console.log(`Playing sound: ${key}`);  // Debug log
                this.sounds[key].play();
            } catch (error) {
                console.warn(`Failed to play sound: ${key}`, error);
            }
        } else {
            console.warn(`Sound not found in sounds object: ${key}`);  // Debug log
            console.log('Available sounds:', Object.keys(this.sounds));  // Debug log
        }
    }

    stopAll() {
        Object.values(this.sounds).forEach(sound => sound.stop());
    }
} 