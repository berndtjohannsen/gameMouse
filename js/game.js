// Add this at the start of game.js
if (typeof Phaser === 'undefined') {
    console.error('Phaser is not loaded! Please check your internet connection and make sure the Phaser CDN is accessible.');
    throw new Error('Phaser not loaded');
}

// Base game dimensions - match the background image aspect ratio
const BASE_WIDTH = 800;
const BASE_HEIGHT = 600;

// UI Button Style
const BUTTON_FONT_SIZE = '24px';
const BUTTON_FONT_FAMILY = 'Arial';
const BUTTON_FONT_STYLE = 'bold';
const BUTTON_TEXT_COLOR = '#FFFFFF';
const BUTTON_X_FACTOR = 0.5; // For positioning at BASE_WIDTH / 2
const START_BUTTON_Y_FACTOR = 0.85; // For positioning Start button
const PLAY_AGAIN_BUTTON_Y_FACTOR = 0.5; // For positioning Play Again button
const BUTTON_HEIGHT_FACTOR = 0.08; // Relative to BASE_HEIGHT
const BUTTON_SHADOW_OFFSET = 4;
const BUTTON_PADDING = 30;
const BUTTON_BORDER_THICKNESS = 2;
const BUTTON_BORDER_COLOR_HEX = 0x008800; // Dark green
const BUTTON_BG_COLOR_HEX = 0x00ff00;     // Bright green
const BUTTON_BG_COLOR_HOVER_HEX = 0x00dd00; // Slightly darker green for hover
const BUTTON_SHADOW_COLOR_HEX = 0x000000;
const BUTTON_SHADOW_ALPHA = 0.3;
const BUTTON_HOVER_SCALE = 1.05;
const BUTTON_TEXT_ORIGIN = 0.5;
const BUTTON_DEPTH = 100; // Ensure buttons are on top

// Game Setup
const INPUT_POLL_DELAY_MS = 100; // For this.time.delayedCall
const RESIZE_EVENT_DELAY_MS = 100; // For setTimeout for resize dispatch
const BACKGROUND_ORIGIN_X = 0.5;
const BACKGROUND_ORIGIN_Y = 0.5;
const DEFAULT_CURSOR_STYLE = 'none'; // For hiding cursor during gameplay
const VISIBLE_CURSOR_STYLE = 'default'; // For menus/buttons

// Timer Display
const TIMER_TEXT_X_OFFSET = 30; // Offset from the right edge
const TIMER_TEXT_Y_OFFSET = 20; // Offset from the top edge
const TIMER_FONT_SIZE = '20px';
const TIMER_FONT_FAMILY = 'Arial';
const TIMER_TEXT_COLOR = '#FFFFFF';
const TIMER_INITIAL_TEXT = 'Time: 0s';

// Private helper function to create buttons
// This function is intended to be called with `this` bound to the scene context
function _createButton(x, y, text, onClickAction) {
    const scene = this; // `this` is the scene context
    const buttonHeight = BASE_HEIGHT * BUTTON_HEIGHT_FACTOR;
    const cornerRadius = buttonHeight / BUTTON_BORDER_THICKNESS;

    // Create button text first to measure its width
    const buttonText = scene.add.text(0, 0, text, {
        fontSize: BUTTON_FONT_SIZE,
        fontFamily: BUTTON_FONT_FAMILY,
        fontStyle: BUTTON_FONT_STYLE,
        color: BUTTON_TEXT_COLOR
    }).setOrigin(BUTTON_TEXT_ORIGIN);

    // Calculate button width based on text width plus padding
    const buttonWidth = buttonText.width + (BUTTON_PADDING * 2);

    // Create a container for the button
    const buttonContainer = scene.add.container(x, y);
    buttonContainer.setDepth(BUTTON_DEPTH);

    // Create shadow effect
    const shadowGraphics = scene.add.graphics();
    shadowGraphics.fillStyle(BUTTON_SHADOW_COLOR_HEX, BUTTON_SHADOW_ALPHA);
    shadowGraphics.fillRoundedRect(
        BUTTON_SHADOW_OFFSET - buttonWidth / 2,
        BUTTON_SHADOW_OFFSET - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );

    // Create button background
    const buttonGraphics = scene.add.graphics();
    buttonGraphics.lineStyle(BUTTON_BORDER_THICKNESS, BUTTON_BORDER_COLOR_HEX);
    buttonGraphics.fillStyle(BUTTON_BG_COLOR_HEX);
    buttonGraphics.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );
    buttonGraphics.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );

    // Add elements to container
    buttonContainer.add(shadowGraphics);
    buttonContainer.add(buttonGraphics);
    buttonContainer.add(buttonText);

    // Make the button interactive
    buttonGraphics.setInteractive(
        new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        ),
        Phaser.Geom.Rectangle.Contains
    );

    // Add hover effects
    buttonGraphics.on('pointerover', () => {
        buttonGraphics.clear();
        buttonGraphics.lineStyle(BUTTON_BORDER_THICKNESS, BUTTON_BORDER_COLOR_HEX);
        buttonGraphics.fillStyle(BUTTON_BG_COLOR_HOVER_HEX);
        buttonGraphics.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonContainer.setScale(BUTTON_HOVER_SCALE);
    });

    buttonGraphics.on('pointerout', () => {
        buttonGraphics.clear();
        buttonGraphics.lineStyle(BUTTON_BORDER_THICKNESS, BUTTON_BORDER_COLOR_HEX);
        buttonGraphics.fillStyle(BUTTON_BG_COLOR_HEX);
        buttonGraphics.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.strokeRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonContainer.setScale(1); // Reset scale
    });

    // Add click handler
    buttonGraphics.on('pointerdown', onClickAction);

    return {
        container: buttonContainer,
        graphics: buttonGraphics,
        text: buttonText
    };
}

