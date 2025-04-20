class GoalManager {
    constructor(scene) {
        this.scene = scene;
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
        // Define minimum distance between objects (scaled)
        this.minDistance = 100;
        
        // Store base dimensions for scaling
        this.baseWidth = 800;
        this.baseHeight = 600;
    }

    // Helper method to scale coordinates
    scaleX(x) {
        return x * (this.scene.scale.width / this.baseWidth);
    }

    scaleY(y) {
        return y * (this.scene.scale.height / this.baseHeight);
    }

    // Helper method to scale size
    scaleSize(size) {
        const scaleX = this.scene.scale.width / this.baseWidth;
        const scaleY = this.scene.scale.height / this.baseHeight;
        return size * Math.min(scaleX, scaleY);
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
            return distance < this.scaleSize(this.minDistance);
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
                // Generate positions in base coordinates
                const baseX = Phaser.Math.Between(100, 700);
                const baseY = Phaser.Math.Between(100, 500);
                
                // Scale the positions and add background offset
                x = this.scaleX(baseX) + (this.scene.backgroundOffset?.x || 0);
                y = this.scaleY(baseY) + (this.scene.backgroundOffset?.y || 0);
                
                attempts++;
            } while (this.isTooClose(x, y, this.goals) && attempts < maxAttempts);

            // Create goal sprite with scaled size
            const sprite = this.scene.add.sprite(x, y, `goal${i}`);
            const scaledSize = this.scaleSize(60);
            sprite.setDisplaySize(scaledSize, scaledSize);
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
                // Generate positions in base coordinates
                const baseX = Phaser.Math.Between(100, 700);
                const baseY = Phaser.Math.Between(100, 500);
                
                // Scale the positions and add background offset
                x = this.scaleX(baseX) + (this.scene.backgroundOffset?.x || 0);
                y = this.scaleY(baseY) + (this.scene.backgroundOffset?.y || 0);
                
                attempts++;
            } while (this.isTooClose(x, y, [...this.goals, ...this.obstacles]) && attempts < maxAttempts);

            // Create obstacle sprite with scaled size
            const sprite = this.scene.add.sprite(x, y, `obst${i}`);
            const scaledSize = this.scaleSize(60);
            sprite.setDisplaySize(scaledSize, scaledSize);
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