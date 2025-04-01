// Add this at the start of game.js
if (typeof Phaser === 'undefined') {
    console.error('Phaser is not loaded! Please check your internet connection and make sure the Phaser CDN is accessible.');
    throw new Error('Phaser not loaded');
}

function preload() {
    // Add loading error handler
    this.load.on('loaderror', function(file) {
        console.error('Error loading asset:', file.src);
    });

    // Load all images
    this.load.image('background', 'images/background.jpg');
    this.load.image('car', 'images/car.png');
    
    // Load goal images
    for (let i = 1; i <= 10; i++) {
        this.load.image(`goal${i}`, `images/goal${i}.jpg`);
    }
    
    // Load obstacle images
    for (let i = 1; i <= 4; i++) {
        this.load.image(`obst${i}`, `images/obst${i}.jpg`);
    }

    // Add completion handler
    this.load.on('complete', () => {
        console.log('All assets loaded successfully');
    });
}

function create() {
    console.log('Creating game scene...');
    
    // Add background first
    const background = this.add.image(400, 300, 'background');
    if (!background) {
        console.error('Failed to create background');
    }

    // Create button container
    const buttonWidth = 80;
    const buttonHeight = 30;
    const buttonX = 80;
    const buttonY = 550;

    // Create button background
    const startButton = this.add.graphics();
    startButton.lineStyle(3, 0x000000);
    startButton.fillStyle(0x00ff00);
    startButton.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                               buttonWidth, buttonHeight, 15);
    startButton.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                                 buttonWidth, buttonHeight, 15);

    // Add text
    const startText = this.add.text(buttonX, buttonY, 'START', { 
        fontSize: '20px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#FFFFFF',
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 2,
            fill: true
        }
    });
    startText.setOrigin(0.5);

    // Create hitarea
    const hitArea = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight);
    hitArea.setInteractive({ cursor: 'pointer' });

    // Hover effects
    hitArea.on('pointerover', () => {
        startButton.clear();
        startButton.lineStyle(3, 0x000000);
        startButton.fillStyle(0x00dd00);
        startButton.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                                   buttonWidth, buttonHeight, 15);
        startButton.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                                     buttonWidth, buttonHeight, 15);
        startText.setScale(1.05);
    });

    hitArea.on('pointerout', () => {
        startButton.clear();
        startButton.lineStyle(3, 0x000000);
        startButton.fillStyle(0x00ff00);
        startButton.fillRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                                   buttonWidth, buttonHeight, 15);
        startButton.strokeRoundedRect(buttonX - buttonWidth/2, buttonY - buttonHeight/2, 
                                     buttonWidth, buttonHeight, 15);
        startText.setScale(1);
    });

    hitArea.on('pointerdown', startGame.bind(this));

    // Initialize managers
    this.goalManager = new GoalManager(this);
    goalManager = this.goalManager;

    // Initialize car
    this.car = new Car(this);
    car = this.car;

    console.log('Game scene created');
}

function update() {
    // Don't do anything if game hasn't started
    if (!gameStarted) {
        return;
    }

    // Update car
    car.update();
}

function startGame() {
    if (gameStarted) return;
    
    console.log('Starting game...');
    
    // Reset game state
    gameStarted = true;
    
    // Reset and create goals
    console.log('Creating goals and obstacles...');
    goalManager.reset();
    goalManager.createGoals();
    goalManager.createObstacles();
    console.log(`Created ${goalManager.goals.length} goals and ${goalManager.obstacles.length} obstacles`);

    // Reset car position
    car.resetPosition();

    // Hide the default cursor
    this.input.setDefaultCursor('none');
}

// Declare variables
let goalManager;
let car;
let gameStarted = false;

// Create the game configuration and instance
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(gameConfig); 