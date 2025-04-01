class Car {
    constructor(scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        
        // Create car sprite with adjusted size and rotation
        this.sprite = scene.add.sprite(100, 550, 'car');
        this.sprite.setDisplaySize(60, 40);  // Adjust these values based on your needs
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.rotation = -Math.PI / 2;  // Rotate 90 degrees counterclockwise so car points up
        this.sprite.setDepth(2);  // Set car to appear above goals and obstacles
        
        // Create trail effect
        this.trail = scene.add.graphics();
        this.trail.setDepth(1);  // Trail should be above background but below everything else
        this.trail.lineStyle(2, 0x00ff00, 0.5);
        this.trail.moveTo(this.sprite.x, this.sprite.y);
    }

    resetPosition() {
        this.sprite.x = 100;
        this.sprite.y = 550;
        this.sprite.rotation = -Math.PI / 2;  // Reset rotation to point upward
        this.speed = 0;
        this.trail.clear();
        this.trail.moveTo(this.sprite.x, this.sprite.y);
    }

    update() {
        // Get cursor position
        const pointer = this.scene.input.activePointer;
        
        // Calculate angle to cursor
        const angleToCursor = Phaser.Math.Angle.Between(
            this.sprite.x, 
            this.sprite.y,
            pointer.x, 
            pointer.y
        );
        
        // Calculate distance to cursor
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            pointer.x,
            pointer.y
        );

        // Update speed based on distance
        if (distance > 5) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            this.speed = Math.max(0, this.speed - this.deceleration);
        }

        // Calculate movement based on angle and speed
        const moveX = Math.cos(angleToCursor) * this.speed;
        const moveY = Math.sin(angleToCursor) * this.speed;

        // Update position
        this.sprite.x += moveX;
        this.sprite.y += moveY;

        // Keep car within bounds
        this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 30, this.scene.cameras.main.width - 30);
        this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 30, this.scene.cameras.main.height - 30);

        // Update rotation (add offset since our sprite points right by default)
        this.sprite.rotation = angleToCursor;

        // Update trail
        if (this.speed > 0) {
            this.trail.lineTo(this.sprite.x, this.sprite.y);
            this.trail.strokePath();
        } else {
            this.trail.clear();
            this.trail.moveTo(this.sprite.x, this.sprite.y);
        }
    }
}

// Make Car available globally
if (typeof window !== 'undefined') {
    window.Car = Car;
} 