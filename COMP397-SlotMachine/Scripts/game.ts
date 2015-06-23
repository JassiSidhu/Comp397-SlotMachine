//  Source File Name: COMP397 - SlotMachine
//  Author: Jaswinder Sidhu 
//  Description: A web application of Slot Machine which involves betting some amount
//  and spinning  the reels for win or lose condition  
//  Last Modified By: Jaswinder Sidhu  
//  Date last modified: June 22, 2015 
//  Revised: 5 times   

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

        [0, 0, 49, 49],
        [50,0, 49, 49],
        [101, 0, 49, 49],
        [153, 0, 48, 49],
        [202, 0, 50, 50],
        [254,0,50,50],
               
    ],
    "animations": {

        "betMaxButton": [0],
        "betOneButton": [1],
        "betTenButton": [2],
        "spinButton":   [3],
        "powerButton" : [4],
        "resetButton" : [5]
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
var powerButton: objects.Button;
var jackpotLabel: objects.Label;
var playerCreditLabel: objects.Label;
var playerBetLabel: objects.Label;
var spinResultLabel: objects.Label;
var resultLabel: objects.Label;

// GAME VARIABLES
var playerMoney = 1000;
var winnings = 0;
var jackpot = 5000;
var turn = 0;
var playerBet = 10;
var winNumber = 0;
var lossNumber = 0;
var spinResult;
var fruits = "";
var winRatio = 0;


// Tally Variables 
var apple = 0;
var grapes = 0;
var horseshoe = 0;
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

    // alignment
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '840px';
    stats.domElement.style.top = '120px';

    document.body.appendChild(stats.domElement);
}

// function to show Player Stats 
function showPlayerStats() {
    winRatio = winNumber / turn;
    jackpotLabel.text = jackpot.toString();
    playerCreditLabel.text = playerMoney.toString();
    playerBetLabel.text = playerBet.toString();
   
}



// function to reset all fruit tallies 
function resetFruitTally() {
    apple = 0;
    grapes = 0;
    horseshoe = 0;
    bar = 0;
    bell = 0;
    cherry = 0;
    diamond = 0;
    orange = 0;
    watermelon = 0;
    blank = 0;
}

// function to reset the player stats 
function resetAll() {
    spinButton.mouseEnabled = true;
    playerMoney = 1000;
    winnings = 0;
    jackpot = 5000;
    turn = 0;
    playerBet = 0;
    winNumber = 0;
    lossNumber = 0;
    winRatio = 0;
    spinResultLabel.text = "0";
}

// Check to see if the player won the jackpot 
function checkJackPot() {
    // compare two random values 
    var jackPotTry = Math.floor(Math.random() * 51 + 1);
    var jackPotWin = Math.floor(Math.random() * 51 + 1);
    if (jackPotTry == jackPotWin) {
        alert("You Won the $" + jackpot + " Jackpot!!");
        playerMoney += jackpot;
        jackpot = 1000;
    }
}

// Callback function that creates our Main Game Loop - refreshed 60 fps
function gameLoop() {
    stats.begin(); // Begin measuring

    stage.update();

    stats.end(); // end measuring
}


// function to check if a value falls within a range of bounds 
function checkRange(value, lowerBounds, upperBounds) {
    if (value >= lowerBounds && value <= upperBounds) {
        return value;
    }
    else {
        return !value;
    }
}


// function to show a win message and increase player money 
function showWinMessage() {
    playerMoney += winnings;
    spinResultLabel.text = winnings.toString();
    resultLabel.text =  "You Win";
    resetFruitTally();
    checkJackPot();
}

// function to show a loss message and reduce player money 
function showLossMessage() {
    playerMoney -= playerBet;
    spinResultLabel.text = "-" + playerBet.toString();
    resultLabel.text = "You Lose";
    resetFruitTally();
}

// When this function is called it determines the betLine results.
//e.g. Bar - Orange - Banana 
function Reels() {
    var betLine = [" ", " ", " "];
    var outCome = [0, 0, 0];

    for (var spin = 0; spin < 3; spin++) {
        outCome[spin] = Math.floor((Math.random() * 65) + 1);
        switch (outCome[spin]) {
            case checkRange(outCome[spin], 1, 27): 
                betLine[spin] = "blank";
                blank++;
                break;
            case checkRange(outCome[spin], 1, 32):  
                betLine[spin] = "grapes";
                grapes++;
                break;
            case checkRange(outCome[spin], 28, 37): 
                betLine[spin] = "apple";
                apple++;
                break;
            case checkRange(outCome[spin], 38, 40): 
                betLine[spin] = "bar";
                bar++;
                break;
            case checkRange(outCome[spin], 38, 46): 
                betLine[spin] = "horseshoe";
                horseshoe++;
                break;
            case checkRange(outCome[spin], 47, 54): 
                betLine[spin] = "bell";
                bell++;
                break;
            case checkRange(outCome[spin], 55, 59): 
                betLine[spin] = "cherry";
                cherry++;
                break;
            case checkRange(outCome[spin], 60, 62): 
                betLine[spin] = "diamond";
                diamond++;
                break;
            case checkRange(outCome[spin], 63, 64):
                betLine[spin] = "orange";
                orange++;
                break;
            case checkRange(outCome[spin], 65, 65): 
                betLine[spin] = "watermelon";
                watermelon++;
                break;
        }
    }
    return betLine;
}


