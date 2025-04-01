class GoalManager {
    constructor(scene) {
        this.scene = scene;
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
        // Define minimum distance between objects
        this.minDistance = 100;
    }

    reset() {
        // Clear existing goals and obstacles
        this.goals.forEach(goal => {
            if (goal.sprite) goal.sprite.destroy();
        });
        this.goals = [];

        this.obstacles.forEach(obstacle => {
            if (obstacle.sprite) obstacle.sprite.destroy();
        });
        this.obstacles = [];

        this.currentGoal = 1;
    }

    // Helper method to check if a position is too close to existing objects
    isTooClose(x, y, objects) {
        return objects.some(obj => {
            const distance = Phaser.Math.Distance.Between(x, y, obj.x, obj.y);
            return distance < this.minDistance;
        });
    }

    createGoals() {
        // Create 10 goals with random positions
        for (let i = 1; i <= 10; i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 50; // Prevent infinite loop

            // Keep trying until we find a valid position
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(100, 500);
                attempts++;
            } while (this.isTooClose(x, y, this.goals) && attempts < maxAttempts);

            // Create goal sprite
            const sprite = this.scene.add.sprite(x, y, `goal${i}`);
            sprite.setDisplaySize(60, 60);
            sprite.setDepth(1);  // Set goals to appear above background but below car

            this.goals.push({
                number: i,
                x: x,
                y: y,
                sprite: sprite
            });
        }
    }

    createObstacles() {
        // Create 4 obstacles with random positions
        for (let i = 1; i <= 4; i++) {
            let x, y;
            let attempts = 0;
            const maxAttempts = 50; // Prevent infinite loop

            // Keep trying until we find a valid position
            do {
                x = Phaser.Math.Between(100, 700);
                y = Phaser.Math.Between(100, 500);
                attempts++;
            } while (this.isTooClose(x, y, [...this.goals, ...this.obstacles]) && attempts < maxAttempts);

            // Create obstacle sprite
            const sprite = this.scene.add.sprite(x, y, `obst${i}`);
            sprite.setDisplaySize(60, 60);
            sprite.setDepth(1);  // Set obstacles to appear above background but below car

            this.obstacles.push({
                number: i,
                x: x,
                y: y,
                sprite: sprite
            });
        }
    }
}

// Make GoalManager available globally
if (typeof window !== 'undefined') {
    window.GoalManager = GoalManager;
} 