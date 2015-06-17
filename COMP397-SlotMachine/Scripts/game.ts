/// <reference path="typings/stats/stats.d.ts" />
/// <reference path="typings/easeljs/easeljs.d.ts" />
/// <reference path="typings/tweenjs/tweenjs.d.ts" />
/// <reference path="typings/soundjs/soundjs.d.ts" />
/// <reference path="typings/preloadjs/preloadjs.d.ts" />
/// <reference path="../objects/button.ts" />
/// <reference path="../objects/label.ts" />
/// <reference path="../config/constants.ts" />


// Game Framework Variables
var canvas = document.getElementById("canvas");
var stage: createjs.Stage;
var stats: Stats;
var tiles: createjs.Bitmap[] = [];
var reelContainers: createjs.Container[] = [];

// GAME CONSTANTS
var NUM_REELS: number = 3;

var assets: createjs.LoadQueue;
var manifest = [
    { id: "background", src: "assets/images/slot-machine1.png" },
    { id: "clicked", src: "assets/audio/clicked.wav" }
];



var atlas = {
    "images": ["assets/images/atlas.png"],
    "frames": [

        [1, 3, 64, 64],
        [67,3, 64, 64],
        [133, 3, 64, 64],
        [199, 3, 64, 64],
        [264, 3, 64, 64],
        [330, 3, 64, 64],
        [394, 3, 64, 64],
        [3, 69, 49, 49],
        [53, 69, 49, 49],
        [103, 69, 49, 49],
        [153, 69, 49, 49],
        [203, 69, 49, 49],
        [253, 69, 49, 49],
        [303,69,64,64]
       
    ],
    "animations": {

        "appleSymbol": [0],
        "barSymbol": [1],
        "bellSymbol": [2],
        "cherrySymbol": [3],
        "diamondSymbol": [4],
        "orangeSymbol": [5],
        "watermelonSymbol": [6],
        "betMaxButton": [7],
        "betOneButton": [8],
        "resetButton": [9],
        "spinButton": [10],
        "simpleButton": [11],
        "betTenButton" : [12],
        "blankSymbol" : [13]
    }
};

// Game Variables

var background: createjs.Bitmap;
var game: createjs.Container;
var textureAtlas: createjs.SpriteSheet;
var spinButton: objects.Button;
var betOneButton: objects.Button;
var betTenButton: objects.Button;
var betMaxButton: objects.Button;
var resetButton: objects.Button;


// GAME VARIABLES
var playerMoney = 1000;
var winnings = 0;
var jackpot = 5000;
var turn = 0;
var playerBet = 0;
var winNumber = 0;
var lossNumber = 0;
var spinResult;
var fruits = "";
var winRatio = 0;


/* Tally Variables */
var apple = 0;
var bar = 0;
var bell = 0;
var cherry = 0;
var diamond = 0;
var orange = 0;
var watermelon = 0;
var blank = 0;


// Preloader Function
function preload()
{
    assets = new createjs.LoadQueue();
    assets.installPlugin(createjs.Sound);
    // event listener triggers when assets are completely loaded
    assets.on("complete", init, this);
    assets.loadManifest(manifest);

    // Load Texture Atlas
    textureAtlas = new createjs.SpriteSheet(atlas);

    //Setup statistics object
    setupStats();
}

// Callback function that initializes game objects
function init() {
    stage = new createjs.Stage(canvas); // reference to the stage
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60); // framerate 60 fps for the game

    // event listener triggers 60 times every second
    createjs.Ticker.on("tick", gameLoop); 

    // calling main game function
    main();
}

// function to setup stat counting
function setupStats() {
    stats = new Stats();
    stats.setMode(0); // set to fps

    // align bottom-right
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '330px';
    stats.domElement.style.top = '10px';

    document.body.appendChild(stats.domElement);
}


/* Utility function to reset all fruit tallies */
function resetFruitTally() {
    apple = 0;
    bar = 0;
    bell = 0;
    cherry = 0;
    diamond = 0;
    orange = 0;
    watermelon = 0;
    blank = 0;
}

/* Utility function to reset the player stats */
function resetAll() {
    playerMoney = 1000;
    winnings = 0;
    jackpot = 5000;
    turn = 0;
    playerBet = 0;
    winNumber = 0;
    lossNumber = 0;
    winRatio = 0;
}


// Callback function that creates our Main Game Loop - refreshed 60 fps
function gameLoop() {
    stats.begin(); // Begin measuring

    stage.update();

    stats.end(); // end measuring
}


/* Utility function to check if a value falls within a range of bounds */
function checkRange(value, lowerBounds, upperBounds) {
    if (value >= lowerBounds && value <= upperBounds) {
        return value;
    }
    else {
        return !value;
    }
}

