// Add this at the start of game.js
if (typeof Phaser === 'undefined') {
    console.error('Phaser is not loaded! Please check your internet connection and make sure the Phaser CDN is accessible.');
    throw new Error('Phaser not loaded');
}

// Base game dimensions - match the background image aspect ratio
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

// Calculate the game size based on the viewport
function calculateGameSize() {
    const ratio = BASE_WIDTH / BASE_HEIGHT;
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    const viewportRatio = viewport.width / viewport.height;

    let gameWidth, gameHeight;

    if (viewportRatio >= ratio) {
        // Viewport is wider than game ratio
        gameHeight = viewport.height;
        gameWidth = gameHeight * ratio;
    } else {
        // Viewport is taller than game ratio
        gameWidth = viewport.width;
        gameHeight = gameWidth / ratio;
    }

    return { width: gameWidth, height: gameHeight };
}

// Game configuration
const gameConfig = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.NONE,
        parent: 'game-container',
        width: BASE_WIDTH,
        height: BASE_HEIGHT
    },
    backgroundColor: '#000000',
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

    // Load sound files
    this.load.audio('background', 'sounds/background.mp3');
    this.load.audio('crash', 'sounds/crash.mp3');
    this.load.audio('fail', 'sounds/fail.mp3');
    this.load.audio('complete', 'sounds/complete.mp3');
    this.load.audio('goal', 'sounds/goal.mp3');
    this.load.audio('engine', 'sounds/engine.mp3');
}

