class GoalManager {
    constructor(scene) {
        this.scene = scene;
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
        this.soundManager = new SoundManager(scene);
        this.collisionHandled = false;  // Add flag to track collision state
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
        const goalSize = 40;
        const margin = 50; // Minimum distance from edges
        const minDistance = 80; // Minimum distance between objects
        
        // Create goals with random positions
        for (let i = 2; i <= 10; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            // Keep trying until we find a valid position or max attempts reached
            while (!validPosition && attempts < 100) {
                attempts++;
                // Generate random position within bounds
                x = margin + Math.random() * (this.scene.game.config.width - 2 * margin);
                y = margin + Math.random() * (this.scene.game.config.height - 2 * margin);
                
                // Check if this position is valid (not overlapping with existing objects)
                validPosition = this.isPositionValid(x, y, minDistance);
            }
            
            if (validPosition) {
                const goal = this.scene.add.image(x, y, `goal${i}`);
                goal.setDisplaySize(goalSize, goalSize);
                goal.setDepth(1);
                goal.number = i;
                
                // Add hit area for better collision detection
                goal.setInteractive({ pixelPerfect: true });
                
                this.goals.push(goal);
            }
        }
    }

    createObstacles() {
        const obstacleSize = 50;
        const margin = 50; // Minimum distance from edges
        const minDistance = 80; // Minimum distance between objects
        
        // Create obstacles with random positions
        for (let i = 1; i <= 4; i++) {
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            // Keep trying until we find a valid position or max attempts reached
            while (!validPosition && attempts < 100) {
                attempts++;
                // Generate random position within bounds
                x = margin + Math.random() * (this.scene.game.config.width - 2 * margin);
                y = margin + Math.random() * (this.scene.game.config.height - 2 * margin);
                
                // Check if this position is valid (not overlapping with existing objects)
                validPosition = this.isPositionValid(x, y, minDistance);
            }
            
            if (validPosition) {
                const obstacle = this.scene.add.image(x, y, `obst${i}`);
                obstacle.setDisplaySize(obstacleSize, obstacleSize);
                obstacle.setDepth(1);
                
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
        if (car.sprite.x === 100 && car.sprite.y === 550) {
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
            
            if (distance < obstacle.displayWidth / 1.5) {
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
                
                if (distance < goal.displayWidth / 1.5) {
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
        this.scene.showPlayAgainButton();
    }

    handleGoalCollision(goal) {
        console.log('Goal collision detected');
        this.scene.soundManager.playSound('goal');
        goal.destroy();
        this.currentGoal++;
        
        if (this.currentGoal > 10) {
            console.log('Game completed!');
            this.scene.soundManager.playSound('complete');
            this.scene.soundManager.stopBackground();
            this.scene.car.stop();
            this.scene.gameStarted = false;
            // Show default cursor
            this.scene.input.setDefaultCursor('default');
            this.scene.showPlayAgainButton();
        }
    }
}

// Make GoalManager available globally
if (typeof window !== 'undefined') {
    window.GoalManager = GoalManager;
} 