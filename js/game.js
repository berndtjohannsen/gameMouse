// Add this at the start of game.js
if (typeof Phaser === 'undefined') {
    console.error('Phaser is not loaded! Please check your internet connection and make sure the Phaser CDN is accessible.');
    throw new Error('Phaser not loaded');
}

// First define all functions
function preload() {
    // Add error handler for loading errors
    this.load.on('filecomplete', (key, type, data) => {
        console.log(`Successfully loaded: ${key} (${type})`);
    });

    this.load.on('loaderror', (fileObj) => {
        console.error(`Failed to load: ${fileObj.key} (${fileObj.url})`);
        console.error('Error:', fileObj.src);
    });

    // Create simple triangle for car
    const carSize = 32;
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x000000);
    graphics.fillStyle(0x3498db);
    graphics.beginPath();
    graphics.moveTo(carSize/2, 0);
    graphics.lineTo(carSize, carSize);
    graphics.lineTo(0, carSize);
    graphics.closePath();
    graphics.fill();
    graphics.stroke();
    graphics.generateTexture('car', carSize, carSize);
    graphics.destroy();

    // Load all images
    console.log('Loading images...');
    this.load.image('background', 'images/background.jpg');
    
    // Load goal images
    for (let i = 1; i <= 10; i++) {
        this.load.image(`goal${i}`, `images/goal${i}.jpg`);
    }
    
    // Load obstacle images
    for (let i = 1; i <= 4; i++) {
        this.load.image(`obst${i}`, `images/obst${i}.jpg`);
    }

    // Load audio files
    console.log('Loading audio files...');
    this.load.audio('background', 'sounds/background.mp3');
    this.load.audio('engine', 'sounds/engine.mp3');
    this.load.audio('crash', 'sounds/crash.mp3');
    this.load.audio('fail', 'sounds/fail.mp3');
    this.load.audio('complete', 'sounds/complete.mp3');
    
    // Load goal sounds
    for (let i = 1; i <= 10; i++) {
        this.load.audio(`goal${i}`, `sounds/goal${i}.mp3`);
    }

    // Add load complete handler
    this.load.on('complete', () => {
        console.log('Load complete. Available textures:', Object.keys(this.textures.list));
    });
}

function create() {
    // Log all available textures
    console.log('Available textures:', this.textures.list);
    
    // Try to display one obstacle as a test
    const testObstacle = this.add.image(400, 300, 'obst1');
    if (testObstacle) {
        testObstacle.setDisplaySize(60, 60);
        console.log('Test obstacle created successfully');
    }

    // Check if background loaded
    if (!this.textures.exists('background')) {
        console.warn('Background image not loaded!');
    }

    // Check if obstacle images loaded
    for (let i = 1; i <= 4; i++) {
        if (!this.textures.exists(`obst${i}`)) {
            console.warn(`Obstacle image ${i} not loaded!`);
        }
    }

    this.add.image(400, 300, 'background');

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

    // Add text with styling
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

    soundManager = new SoundManager(this);
    goalManager = new GoalManager(this);
}

function update() {
    if (!gameStarted) return;
    
    car.update(this.input);

    if (goalManager.checkGoalCollision(car)) {
        // Goal reached successfully
    } else if (goalManager.checkWrongGoalCollision(car) || 
               goalManager.checkObstacleCollision(car)) {
        car.resetPosition();
    }
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    soundManager.playBackground();
    
    // These should be methods of the goalManager instance
    goalManager.createGoals();
    goalManager.createObstacles();
    
    car = new Car(this, 100, 500);
}

function createConfetti() {
    const particles = this.add.particles(0, 0, 'confetti', {
        frame: [ 'red', 'yellow', 'blue', 'green', 'purple' ],
        lifespan: 4000,
        speed: { min: 150, max: 250 },
        scale: { start: 0.6, end: 0 },
        gravityY: 300,
        quantity: 5,
        blendMode: 'ADD',
        emitting: false
    });

    const emitters = [];
    const positions = [
        { x: 0, y: 0 }, { x: gameConfig.width, y: 0 },
        { x: 0, y: gameConfig.height }, { x: gameConfig.width, y: gameConfig.height },
        { x: gameConfig.width/2, y: 0 }
    ];

    positions.forEach(pos => {
        const emitter = particles.createEmitter({
            x: pos.x,
            y: pos.y,
            angle: { min: 0, max: 360 },
            frequency: 100
        });
        emitters.push(emitter);
    });

    emitters.forEach(emitter => emitter.start());
    setTimeout(() => {
        emitters.forEach(emitter => emitter.stop());
    }, 3000);
}

// Then declare variables and create game instance
let car;
let goalManager;
let soundManager;
let startButton;
let gameStarted = false;

// Finally create the game configuration and instance
const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(gameConfig); 