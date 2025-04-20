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
        
        // Define goal positions (in game coordinates)
        const positions = [
            { x: 640, y: 120 },  // Goal 2
            { x: 240, y: 240 },  // Goal 3
            { x: 560, y: 300 },  // Goal 4
            { x: 160, y: 360 },  // Goal 5
            { x: 400, y: 420 },  // Goal 6
            { x: 640, y: 480 },  // Goal 7
            { x: 240, y: 480 },  // Goal 8
            { x: 160, y: 120 },  // Goal 9
            { x: 480, y: 180 }   // Goal 10
        ];

        // Create goals
        positions.forEach((pos, index) => {
            const goalNumber = index + 2; // Goals start from 2
            const goal = this.scene.add.image(pos.x, pos.y, `goal${goalNumber}`);
            goal.setDisplaySize(goalSize, goalSize);
            goal.setDepth(1);
            goal.number = goalNumber;
            
            // Add hit area for better collision detection
            goal.setInteractive({ pixelPerfect: true });
            
            this.goals.push(goal);
        });
    }

    createObstacles() {
        const obstacleSize = 50;
        
        // Define obstacle positions (in game coordinates)
        const positions = [
            { x: 320, y: 180 },
            { x: 480, y: 360 },
            { x: 160, y: 420 },
            { x: 640, y: 240 }
        ];

        // Create obstacles
        positions.forEach((pos, index) => {
            const obstacle = this.scene.add.image(pos.x, pos.y, `obst${index + 1}`);
            obstacle.setDisplaySize(obstacleSize, obstacleSize);
            obstacle.setDepth(1);
            
            // Add hit area for better collision detection
            obstacle.setInteractive({ pixelPerfect: true });
            
            this.obstacles.push(obstacle);
        });
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

    handleGoalCollision(goal) {
        if (goal.number === this.currentGoal) {
            this.soundManager.playSound('goal');
            this.currentGoal++;
            goal.destroy();
            this.goals = this.goals.filter(g => g !== goal);
            
            if (this.currentGoal > 10) {
                this.soundManager.playSound('complete');
                // Game complete logic here
            }
        }
    }

    handleObstacleCollision() {
        // Stop the car
        this.scene.car.stop();
        
        // Play crash sound
        this.soundManager.playSound('crash');
        
        // End the game
        this.scene.gameStarted = false;
        
        // Show play again button
        this.scene.showPlayAgainButton();
    }
}

// Make GoalManager available globally
if (typeof window !== 'undefined') {
    window.GoalManager = GoalManager;
} 