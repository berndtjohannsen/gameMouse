class Car {
    constructor(scene) {
        this.scene = scene;
        
        // Speed parameters
        this.speed = 0;                    // Current speed of the car (pixels per frame)
        this.maxSpeed = 5;                 // Maximum speed the car can reach (pixels per frame, range: 1-10)
        this.acceleration = 0.6;           // How quickly the car speeds up (pixels per frame per frame, range: 0.1-1.0)
        this.deceleration = 1.0;           // How quickly the car slows down (pixels per frame per frame, range: 0.1-1.0)
        this.minDistance = 5;              // Minimum distance to cursor before car starts moving (pixels, range: 1-20)
        this.decelerationDistance = 50;    // Distance at which deceleration starts (pixels, range: 50-200)
        
        // Create car sprite with adjusted size and rotation
        this.sprite = scene.add.sprite(100, 550, 'car');
        this.sprite.setDisplaySize(60, 40);  // Size of the car sprite (width, height in pixels)
        this.sprite.setOrigin(0.8, 0.5);     // Rotation point (0.0-1.0, where 0.5 is center)
        this.sprite.rotation = -Math.PI / 2;  // Initial rotation (radians, -Math.PI to Math.PI)
        this.sprite.setDepth(2);             // Display order (higher = appears on top)
        
        // Create trail effect
        this.trail = scene.add.graphics();
        this.trail.setDepth(1);             // Trail display order (should be below car)
        this.trail.lineStyle(2, 0x00ff00, 0.5);  // Trail style (width in pixels, color in hex, opacity 0-1)

        // Trail management
        this.trailPoints = [];              // Array to store trail points
        this.maxTrailPoints = 100;          // Maximum number of trail points to keep
        this.lastTrailClear = 0;            // Time since last trail clear
        this.trailClearInterval = 5000;     // Clear trail every 5 seconds

        // Initialize trail with current position
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });

        // Rotation parameters
        this.targetRotation = this.sprite.rotation;  // Desired rotation angle (radians)
        this.rotationSpeed = 0.3;                    // How quickly the car turns (multiplier, range: 0.1-0.5)
        this.maxRotationPerFrame = 0.4;              // Maximum rotation per frame (radians, range: 0.1-1.0)
        this.currentRotationSpeed = 0;               // Current rotation speed (radians per frame)
        this.rotationAcceleration = 0.15;            // How quickly rotation speed increases (radians per frame per frame, range: 0.1-0.5)
        this.rotationDeceleration = 1.0;             // How quickly rotation speed decreases (radians per frame per frame, range: 0.5-2.0)
        this.minRotationDiff = 0.2;                  // Minimum rotation difference to start accelerating (degrees, range: 0.1-1.0)
        this.lastPointerX = 0;                       // Last pointer X position (pixels)
        this.lastPointerY = 0;                       // Last pointer Y position (pixels)
    }

    resetPosition() {
        this.sprite.x = 100;
        this.sprite.y = 550;
        this.sprite.rotation = -Math.PI / 2;  // Reset rotation to point upward
        this.targetRotation = this.sprite.rotation;
        this.speed = 0;
        this.currentRotationSpeed = 0;
        this.clearTrail();
    }

    clearTrail() {
        this.trail.clear();
        this.trailPoints = [];
        // Initialize trail with current position
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
        this.lastTrailClear = 0;
    }

    update() {
        // Get current time for trail management
        const currentTime = this.scene.time.now;

        // Clear trail periodically
        if (currentTime - this.lastTrailClear > this.trailClearInterval) {
            this.clearTrail();
        }

        // Get cursor position
        const pointer = this.scene.input.activePointer;
        
        // Check if mouse has moved
        const mouseMoved = (pointer.x !== this.lastPointerX) || (pointer.y !== this.lastPointerY);
        this.lastPointerX = pointer.x;
        this.lastPointerY = pointer.y;
        
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

        // Update target rotation
        this.targetRotation = angleToCursor;
        let rotationDiff = Phaser.Math.Angle.ShortestBetween(
            this.sprite.rotation * (180 / Math.PI),  // Convert current rotation to degrees
            this.targetRotation * (180 / Math.PI)    // Convert target rotation to degrees
        );

        // Handle rotation speed changes
        if (Math.abs(rotationDiff) > this.minRotationDiff) {  // If there's significant rotation needed
            // Accelerate rotation speed based on how far we need to turn
            const rotationFactor = Math.min(Math.abs(rotationDiff) / 180, 1);
            this.currentRotationSpeed = Math.min(
                this.currentRotationSpeed + (this.rotationAcceleration * rotationFactor),
                this.maxRotationPerFrame
            );
        } else {
            // Decelerate rotation speed more aggressively when close to target
            const decelFactor = Math.min(Math.abs(rotationDiff) / this.minRotationDiff, 1);
            this.currentRotationSpeed = Math.max(
                0,
                this.currentRotationSpeed - (this.rotationDeceleration * decelFactor)
            );
        }

        // If mouse hasn't moved, apply extra deceleration
        if (!mouseMoved) {
            this.currentRotationSpeed = Math.max(0, this.currentRotationSpeed - this.rotationDeceleration * 2);
        }

        // Limit rotation speed (in degrees)
        rotationDiff = Phaser.Math.Clamp(
            rotationDiff,
            -this.currentRotationSpeed * 180 / Math.PI,
            this.currentRotationSpeed * 180 / Math.PI
        );

        // Apply rotation (convert back to radians)
        this.sprite.rotation += (rotationDiff * Math.PI / 180) * this.rotationSpeed;

        // Handle speed changes
        if (distance > this.minDistance) {
            // Calculate angle between car's current direction and direction to cursor
            const currentAngle = this.sprite.rotation;
            const angleDiff = Math.abs(Phaser.Math.Angle.ShortestBetween(currentAngle, angleToCursor));
            
            // Calculate target speed based on distance and angle
            let targetSpeed = this.maxSpeed;
            
            // Reduce target speed based on distance
            if (distance < this.decelerationDistance) {
                const distanceFactor = distance / this.decelerationDistance;
                targetSpeed *= distanceFactor;
            }
            
            // Reduce target speed based on angle difference
            if (angleDiff > Math.PI / 4) {  // More than 45 degrees difference
                const angleFactor = 1 - (angleDiff / Math.PI);
                targetSpeed *= Math.max(0, angleFactor);
            }
            
            // Smoothly adjust current speed towards target speed
            if (this.speed < targetSpeed) {
                this.speed = Math.min(this.speed + this.acceleration, targetSpeed);
            } else {
                // Decelerate based on current speed rather than distance
                const speedFactor = this.speed / this.maxSpeed;
                this.speed = Math.max(this.speed - (this.deceleration * speedFactor), targetSpeed);
            }
        } else {
            // Smoothly stop when very close to cursor
            const speedFactor = this.speed / this.maxSpeed;
            this.speed = Math.max(0, this.speed - (this.deceleration * speedFactor));
        }
        
        // Move the car if it has any speed
        if (this.speed > 0) {
            // Calculate movement vector
            const moveX = Math.cos(this.sprite.rotation) * this.speed;
            const moveY = Math.sin(this.sprite.rotation) * this.speed;

            // Normalize the movement vector to ensure consistent speed in all directions
            const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
            const normalizedX = moveX / magnitude;
            const normalizedY = moveY / magnitude;

            // Apply normalized movement
            this.sprite.x += normalizedX * this.speed;
            this.sprite.y += normalizedY * this.speed;

            // Keep car within bounds
            this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 30, this.scene.cameras.main.width - 30);
            this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 30, this.scene.cameras.main.height - 30);
        }

        // Always add trail point
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }

        // Always redraw trail
        this.trail.clear();
        if (this.trailPoints.length > 1) {
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