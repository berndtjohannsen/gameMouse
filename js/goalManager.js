// Goal and Obstacle constants
const GOAL_SIZE = 40;
const GOAL_DEPTH = 1;
const MAX_GOALS = 10;

const OBSTACLE_SIZE = 50;
const OBSTACLE_DEPTH = 1;
const MAX_OBSTACLES = 4;

const PLACEMENT_MARGIN = 50;
const MIN_DISTANCE_BETWEEN_OBJECTS = 80;
const MAX_PLACEMENT_ATTEMPTS = 100;

const COLLISION_RADIUS_DIVISOR = 1.5;

const CAR_START_X_NO_COLLISION = 100;
const CAR_START_Y_NO_COLLISION = 550;


class GoalManager {
    constructor(scene) {
        this.scene = scene;
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
        this.soundManager = new SoundManager(scene);
    }

    reset() {
        // Remove all existing goals and obstacles
        this.goals.forEach(goal => goal.destroy());
        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
    }

    createGoals() {
        // Create goals with random positions
        for (let i = 1; i <= MAX_GOALS; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            // Keep trying until we find a valid position or max attempts reached
            while (!validPosition && attempts < MAX_PLACEMENT_ATTEMPTS) {
                attempts++;
                // Generate random position within bounds
                x = PLACEMENT_MARGIN + Math.random() * (this.scene.game.config.width - 2 * PLACEMENT_MARGIN);
                y = PLACEMENT_MARGIN + Math.random() * (this.scene.game.config.height - 2 * PLACEMENT_MARGIN);
                
                // Check if this position is valid (not overlapping with existing objects)
                validPosition = this.isPositionValid(x, y, MIN_DISTANCE_BETWEEN_OBJECTS);
            }
            
            if (validPosition) {
                const goal = this.scene.add.image(x, y, `goal${i}`);
                goal.setDisplaySize(GOAL_SIZE, GOAL_SIZE);
                goal.setDepth(GOAL_DEPTH);
                goal.number = i;
                
                // Add hit area for better collision detection
                goal.setInteractive({ pixelPerfect: true });
                
                this.goals.push(goal);
            }
        }
    }

    createObstacles() {
        // Create obstacles with random positions
        for (let i = 1; i <= MAX_OBSTACLES; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            // Keep trying until we find a valid position or max attempts reached
            while (!validPosition && attempts < MAX_PLACEMENT_ATTEMPTS) {
                attempts++;
                // Generate random position within bounds
                x = PLACEMENT_MARGIN + Math.random() * (this.scene.game.config.width - 2 * PLACEMENT_MARGIN);
                y = PLACEMENT_MARGIN + Math.random() * (this.scene.game.config.height - 2 * PLACEMENT_MARGIN);
                
                // Check if this position is valid (not overlapping with existing objects)
                validPosition = this.isPositionValid(x, y, MIN_DISTANCE_BETWEEN_OBJECTS);
            }
            
            if (validPosition) {
                const obstacle = this.scene.add.image(x, y, `obst${i}`);
                obstacle.setDisplaySize(OBSTACLE_SIZE, OBSTACLE_SIZE);
                obstacle.setDepth(OBSTACLE_DEPTH);
                
                // Add hit area for better collision detection
                obstacle.setInteractive({ pixelPerfect: true });
                
                this.obstacles.push(obstacle);
            }
        }
    }

    // Helper method to check if a position is valid (not overlapping with existing objects)
    isPositionValid(x, y, minDistance) {
        // Check against all existing goals
        for (const goal of this.goals) {
            const distance = Phaser.Math.Distance.Between(x, y, goal.x, goal.y);
            if (distance < minDistance) {
                return false;
            }
        }
        
        // Check against all existing obstacles
        for (const obstacle of this.obstacles) {
            const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
            if (distance < minDistance) {
                return false;
            }
        }
        
        return true;
    }

    checkCollisions(car) {
        // Don't check for collisions if car is at starting position
        if (car.sprite.x === CAR_START_X_NO_COLLISION && car.sprite.y === CAR_START_Y_NO_COLLISION) {
            return;
        }

        // Check obstacle collisions first
        for (let obstacle of this.obstacles) {
            const distance = Phaser.Math.Distance.Between(
                car.sprite.x,
                car.sprite.y,
                obstacle.x,
                obstacle.y
            );
            
            if (distance < obstacle.displayWidth / COLLISION_RADIUS_DIVISOR) {
                this.handleObstacleCollision();
                return;
            }
        }

        // Check goal collisions
        this.goals.forEach(goal => {
            if (goal.number === this.currentGoal) {
                const distance = Phaser.Math.Distance.Between(
                    car.sprite.x,
                    car.sprite.y,
                    goal.x,
                    goal.y
                );
                
                if (distance < goal.displayWidth / COLLISION_RADIUS_DIVISOR) {
                    this.handleGoalCollision(goal);
                }
            }
        });
    }

    handleObstacleCollision() {
        console.log('Obstacle collision detected');
        this.scene.soundManager.playSound('crash');
        this.scene.soundManager.stopBackground();
        this.scene.car.stop();
        this.scene.gameStarted = false;
        // Show default cursor
        this.scene.input.setDefaultCursor('default');
        if (this.scene.gameTimerEvent) {
            this.scene.gameTimerEvent.remove(false);
        }
        this.scene.showPlayAgainButton();
    }

    handleGoalCollision(goal) {
        console.log('Goal collision detected');
        this.scene.soundManager.playSound('goal');
        goal.destroy();
        this.currentGoal++;
        
        if (this.currentGoal > MAX_GOALS) {
            console.log('Game completed!');
            this.scene.soundManager.playSound('complete');
            this.scene.soundManager.stopBackground();
            this.scene.car.stop();
            this.scene.gameStarted = false;
            // Show default cursor
            this.scene.input.setDefaultCursor('default');
            if (this.scene.gameTimerEvent) {
                this.scene.gameTimerEvent.remove(false);
            }
            this.scene.showPlayAgainButton();
        }
    }
}

// Make GoalManager available globally
if (typeof window !== 'undefined') {
    window.GoalManager = GoalManager;
} 