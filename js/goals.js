class GoalManager {
    constructor(scene) {
        this.scene = scene;
        this.goals = [];
        this.obstacles = [];
        this.currentGoal = 1;
    }

    createGoals() {
        console.log('Starting to create goals...');
        const padding = 100;
        const minDistance = 100;

        for (let i = 1; i <= 10; i++) {
            let position;
            do {
                position = {
                    x: Phaser.Math.Between(padding, this.scene.game.config.width - padding),
                    y: Phaser.Math.Between(padding, this.scene.game.config.height - padding)
                };
            } while (this.isTooCloseToOthers(position, minDistance));

            const goal = this.createGoal(position.x, position.y, i);
            if (goal) {
                this.goals.push(goal);
                console.log(`Successfully created goal ${i}`);
            } else {
                console.error(`Failed to create goal ${i}`);
            }
        }
        console.log(`Created ${this.goals.length} goals`);
    }

    createObstacles() {
        console.log('Starting to create obstacles...');
        const padding = 100;
        const minDistance = 100;

        for (let i = 1; i <= 4; i++) {
            let position;
            do {
                position = {
                    x: Phaser.Math.Between(padding, this.scene.game.config.width - padding),
                    y: Phaser.Math.Between(padding, this.scene.game.config.height - padding)
                };
            } while (
                this.isTooCloseToOthers(position, minDistance) ||
                this.isTooCloseToGoals(position, minDistance)
            );

            const obstacle = this.createObstacle(position.x, position.y, i);
            if (obstacle) {
                this.obstacles.push(obstacle);
            }
        }
        console.log(`Created ${this.obstacles.length} obstacles`);
    }

    createGoal(x, y, number) {
        console.log(`Creating goal ${number} at position (${x}, ${y})`);
        
        try {
            // Create the base circle
            const circle = this.scene.add.circle(x, y, 30, 0x00ff00);
            console.log(`Created circle for goal ${number}`);

            // Check if the goal image exists before trying to use it
            if (!this.scene.textures.exists(`goal${number}`)) {
                console.error(`Goal image ${number} not found in textures!`);
                console.log('Available textures:', Object.keys(this.scene.textures.list));
                return null;
            }

            // Add the goal image
            const goalImage = this.scene.add.image(x, y, `goal${number}`);
            goalImage.setDisplaySize(60, 60);
            console.log(`Added image for goal ${number} with key: goal${number}`);

            // Add the number text
            const text = this.scene.add.text(x, y, number.toString(), {
                fontSize: '24px',
                fill: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            console.log(`Added text for goal ${number}`);

            return {
                circle,
                image: goalImage,
                number,
                x,
                y,
                text
            };
        } catch (error) {
            console.error(`Error creating goal ${number}:`, error);
            console.error('Stack:', error.stack);
            return null;
        }
    }

    createObstacle(x, y, index) {
        console.log(`Creating obstacle ${index} at (${x}, ${y})`);
        try {
            const obstacle = this.scene.physics.add.image(x, y, `obst${index}`);
            if (obstacle) {
                obstacle.setDisplaySize(60, 60);  // Set size explicitly
                console.log(`Successfully created obstacle ${index}`);
                return obstacle;
            } else {
                console.warn(`Failed to create obstacle ${index}`);
                return null;
            }
        } catch (error) {
            console.error(`Error creating obstacle ${index}:`, error);
            return null;
        }
    }

    isTooCloseToOthers(position, minDistance) {
        return [...this.goals, ...this.obstacles].some(obj => {
            return Phaser.Math.Distance.Between(
                position.x,
                position.y,
                obj.x,
                obj.y
            ) < minDistance;
        });
    }

    isTooCloseToGoals(position, minDistance) {
        return this.goals.some(goal => {
            return Phaser.Math.Distance.Between(
                position.x,
                position.y,
                goal.x,
                goal.y
            ) < minDistance;
        });
    }

    checkGoalCollision(car) {
        const currentGoalObj = this.goals.find(g => g.number === this.currentGoal);
        if (!currentGoalObj) return;

        const distance = Phaser.Math.Distance.Between(
            car.sprite.x,
            car.sprite.y,
            currentGoalObj.x,
            currentGoalObj.y
        );

        if (distance < 30) {
            this.scene.sound.play(`goal${this.currentGoal}`);
            currentGoalObj.circle.setFillStyle(0x808080);
            this.currentGoal++;

            if (this.currentGoal > 10) {
                this.gameComplete();
            }
            return true;
        }
        return false;
    }

    checkWrongGoalCollision(car) {
        const wrongGoals = this.goals.filter(g => g.number !== this.currentGoal);
        
        for (const goal of wrongGoals) {
            const distance = Phaser.Math.Distance.Between(
                car.sprite.x,
                car.sprite.y,
                goal.x,
                goal.y
            );

            if (distance < 30) {
                this.scene.sound.play('fail');
                return true;
            }
        }
        return false;
    }

    checkObstacleCollision(car) {
        for (const obstacle of this.obstacles) {
            const distance = Phaser.Math.Distance.Between(
                car.sprite.x,
                car.sprite.y,
                obstacle.x,
                obstacle.y
            );

            if (distance < 40) {
                this.scene.sound.play('crash');
                return true;
            }
        }
        return false;
    }

    gameComplete() {
        this.scene.sound.play('complete');
        createConfetti.call(this.scene);
        
        const text = this.scene.add.text(
            this.scene.game.config.width / 2,
            this.scene.game.config.height / 2,
            'Congratulations!\nYou completed all goals!',
            {
                fontSize: '32px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            duration: 1000,
            delay: 3000,
            onComplete: () => text.destroy()
        });
    }

    reset() {
        this.goals.forEach(goal => {
            if (goal.circle) goal.circle.destroy();
            if (goal.image) goal.image.destroy();
            if (goal.text) goal.text.destroy();
        });
        this.goals = [];

        this.obstacles.forEach(obstacle => obstacle.destroy());
        this.obstacles = [];

        this.currentGoal = 1;
    }
}

if (typeof window !== 'undefined') {
    window.GoalManager = GoalManager;
} 