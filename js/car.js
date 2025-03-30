class Car {
    constructor(scene, x, y) {
        this.scene = scene;
        this.startX = x;
        this.startY = y;
        
        // Create single car sprite using our triangle texture
        this.sprite = scene.add.sprite(x, y, 'car');
        scene.physics.add.existing(this.sprite);
        
        this.speed = 0;
        this.maxSpeed = 300;
        this.currentDirection = 'n';
        
        this.engineSound = scene.sound.add('engine', { loop: true, volume: 0.5 });
    }

    update(cursor) {
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, 
            this.sprite.y, 
            cursor.x, 
            cursor.y
        );
        
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, 
            this.sprite.y, 
            cursor.x, 
            cursor.y
        );

        this.speed = Math.min(distance * 0.5, this.maxSpeed);
        this.updateDirection(angle);
        
        if (distance > 5) {
            this.scene.physics.moveTo(this.sprite, cursor.x, cursor.y, this.speed);
            this.updateEngineSound();
        } else {
            this.sprite.body.setVelocity(0, 0);
            this.engineSound.stop();
        }
    }

    updateDirection(angle) {
        const directions = {
            'n':  { min: -0.393, max: 0.393 },
            'ne': { min: 0.393, max: 1.178 },
            'e':  { min: 1.178, max: 1.963 },
            'se': { min: 1.963, max: 2.749 },
            's':  { min: 2.749, max: -2.749 },
            'sw': { min: -2.749, max: -1.963 },
            'w':  { min: -1.963, max: -1.178 },
            'nw': { min: -1.178, max: -0.393 }
        };

        for (const [dir, range] of Object.entries(directions)) {
            if (this.isAngleInRange(angle, range.min, range.max)) {
                if (this.currentDirection !== dir) {
                    this.currentDirection = dir;
                    this.sprite.setTexture(`car-${dir}`);
                }
                break;
            }
        }
    }

    isAngleInRange(angle, min, max) {
        if (min <= max) {
            return angle >= min && angle <= max;
        } else {
            return angle >= min || angle <= max;
        }
    }

    updateEngineSound() {
        const volume = this.speed / this.maxSpeed;
        const rate = 0.5 + (volume * 0.5);

        if (!this.engineSound.isPlaying) {
            this.engineSound.play();
        }
        
        this.engineSound.setRate(rate);
        this.engineSound.setVolume(volume);
    }

    resetPosition() {
        this.sprite.setPosition(this.startX, this.startY);
        this.sprite.body.setVelocity(0, 0);
        this.engineSound.stop();
    }

    destroy() {
        this.engineSound.stop();
        this.sprite.destroy();
    }
} 