function create() {
    console.log('Creating game scene...');
    
    // Initialize sound manager first
    this.soundManager = new SoundManager(this);
    
    // Create and position background
    this.background = this.add.image(BASE_WIDTH/2, BASE_HEIGHT/2, 'background');
    
    // Scale background to fit the game area while maintaining aspect ratio
    this.background.setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

    // Store game dimensions for other objects to use
    this.gameScale = {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        scale: 1,
        offsetX: 0,
        offsetY: 0
    };

    // Initialize game objects
    this.goalManager = new GoalManager(this);
    this.car = new Car(this);
    this.gameStarted = false;

    // Create start button
    const buttonX = BASE_WIDTH / 2;
    const buttonY = BASE_HEIGHT * 0.85;
    const buttonHeight = BASE_HEIGHT * 0.08;
    const cornerRadius = buttonHeight / 2;
    const shadowOffset = 4;
    const padding = 30; // Increased padding for better spacing

    // Create button text first to measure its width
    const buttonText = this.add.text(0, 0, 'START', {
        fontSize: '24px',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        color: '#FFFFFF'
    }).setOrigin(0.5);

    // Calculate button width based on text width plus padding
    const buttonWidth = buttonText.width + (padding * 2);

    // Create a container for the button
    const startButtonContainer = this.add.container(buttonX, buttonY);
    startButtonContainer.setDepth(100);

    // Create shadow effect
    const shadowGraphics = this.add.graphics();
    shadowGraphics.fillStyle(0x000000, 0.3);
    shadowGraphics.fillRoundedRect(
        shadowOffset - buttonWidth/2,
        shadowOffset - buttonHeight/2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );

    // Create button background
    const buttonGraphics = this.add.graphics();
    buttonGraphics.lineStyle(2, 0x008800);
    buttonGraphics.fillStyle(0x00ff00);
    buttonGraphics.fillRoundedRect(
        -buttonWidth/2,
        -buttonHeight/2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );
    buttonGraphics.strokeRoundedRect(
        -buttonWidth/2,
        -buttonHeight/2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );

    // Add elements to container
    startButtonContainer.add(shadowGraphics);
    startButtonContainer.add(buttonGraphics);
    startButtonContainer.add(buttonText);

    // Make the button interactive
    buttonGraphics.setInteractive(
        new Phaser.Geom.Rectangle(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight
        ),
        Phaser.Geom.Rectangle.Contains
    );

    // Add hover effects
    buttonGraphics.on('pointerover', () => {
        buttonGraphics.clear();
        buttonGraphics.lineStyle(2, 0x008800);
        buttonGraphics.fillStyle(0x00dd00);
        buttonGraphics.fillRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.strokeRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        startButtonContainer.setScale(1.05);
    });

    buttonGraphics.on('pointerout', () => {
        buttonGraphics.clear();
        buttonGraphics.lineStyle(2, 0x008800);
        buttonGraphics.fillStyle(0x00ff00);
        buttonGraphics.fillRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.strokeRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        startButtonContainer.setScale(1);
    });

    // Add click handler
    buttonGraphics.on('pointerdown', () => {
        console.log('Button clicked/touched');
        this.startGame();
    });

    // Store button elements for later use
    this.startButton = {
        container: startButtonContainer,
        graphics: buttonGraphics,
        text: buttonText
    };

    // Force input system update
    this.time.delayedCall(100, () => {
        this.scale.refresh();
        this.input.enabled = true;
        this.input.setPollAlways();
    });

    console.log('Game scene created');

    // Add startGame method to the scene
    this.startGame = function() {
        if (this.gameStarted) return;
        
        console.log('Starting game...');
        this.gameStarted = true;
        
        // Hide the button container
        this.startButton.container.setVisible(false);
        
        // Start background music
        this.soundManager.playBackground();
        
        // Reset and create goals
        console.log('Creating goals and obstacles...');
        this.goalManager.reset();
        this.goalManager.createGoals();
        this.goalManager.createObstacles();
        
        // Reset car position
        this.car.resetPosition();
        
        // Hide the default cursor
        this.input.setDefaultCursor('none');
    };

    // Add showPlayAgainButton method to the scene
    this.showPlayAgainButton = function() {
        const buttonX = BASE_WIDTH / 2;
        const buttonY = BASE_HEIGHT / 2;
        const buttonHeight = BASE_HEIGHT * 0.08;
        const cornerRadius = buttonHeight / 2;
        const shadowOffset = 4;
        const padding = 30; // Same padding as start button

        // Create button text first to measure its width
        const buttonText = this.add.text(0, 0, 'PLAY AGAIN', {
            fontSize: '24px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // Calculate button width based on text width plus padding
        const buttonWidth = buttonText.width + (padding * 2);

        // Create a container for the button
        const playAgainButton = this.add.container(buttonX, buttonY);
        playAgainButton.setDepth(100);

        // Create shadow effect
        const shadowGraphics = this.add.graphics();
        shadowGraphics.fillStyle(0x000000, 0.3);
        shadowGraphics.fillRoundedRect(
            shadowOffset - buttonWidth/2,
            shadowOffset - buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

        // Create button background
        const buttonGraphics = this.add.graphics();
        buttonGraphics.lineStyle(2, 0x008800);
        buttonGraphics.fillStyle(0x00ff00);
        buttonGraphics.fillRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.strokeRoundedRect(
            -buttonWidth/2,
            -buttonHeight/2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

        // Add elements to container
        playAgainButton.add(shadowGraphics);
        playAgainButton.add(buttonGraphics);
        playAgainButton.add(buttonText);

        // Make the button interactive
        buttonGraphics.setInteractive(
            new Phaser.Geom.Rectangle(
                -buttonWidth/2,
                -buttonHeight/2,
                buttonWidth,
                buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
        );

        // Add hover effects
        buttonGraphics.on('pointerover', () => {
            buttonGraphics.clear();
            buttonGraphics.lineStyle(2, 0x008800);
            buttonGraphics.fillStyle(0x00dd00);
            buttonGraphics.fillRoundedRect(
                -buttonWidth/2,
                -buttonHeight/2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            buttonGraphics.strokeRoundedRect(
                -buttonWidth/2,
                -buttonHeight/2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            playAgainButton.setScale(1.05);
        });

        buttonGraphics.on('pointerout', () => {
            buttonGraphics.clear();
            buttonGraphics.lineStyle(2, 0x008800);
            buttonGraphics.fillStyle(0x00ff00);
            buttonGraphics.fillRoundedRect(
                -buttonWidth/2,
                -buttonHeight/2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            buttonGraphics.strokeRoundedRect(
                -buttonWidth/2,
                -buttonHeight/2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
            playAgainButton.setScale(1);
        });

        // Add click handler
        buttonGraphics.on('pointerdown', () => {
            // Remove the button
            playAgainButton.destroy();
            
            // Start a new game
            this.startGame();
        });
    };
}

function update() {
    if (!this.gameStarted) return;
    
    // Update car
    this.car.update();
    
    // Check collisions
    this.goalManager.checkCollisions(this.car);
}

// Get initial game size
const gameSize = calculateGameSize();

// Create game instance
let game = new Phaser.Game(gameConfig);

// Handle window resizing
window.addEventListener('resize', () => {
    if (game && game.canvas) {
        const container = document.getElementById('game-container');
        if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Calculate scale to fit while maintaining aspect ratio
            const scaleX = containerWidth / BASE_WIDTH;
            const scaleY = containerHeight / BASE_HEIGHT;
            const scale = Math.min(scaleX, scaleY);
            
            // Apply the scale
            game.canvas.style.width = `${BASE_WIDTH * scale}px`;
            game.canvas.style.height = `${BASE_HEIGHT * scale}px`;
        }
    }
});

// Call resize after a short delay to ensure game is initialized
setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
}, 100); 