/* When this function is called it determines the betLine results.
e.g. Bar - Orange - Banana */
function Reels() {
    var betLine = [" ", " ", " "];
    var outCome = [0, 0, 0];

    for (var spin = 0; spin < 3; spin++) {
        outCome[spin] = Math.floor((Math.random() * 65) + 1);
        switch (outCome[spin]) {
            case checkRange(outCome[spin], 1, 27):  // 41.5% probability
                betLine[spin] = "blank";
                blank++;
                break;
            case checkRange(outCome[spin], 28, 37): // 15.4% probability
                betLine[spin] = "apple";
                apple++;
                break;
            case checkRange(outCome[spin], 38, 46): // 13.8% probability
                betLine[spin] = "bar";
                bar++;
                break;
            case checkRange(outCome[spin], 47, 54): // 12.3% probability
                betLine[spin] = "bell";
                bell++;
                break;
            case checkRange(outCome[spin], 55, 59): //  7.7% probability
                betLine[spin] = "cherry";
                cherry++;
                break;
            case checkRange(outCome[spin], 60, 62): //  4.6% probability
                betLine[spin] = "diamond";
                diamond++;
                break;
            case checkRange(outCome[spin], 63, 64): //  3.1% probability
                betLine[spin] = "orange";
                orange++;
                break;
            case checkRange(outCome[spin], 65, 65): //  1.5% probability
                betLine[spin] = "watermelon";
                watermelon++;
                break;
        }
    }
    return betLine;
}




// Callback function that allows me to respond to button click events

function betOneButtonClicked(){
    createjs.Sound.play("clicked");
}

function betTenButtonClicked(){
    createjs.Sound.play("clicked");
}

function betMaxButtonClicked(){
    createjs.Sound.play("clicked");
}

function spinButtonClicked(event: createjs.MouseEvent) {
    //createjs.Sound.play("clicked");
    spinResult = Reels();
    fruits = spinResult[0] + " - " + spinResult[1] + " - " + spinResult[2];

    console.log(fruits);

    // Iterate over the number of reels
    for (var index = 0; index < NUM_REELS; index++) {
        reelContainers[index].removeAllChildren();
        tiles[index] = new createjs.Bitmap("assets/images/" + spinResult[index] + ".png");
        console.log("assets/images/" + spinResult[index] + ".png");
        reelContainers[index].addChild(tiles[index]);
    }
}


function createUI() {

    background = new createjs.Bitmap(assets.getResult("background"));
    game.addChild(background); // Add the background to the game container

    for (var index = 0; index < NUM_REELS; index++) {
        reelContainers[index] = new createjs.Container();
        game.addChild(reelContainers[index]);
        tiles[index] = new createjs.Bitmap("assets/images/spinReel.png");
        reelContainers[index].addChild(tiles[index]);
    }
    reelContainers[0].x = 57;
    reelContainers[0].y = 173;
    reelContainers[1].x = 132;
    reelContainers[1].y = 173;
    reelContainers[2].x = 207;
    reelContainers[2].y = 173;

   

    // add betOneButton
    betOneButton = new objects.Button("betOneButton", 17, 334, false);
    game.addChild(betOneButton);
    betOneButton.on("click", betOneButtonClicked, this);

    // add betTenButton 
    betTenButton = new objects.Button("betTenButton", 77, 334, false);
    game.addChild(betTenButton);
    betTenButton.on("click", betTenButtonClicked, this);

    // add betMaxButton 
    betMaxButton = new objects.Button("betMaxButton", 137 , 334, false);
    game.addChild(betMaxButton);
    betMaxButton.on("click", betMaxButtonClicked, this);
    
    // add spinButton 
    spinButton = new objects.Button("spinButton", 197, 334, false);
    game.addChild(spinButton);
    spinButton.on("click", spinButtonClicked, this);

    // add power Button
    resetButton = new objects.Button("resetButton", 257, 334, false);
    game.addChild(resetButton);
    spinButton.on("click", spinButtonClicked, this);


}


function main() {
    game = new createjs.Container(); // Instantiates the Game Container

    createUI();

    stage.addChild(game); // Adds the Game Container to the Stage
    

}



/* Our Main Game Function
function main() {
    //slot machine graphics
   
    background = new createjs.Bitmap(assets.getResult("background"));
    stage.addChild(background);

    // add betOneButton
    betOneButton = new objects.Button("betOneButton", 45, 334, false);
    stage.addChild(betOneButton);
    betOneButton.on("click", betOneButtonClicked, this);

    // add betTenButton 
    betTenButton = new objects.Button("betTenButton", 105, 334, false);
    stage.addChild(betTenButton);
    betTenButton.on("click", betTenButtonClicked, this);

    // add betMaxButton 
    betMaxButton = new objects.Button("betMaxButton", 165, 334, false);
    stage.addChild(betMaxButton);
    betMaxButton.on("click", betMaxButtonClicked, this);
    
    // add spinButton 
    spinButton = new objects.Button("spinButton", 225, 334, false);
    stage.addChild(spinButton);
    spinButton.on("click", spinButtonClicked, this);


    for (var index = 0; index < NUM_REELS; index++) {
        reelContainers[index] = new createjs.Container();
        stage.addChild(reelContainers[index]);
    }
    reelContainers[0].x = 128;
    reelContainers[0].y = 296;
    reelContainers[1].x = 248;
    reelContainers[1].y = 296;
    reelContainers[2].x = 374;
    reelContainers[2].y = 296;

}*/