// Car physics & appearance
const CAR_START_X = 100;
const CAR_START_Y = 550;
const CAR_DISPLAY_WIDTH = 60;
const CAR_DISPLAY_HEIGHT = 40;
const CAR_ROTATION_ORIGIN_X = 0.8;
const CAR_ROTATION_ORIGIN_Y = 0.5;
const CAR_INITIAL_ROTATION = -Math.PI / 2; // -90 degrees
const CAR_DEPTH = 2;

// Movement parameters
const MAX_SPEED = 15;
const ACCELERATION_FACTOR = 2.0; // (Note: current code doesn't actually use this as traditional acceleration)
const DECELERATION_FACTOR = 2.5; // (Note: current code doesn't actually use this as traditional deceleration)
const MIN_CURSOR_DISTANCE_MOVE = 0.5;
const DECELERATION_DISTANCE_START = 3; // (Note: current code doesn't actually use this as traditional deceleration)
const MIN_MOVEMENT_THRESHOLD = 1; // Minimum pointer distance change to update car position
const CURSOR_TO_SPEED_DIVISOR = 10;
const ROTATION_SMOOTHING_MAX = 0.15;
const ROTATION_SMOOTHING_NUMERATOR = 0.3;
const ROTATION_SMOOTHING_DENOMINATOR_ADDEND = 0.1;


// Trail
const TRAIL_LINE_WIDTH = 2;
const TRAIL_LINE_COLOR = 0x00ff00;
const TRAIL_LINE_ALPHA = 0.5;
const MAX_TRAIL_POINTS = 50;
const TRAIL_UPDATE_FREQUENCY_FRAMES = 2; // Add point every N frames
const TRAIL_DEPTH = 1;

class Car {
    constructor(scene) {
        this.scene = scene;
        
        // Speed parameters
        this.speed = 0;                    // Current speed of the car (pixels per frame)
        this.maxSpeed = MAX_SPEED;                // Maximum speed the car can reach
        this.acceleration = ACCELERATION_FACTOR;           // How quickly the car speeds up
        this.deceleration = DECELERATION_FACTOR;           // How quickly the car slows down
        this.minDistance = MIN_CURSOR_DISTANCE_MOVE;            // Minimum distance to cursor before car starts moving
        this.decelerationDistance = DECELERATION_DISTANCE_START;     // Distance at which deceleration starts
        
        // Create car sprite
        this.sprite = scene.add.sprite(CAR_START_X, CAR_START_Y, 'car');
        this.sprite.setDisplaySize(CAR_DISPLAY_WIDTH, CAR_DISPLAY_HEIGHT);
        this.sprite.setOrigin(CAR_ROTATION_ORIGIN_X, CAR_ROTATION_ORIGIN_Y);     // Rotation point
        this.sprite.rotation = CAR_INITIAL_ROTATION;  // Initial rotation
        this.sprite.setDepth(CAR_DEPTH);             // Display order
        this.sprite.setVisible(true);
        
        // Create trail effect
        this.trail = scene.add.graphics();
        this.trail.setDepth(TRAIL_DEPTH);
        this.trail.lineStyle(TRAIL_LINE_WIDTH, TRAIL_LINE_COLOR, TRAIL_LINE_ALPHA);
        this.trail.moveTo(this.sprite.x, this.sprite.y);

        // Trail management
        this.trailPoints = [];
        this.maxTrailPoints = MAX_TRAIL_POINTS; // Reduced trail length
        this.trailUpdateFrequency = TRAIL_UPDATE_FREQUENCY_FRAMES; // Only add trail point every N frames
        this.frameCount = 0;
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });

        // Movement parameters
        this.lastPointerX = this.sprite.x;
        this.lastPointerY = this.sprite.y;
        this.minMovementThreshold = MIN_MOVEMENT_THRESHOLD; // Minimum movement distance to update position
        this.canMove = true;  // Flag to control car movement
        this.justReset = false;  // New flag to track reset state
    }

    update() {
        if (!this.scene.gameStarted || !this.canMove) {
            this.scene.soundManager.stopEngine();
            return;
        }

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

        // Calculate speed based on distance
        this.speed = Math.min(distance / CURSOR_TO_SPEED_DIVISOR, this.maxSpeed);
        
        // Update engine sound based on speed
        this.scene.soundManager.updateEngineSound(this.speed);

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
            
            const smoothingFactor = Math.min(ROTATION_SMOOTHING_MAX, ROTATION_SMOOTHING_NUMERATOR / (Math.abs(angleDiff) + ROTATION_SMOOTHING_DENOMINATOR_ADDEND));
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
            this.trail.lineStyle(TRAIL_LINE_WIDTH, TRAIL_LINE_COLOR, TRAIL_LINE_ALPHA);
            this.trail.moveTo(this.trailPoints[0].x, this.trailPoints[0].y);
            for (let i = 1; i < this.trailPoints.length; i++) {
                this.trail.lineTo(this.trailPoints[i].x, this.trailPoints[i].y);
            }
            this.trail.strokePath();
        }
    }

    stop() {
        this.canMove = false;
        this.scene.soundManager.stopEngine();
    }

    resetPosition() {
        // Reset position
        this.sprite.x = CAR_START_X;
        this.sprite.y = CAR_START_Y;
        this.sprite.rotation = CAR_INITIAL_ROTATION;
        this.sprite.setVisible(true);
        
        // Reset trail
        this.trail.clear();
        this.trailPoints = [];
        this.trailPoints.push({ x: this.sprite.x, y: this.sprite.y });
        this.trail.moveTo(this.sprite.x, this.sprite.y);
        
        // Reset last position to match starting position
        this.lastPointerX = CAR_START_X;
        this.lastPointerY = CAR_START_Y;
        this.frameCount = 0;
        
        // Set reset flag
        this.justReset = true;
        
        // Allow car to move again
        this.canMove = true;
    }
}

// Make Car available globally
if (typeof window !== 'undefined') {
    window.Car = Car;
} 