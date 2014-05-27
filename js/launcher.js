var game = new Phaser.Game(300, 500, Phaser.AUTO, 'test', {preload: preload, create: create, update: update});
var cursors;
var enter;
var player;
var tnts;
var chests;
var tnt;
var chest;
var tntSound;
var chestSound;
var gameOverMessage;
var volumeButton;
var scoreText;
var maxScoreText;
var gameOverMessage;

var scoreString = 'Score : ';
var maxScoreString = "Max score : ";
var score = 0;
var maxScore;
var isPopTime = 0;


/**
Phaser functions
*/

function preload() {
    game.load.image("background", "images/texture.gif");
    game.load.image("player", "images/player.gif");
    game.load.image("tnt", "images/tntCrate.gif");
    game.load.image("chest", "images/chest.gif");
    game.load.image("volumeButton", "images/volume.gif");
    
    game.load.audio("chestSound", "audio/chest.mp3");
    game.load.audio("tntSound", "audio/tnt.mp3");
    
    cursors = game.input.keyboard.createCursorKeys();
    enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    game.stage.disableVisibilityChange = true;
    
    if(!localStorage.maxScore) localStorage.maxScore = 0;
    
    maxScore = localStorage.maxScore;
    
}

function create(){
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.add.tileSprite(0, 0, 300, 600, "background");
    volumeButton = game.add.button(260, 0, "volumeButton", changeVolume, this);
    createPlayer();
    createtnts();
    createchests();
    
    chestSound = game.add.audio("chestSound");
    chestSound.volume = 0.5;
    tntSound = game.add.audio("tntSound");
    tntSound.volume = 0.5;
    
    maxScoreText = game.add.text(10, 35, maxScoreString + maxScore, { font: '22px Courier New', fill: '#fff' });
    scoreText = game.add.text(10, 10, scoreString + score, { font: '22px Courier New', fill: '#fff' });
    gameOverMessage = game.add.text(10, game.world.centerY - 25,"", {font: "25px Courier New", fill: "#fff"});

}

function update() {

    if(player.alive) {
        player.body.velocity.setTo(0, 0);
        
        if(cursors.left.isDown) {
            player.scale.x = 1; // Standard x direction
            player.body.velocity.x = -350;
        } else if (cursors.right.isDown) {
            player.scale.x = -1; // Reversed x direction
            player.body.velocity.x = 350;
        }
        
        isPopTime = (isPopTime + 1) % 30;
        
        if(isPopTime == 0 || isPopTime == 10) poptnt();
        else if(isPopTime == 20) popchest();
        
        game.physics.arcade.overlap(tnts, player, onCollision, null, this);
        game.physics.arcade.overlap(chests, player, onChestCollision, null, this);
    }
}

function createPlayer() {
    player = game.add.sprite(game.world.centerX, 583, "player");
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
}

function createtnts() {
    tnts = game.add.group();
    tnts.enableBody = true;
    tnts.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(tnts, true);
    tnts.createMultiple(10, "tnt");
    tnts.setAll("anchor.x", 0.5);
    tnts.setAll("anchor.y", 0.5);
    tnts.setAll("outOfBoundsKill", true);
    tnts.setAll("checkWorldBounds", true);
}

//Used to initialise the group 
function createchests() {
    chests= game.add.group();
    chests.enableBody = true;
    chests.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(chests, true);
    chests.createMultiple(4, "chest");
    chests.setAll("anchor.x", 0.5);
    chests.setAll("anchor.y", 0.5);
    chests.setAll("outOfBoundsKill", true);
    chests.setAll("checkWorldBounds", true);
}

/**
Game functions
*/

//Put TNTs in the game
function poptnt() {
    tnt = tnts.getFirstDead();
    if(tnt) {
        tnt.reset(game.rnd.integerInRange(0,37) * 8, 15); // Center position from 0 to 296
        tnt.body.velocity.y = 400;
    }
}

//Put chests in the game
function popchest() {
    chest = chests.getFirstDead();
    if(chest) {
        chest.reset(game.rnd.integerInRange(0,37) * 8, 15); // Center position from 0 to 296
        chest.body.velocity.y = 400;
    }
}

//Handles the death of the player when encountering some friendly TNT
function onCollision(player, tnt) {
    player.kill();
    tntSound.play();
    tnts.setAll("body.velocity.y", 0);
    chests.setAll("body.velocity.y", 0);
    chests.callAll("kill");
    tnts.callAll("kill");
    
    if(maxScore < score) {
        maxScore = score;
        localStorage.maxScore = maxScore;
    }
    
    gameOverMessage.text = "Press enter key to \nplay again";
    gameOverMessage.align = "center";
    enter.onDown.addOnce(restart,this);
}

//Rewards the player with one point and remove the chest frome the view
function onChestCollision(player, chest) {
    chestSound.play();
    chest.kill();
    score++;
    scoreText.text = scoreString + score;
}
    
//Resurrects the player and reset the score
function restart() {
    enter.onDown.remove(restart,this);
    score = 0;
    gameOverMessage.text = "";
    scoreText.text = scoreString + score;
    maxScoreText.text = maxScoreString + maxScore;
    player.reset(game.world.centerX, 583);
}

function changeVolume() {
    tntSound.volume = - (tntSound.volume - 0.5);
    chestSound.volume = - (chestSound.volume - 0.5);
}