// This function calculates the player's winnings, if any 
function determineWinnings() {
    if (blank == 0) {
        if (apple == 3) {
            winnings = playerBet * 10;
        }
        else if (grapes == 3) {
            winnings = playerBet * 15;
        }
        else if (bar == 3) {
            winnings = playerBet * 20;
        }
        else if (orange == 3) {
            winnings = playerBet * 30;
        }
        else if (cherry == 3) {
            winnings = playerBet * 40;
        }
        else if (diamond == 3) {
            winnings = playerBet * 50;
        }
        else if (watermelon == 3) {
            winnings = playerBet * 75;
        }
        else if (horseshoe == 3) {
            winnings = playerBet * 80;
        }
        else if (bell == 3) {
            winnings = playerBet * 100;
        }
        else if (apple == 2) {
            winnings = playerBet * 2;
        }
        else if (grapes == 2) {
            winnings = playerBet * 3;
        }
        else if (bar == 2) {
            winnings = playerBet * 4;
        }
        else if (orange == 2) {
            winnings = playerBet * 5;
        }
        else if (cherry == 2) {
            winnings = playerBet * 6;
        }
        else if (diamond == 2) {
            winnings = playerBet * 7;
        }
        else if (watermelon == 2) {
            winnings = playerBet * 10;
        }
        else if (horseshoe == 2) {
            winnings = playerBet * 15;
        }
        else if (bell == 2) {
            winnings = playerBet * 20;
        }
        else {
            winnings = playerBet * 1;
        }

        if (bell == 1) {
            winnings = playerBet * 5;
        }
        winNumber++;
        showWinMessage();
    }
    else {
        lossNumber++;
        showLossMessage();
    }

}


// Callback function that allows me to respond to button click events

//button click to quit the game
function powerButtonClicked() {
    alert("Thank you for playing the game");
    window.close();
}

//button click to reset the game
function resetButtonClicked() {
    resetAll();
    showPlayerStats();
}

//button click to place $1 bet
function betOneButtonClicked(){
    playerBetLabel.text = "1";
}

//button click to place $10 bet
function betTenButtonClicked(){
    playerBetLabel.text = "10";
}

//button click to bet all the player credit
function betMaxButtonClicked(){
    playerBetLabel.text = playerMoney.toString();
}

//button click to spin the reels
function spinButtonClicked(event: createjs.MouseEvent) {

    playerBet = parseInt(playerBetLabel.text);
   
    if (playerMoney == 0) {
        spinButton.mouseEnabled = false;
        if (confirm("You ran out of Money! \nDo you want to play again?")) {
            resetAll();
            showPlayerStats();
        }
    }
    else if (playerBet > playerMoney) {
        spinButton.mouseEnabled = false;
        alert("You don't have enough Money to place that bet.");
    }
    else if (playerBet < 0) {
        spinButton.mouseEnabled = false;
        alert("All bets must be a positive $ amount.");
    }
    else if (playerBet <= playerMoney) {
        spinButton.mouseEnabled = true;
        spinResult = Reels();
        fruits = spinResult[0] + " - " + spinResult[1] + " - " + spinResult[2];
        // Iterate over the number of reels
        for (var index = 0; index < NUM_REELS; index++) {
            reelContainers[index].removeAllChildren();
            tiles[index] = new createjs.Bitmap("assets/images/" + spinResult[index] + ".png");
            console.log("assets/images/" + spinResult[index] + ".png");
            reelContainers[index].addChild(tiles[index]);
        }
        determineWinnings();
        turn++;
        showPlayerStats();
    }
    else {
        alert("Please enter a valid bet amount");
    }
}




// Function to add slot machine graphics
function createUI() {
     // Add the background(slot machine image) to the game container
    background = new createjs.Bitmap(assets.getResult("background"));
    game.addChild(background);

    //Add Jackpot label to game container
    jackpotLabel = new objects.Label(jackpot.toString(), 130, 101, false);
    game.addChild(jackpotLabel);

    //Add player credit and spin result labels to game containetr
    playerCreditLabel = new objects.Label(playerMoney.toString(), 30, 301, false);
    game.addChild(playerCreditLabel);
    
    spinResultLabel = new objects.Label("0",228,301,false);
    game.addChild(spinResultLabel);

    resultLabel = new objects.Label("Start", 125, 42, false);
    game.addChild(resultLabel);

    //Add Player bet textbox to game container
    playerBetLabel = new objects.Label(playerBet.toString(), 130, 301, false);
    game.addChild(playerBetLabel);

    //Adding reels to game container
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
    betOneButton = new objects.Button("betOneButton", 50, 334, false);
    game.addChild(betOneButton);
    betOneButton.on("click", betOneButtonClicked, this);

    // add betTenButton 
    betTenButton = new objects.Button("betTenButton", 110, 334, false);
    game.addChild(betTenButton);
    betTenButton.on("click", betTenButtonClicked, this);

    // add betMaxButton 
    betMaxButton = new objects.Button("betMaxButton", 170 , 334, false);
    game.addChild(betMaxButton);
    betMaxButton.on("click", betMaxButtonClicked, this);
    
    // add spinButton 
    spinButton = new objects.Button("spinButton", 230, 334, false);
    game.addChild(spinButton);
    spinButton.on("click", spinButtonClicked, this);

    // add reset Button
    resetButton = new objects.Button("resetButton", 235, 42, false);
    game.addChild(resetButton);
    resetButton.on("click", resetButtonClicked, this);

    //add power button
    powerButton = new objects.Button("powerButton", 38, 42, false);
    game.addChild(powerButton);
    powerButton.on("click", powerButtonClicked, this);

}

// Our Main Function
function main() {
    game = new createjs.Container(); // Instantiates the Game Container

    createUI();                 //create slot machine graphics

    stage.addChild(game); // Adds the Game Container to the Stage

}



