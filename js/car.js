class Car {
    constructor(scene) {
        this.scene = scene;
        
        // Speed parameters
        this.speed = 0;                    // Current speed of the car (pixels per frame)
        this.maxSpeed = 15;                // Maximum speed the car can reach
        this.acceleration = 2.0;           // How quickly the car speeds up
        this.deceleration = 2.5;           // How quickly the car slows down
        this.minDistance = 0.5;            // Minimum distance to cursor before car starts moving
        this.decelerationDistance = 3;     // Distance at which deceleration starts
        
        // Create car sprite
        this.sprite = scene.add.sprite(100, 550, 'car');
        this.sprite.setDisplaySize(60, 40);
        this.sprite.setOrigin(0.8, 0.5);     // Rotation point
        this.sprite.rotation = -Math.PI / 2;  // Initial rotation
        this.sprite.setDepth(2);             // Display order
        this.sprite.setVisible(true);
        
        // Create trail effect
        this.trail = scene.add.graphics();
        this.trail.setDepth(1);
        this.trail.lineStyle(2, 0x00ff00, 0.5);
        this.trail.moveTo(this.sprite.x, this.sprite.y);

        // Trail management
        this.trailPoints = [];
        this.maxTrailPoints = 50; // Reduced trail length
        this.trailUpdateFrequency = 2; // Only add trail point every N frames
        this.frameCount = 0;
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });

        // Movement parameters
        this.lastPointerX = this.sprite.x;
        this.lastPointerY = this.sprite.y;
        this.minMovementThreshold = 1; // Minimum movement distance to update position
        this.canMove = true;  // Flag to control car movement
        this.justReset = false;  // New flag to track reset state
    }

    resetPosition() {
        // Reset position
        this.sprite.x = 100;
        this.sprite.y = 550;
        this.sprite.rotation = -Math.PI / 2;
        this.sprite.setVisible(true);
        
        // Reset trail
        this.trail.clear();
        this.trailPoints = [];
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
        this.trail.moveTo(this.sprite.x, this.sprite.y);
        
        // Reset last position to match starting position
        this.lastPointerX = 100;
        this.lastPointerY = 550;
        this.frameCount = 0;
        
        // Set reset flag
        this.justReset = true;
        
        // Allow car to move again
        this.canMove = true;
    }

    stop() {
        this.canMove = false;
    }

    update() {
        if (!this.scene.gameStarted || !this.canMove) return;

        const pointer = this.scene.input.activePointer;
        
        // Get pointer position in game coordinates
        const gameX = Phaser.Math.Clamp(pointer.x, 0, this.scene.game.config.width);
        const gameY = Phaser.Math.Clamp(pointer.y, 0, this.scene.game.config.height);
        
        // Calculate movement distance
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            gameX,
            gameY
        );

        // Only update position if movement is significant
        if (distance > this.minMovementThreshold) {
            // Move car to target position
            this.sprite.x = gameX;
            this.sprite.y = gameY;
            
            // Calculate angle based on movement
            const targetAngle = Phaser.Math.Angle.Between(
                this.lastPointerX,
                this.lastPointerY,
                gameX,
                gameY
            );
            
            let currentAngle = this.sprite.rotation;
            while (currentAngle > Math.PI) currentAngle -= Math.PI * 2;
            while (currentAngle < -Math.PI) currentAngle += Math.PI * 2;
            
            let angleDiff = targetAngle - currentAngle;
            if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            const smoothingFactor = Math.min(0.15, 0.3 / (Math.abs(angleDiff) + 0.1));
            this.sprite.rotation += angleDiff * smoothingFactor;

            // Update trail less frequently
            this.frameCount++;
            if (this.frameCount >= this.trailUpdateFrequency) {
                this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
                if (this.trailPoints.length > this.maxTrailPoints) {
                    this.trailPoints.shift();
                }
                this.frameCount = 0;
            }
            
            // Update last position
            this.lastPointerX = gameX;
            this.lastPointerY = gameY;
        }
        
        // Draw trail
        this.trail.clear();
        if (this.trailPoints.length > 1) {
            this.trail.lineStyle(2, 0x00ff00, 0.5);
            this.trail.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            for (let i = 1; i < this.trailPoints.length; i++) {
                this.trail.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
            }
            this.trail.strokePath();
        }
    }
}

// Make Car available globally
if (typeof window !== 'undefined') {
    window.Car = Car;
} 