function preload() {
    // Add loading error handler
    this.load.on('loaderror', function(file) {
        console.error('Error loading asset:', file.src);
    });

    // Load all images
    this.load.image('background', 'images/background.jpg');
    this.load.image('car', 'images/car.png');
    
    // Load goal images (using literals as they map to filenames)
    for (let i = 1; i <= 10; i++) {
        this.load.image(`goal${i}`, `images/goal${i}.jpg`);
    }
    
    // Load obstacle images (using literals as they map to filenames)
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
    this.background = this.add.image(BASE_WIDTH * BACKGROUND_ORIGIN_X, BASE_HEIGHT * BACKGROUND_ORIGIN_Y, 'background');
    
    // Scale background to fit the game area while maintaining aspect ratio
    this.background.setDisplaySize(BASE_WIDTH, BASE_HEIGHT);

    // Initialize game objects
    this.goalManager = new GoalManager(this);
    this.car = new Car(this);
    this.gameStarted = false;

    // Create start button using the helper
    this.startButton = this._createButton(
        BASE_WIDTH * BUTTON_X_FACTOR,
        BASE_HEIGHT * START_BUTTON_Y_FACTOR,
        'START',
        () => {
            console.log('Button clicked/touched');
            this.startGame();
        }
    );

    // Create Timer Display
    this.timerText = this.add.text(
        BASE_WIDTH - TIMER_TEXT_X_OFFSET, // X position
        TIMER_TEXT_Y_OFFSET,    // Y position
        TIMER_INITIAL_TEXT,
        {
            fontSize: TIMER_FONT_SIZE,
            fontFamily: TIMER_FONT_FAMILY,
            color: TIMER_TEXT_COLOR,
            align: 'right' // Align text to the right for neatness at the edge
        }
    ).setOrigin(1, 0); // Set origin to top-right
    this.timerText.setDepth(BUTTON_DEPTH + 1); // Ensure timer is above buttons

    this.timerStartTime = 0;
    this.gameTimerEvent = null;

    // Force input system update
    this.time.delayedCall(INPUT_POLL_DELAY_MS, () => {
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
        if (this.startButton && this.startButton.container) {
            this.startButton.container.setVisible(false);
        }
        
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
        this.input.setDefaultCursor(DEFAULT_CURSOR_STYLE);

        // Reset and start timer
        if (this.gameTimerEvent) {
            this.gameTimerEvent.remove(false); // Remove previous timer if any
        }
        this.timerStartTime = this.time.now;
        this.timerText.setText(TIMER_INITIAL_TEXT); // Reset display to "Time: 0s"

        this.gameTimerEvent = this.time.addEvent({
            delay: 1000, // 1000 ms = 1 second
            callback: function() {
                if (this.gameStarted) {
                    const elapsedSeconds = Math.floor((this.time.now - this.timerStartTime) / 1000);
                    this.timerText.setText('Time: ' + elapsedSeconds + 's');
                }
            },
            callbackScope: this, // Ensure 'this' refers to the scene
            loop: true
        });
    };

    // Add showPlayAgainButton method to the scene
    this.showPlayAgainButton = function() {
        // Create the "Play Again" button using the helper
        const playAgainButton = this._createButton(
            BASE_WIDTH * BUTTON_X_FACTOR,
            BASE_HEIGHT * PLAY_AGAIN_BUTTON_Y_FACTOR,
            'PLAY AGAIN',
            () => {
                // The button's own container is accessed via playAgainButton.container
                if (playAgainButton && playAgainButton.container) {
                    playAgainButton.container.destroy();
                }
                // Show default cursor when returning to a menu-like state
                this.input.setDefaultCursor(VISIBLE_CURSOR_STYLE);
                // Start a new game
                this.startGame();
            }
        );
        // No need to store playAgainButton on `this` unless accessed elsewhere,
        // its container is managed by the onClickAction.
    };
}

function update() {
    if (!this.gameStarted) return;
    
    // Update car
    this.car.update();
    
    // Check collisions
    this.goalManager.checkCollisions(this.car);
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
        update: update,
        _createButton: _createButton // Add helper to scene object
    }
};

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
}, RESIZE_EVENT_DELAY_MS);