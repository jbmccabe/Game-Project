/*
Kody Fong
Jackson McCabe
Aj Miranda
Final Game Prototype
 Path to repository(there are multiple branches): https://github.com/jbmccabe/Game-Project
 */

 var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser');



 var slashEffect;
 var hitConfirm;
 var healthBar;
 var staminaBar;


var MainMenu = function(game){}; //Main Menu state
MainMenu.prototype = {
  init: function(){},
  preload: function() //preload all assets here
  {

   game.load.image('background', 'assets/BackgroundFIRE.png');
   game.load.image('buildings', 'assets/BuildingFIRE.png');
   game.load.image('pillars', 'assets/PillarsFIRE.png');
   game.load.image('menu','assets/menuArt.png');
   //game.load.image('floor', 'assets/GroundFire.png');
   game.load.image('floor', 'assets/ground.png');//replace this
   game.load.atlas('fatZombie', 'assets/giantAtlas.png','assets/giantHash.json');
   game.load.atlas('smallZombie', 'assets/small_ZAtlas.png', 'assets/small_zombie.json');
   game.load.atlas('character', 'assets/prototypeAtlas.png', 'assets/jsonHash.json');
   game.load.audio('slash','assets/slash.mp3');
   game.load.audio('hitConfirm', 'assets/hitConfirm.mp3');
   game.load.image('hp', 'assets/healthBar.png');
   game.load.image('stamina', 'assets/staminaBar.png');

 },
  create: function() //add text and background color
  {
    //game.stage.backgroundColor = "#FF4500";
    menu = game.add.sprite(0, 0, 'menu');
    menu.scale.setTo(.57,.57);
    game.add.text(550, 128+128, 'Use A and D Keys to Move.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(550, 192+128, 'Press Shift to Forward Slash.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(550, 256+128, 'Press Enter to Combo Slash.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(550, 320+128, 'Press SPACEBAR to start!', {fontSize: '16px', fill: '#ffffff'});

  },
  update: function() //start game with spacebar
  {
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)){
      menu.destroy;
      game.state.start('Play');
    }
  }
}

var Play = function(game){}; //Play state

var currentStamina = 1; //global variable that stores the stamina for the player
var currentHealth = 1; //global variable that stores the hp for the player
var current_time;
var last_spawn_time=0;
var time_until_spawn=3500;
var zombies;
var last_attack_time=0;
var last_combo_attack_time=0;
var invulnFrames=300; //number of frames players is invuln after getting hit
var lastPlayerHit=0;
var player_attack_cooldown=1100;


Play.prototype = {

  init: function() 
  {
    //this.score = 0;
   // this.highScore = 0;
 },
 preload: function(){},
 create: function()
 {

  space = game.add.tileSprite(0, 0, game.width, game.height, 'background');  //adds the moving background

  pillars = game.add.tileSprite(0, 0, game.width,game.height, 'pillars'); //adds the moving pillars
  game.physics.arcade.enable(pillars);
  pillars.enableBody = true; 
  pillars.body.immovable = true;

  buildings = game.add.tileSprite(0, 0, game.width,game.height, 'buildings'); //adds the moving buildings
  game.physics.arcade.enable(buildings);
  buildings.enableBody = true;
  buildings.body.immovable = true;

  //only used for gorund texture, removed collision because it prevented jumping
  platform = game.add.tileSprite(0, 505, game.width,500, 'floor'); //adds the moving floor
  platform.enableBody = true; //enables the body


  //ivisible platform for player to stand on
  invisPlatform=game.add.sprite(0,game.height-10);
  game.physics.arcade.enable(invisPlatform); //enables physica on the ground
  invisPlatform.scale.setTo(game.width,1);


  player = game.add.sprite(150,game.world.height-100,'character'); //creates a playable character at the bottom of the screen
  player.enableBody = true; 
  game.physics.arcade.enable(player);
  //play.body.allowGravity=true;
  player.body.gravity.y=3000;
  player.body.collideWorldBounds = true; //collision within the boundaries of the game
    

  player.animations.add('forwardSlash', ['Hero0', 'Hero1', 'Hero2', 'Hero3','Hero0'], 5, false ); //adds the animations
  player.animations.add('comboSlash', ['Hero3','Hero4', 'Hero5', 'Hero6', 'Hero7','Hero0' ], 5, false);
  //player.animations.add('neutral', ['frame6'], 10, false);  // *** NEEDS WALKING ANIMATION ***


  //player hitbox for checking monster attacks
  playerHitbox=game.add.sprite(player.x+112,player.y+20);
  playerHitbox.enableBody=true;
  game.physics.arcade.enable(playerHitbox);
  playerHitbox.scale.setTo(64,128)


  //create zombies group
  zombies=game.add.group();
  let sprite = zombies.create(1000,1000,'smallZombie');
  zombies.enableBody=true;
  game.physics.arcade.enable(zombies);
  sprite.health=2;
  sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
  sprite.movementTimer=false;

  slashEffect = game.add.audio('slash'); //adds slash sound effect
  hitConfirm = game.add.audio('hitConfirm'); //adds a effect for a hit confirm

  healthBar = game.add.sprite(0,0, 'hp');
  staminaBar = game.add.sprite(500,0,'stamina');
  //healthBarBackground = game.add.sprite(0,0, 'hp'); //create background for healthbar to make max life and loss of life more noticable

},//end create

update: function(){
  //MOVEMENT OF BACKGROUND
  platform.tilePosition.x -= 3;   
  space.tilePosition.x -= 0;
  pillars.tilePosition.x -= 2.6; 
  buildings.tilePosition.x -= 2.8; 
  player.body.velocity.x=0;

  //i think we could just add a int to zombies when spawned that scales their hitbox size
  //update zombie movement and control resume their walk animations
  for (var i = 0, len = zombies.children.length; i < len; i++) {
    if(zombies.children[i].movementTimer<=0){//check if zombies are stunned
      zombies.children[i].movementTimer=0;
      zombies.children[i].animations.play('walk');

      //make sure zombies dont walk past player
      if(zombies.children[i].x<player.body.x+150){
        zombies.children[i].body.velocity.x=0;
      }

      //zombie movement speed
      switch(zombies.children[i].type){
        case 'giant':{
          zombies.children[i].body.velocity.x=-200;  
          break;
        }
        case 'small':{
          if(zombies.children[i].body.velocity.x>-200){
            zombies.children[i].body.velocity.x=-180;  
          }
          break;
        }
      }//end switch
    }//end if
    else{//decrement movementTimer to unstun
      if(zombies.children[i].body.velocity.x>-100){
        zombies.children[i].body.velocity.x=0; 
      }
      zombies.children[i].movementTimer-=1;
      //make sure zombies dont walk past player
      if(zombies.children[i].x<player.body.x+210){
        zombies.children[i].body.velocity.x=0;
      }
    }

    //zombie attack hitbox
    if(zombies.children[i].frameName == 'zombie4' || zombies.children[i].frameName == 'giant2' ){
      switch(zombies.children[i].type){
        case 'giant':{
          var zBox = game.add.sprite(zombies.children[i].x - 20, zombies.children[i].y+50);
          zBox.enableBody=true;
          game.physics.arcade.enable(zBox);
          zBox.allowGravity = false;
          zBox.scale.x=30;
          zBox.scale.y=100;
          game.physics.arcade.overlap(playerHitbox,zBox,damagePlayer,null,this);
          zBox.destroy();
          break;
        }//case giant
        case 'small':{
          var zBox = game.add.sprite(zombies.children[i].x - 20, zombies.children[i].y+50);
          zBox.enableBody=true;
          game.physics.arcade.enable(zBox);
          zBox.allowGravity = false;
          zBox.scale.x=20;
          zBox.scale.y=100;
          game.physics.arcade.overlap(playerHitbox,zBox,damagePlayer,null,this);
          zBox.destroy();
          break;
        }//case small
      }//switch
    }//if
  }//end zombie update loop   

  game.physics.arcade.collide(player, platform); //check for collision with the ground and player
  //game.physics.arcade.collide(zombies, player);//monster collision hitboxes are scuffed


  game.physics.arcade.overlap(player, zombies,overlapPlayer,null,this);

  current_time = game.time.time;//used for spawning mobs and attack cooldown


  //check for correct attack frame then spawn hitbox and call damage enemy function
  if(player.frameName == 'Hero2' || player.frameName == 'Hero4' || player.frameName == 'Hero5' || player.frameName == 'Hero7'){
    var swordBox = game.add.sprite(player.x + 170, player.y+50);
    swordBox.enableBody=true;
    game.physics.arcade.enable(swordBox);
    swordBox.allowGravity = false;
    swordBox.scale.x=200;
    swordBox.scale.y=100;
    game.physics.arcade.overlap(swordBox, zombies,damageEnemy,null,this);
    swordBox.destroy();
  }

  if(currentStamina < 1.0)
  {
    currentStamina += 0.001;
    staminaBar.scale.setTo(currentStamina,1);
  }
  if(currentStamina > 0.25)
  {


  if(game.input.keyboard.isDown(Phaser.Keyboard.SHIFT) && current_time - last_attack_time > player_attack_cooldown){
    player.animations.play('forwardSlash'); //forward slash animation
    slashEffect.play();//play sword sound
    currentStamina -= 0.25;
    staminaBar.scale.setTo(currentStamina, 1);

    last_attack_time=game.time.time;
  }
  else if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && current_time - last_combo_attack_time > player_attack_cooldown){
    player.animations.play('comboSlash');
    slashEffect.play();//play sword sound
    last_combo_attack_time=game.time.time;
    currentStamina -= 0.25;
    staminaBar.scale.setTo(currentStamina, 1);
  }

  }
  if(game.input.keyboard.isDown(Phaser.Keyboard.D)){    
    player.body.velocity.x=220;
  }

  else if(game.input.keyboard.isDown(Phaser.Keyboard.A)){
    player.body.velocity.x=-280;
  }
  if(currentStamina >= 0.10)
  {


  if(game.input.keyboard.isDown(Phaser.Keyboard.W) && player.body.blocked.down){
    player.body.velocity.y=-1000;
    player.midair=true;
    currentStamina -= 0.10;
    staminaBar.scale.setTo(currentStamina, 1);
  }
}










  //////////////////
  //MONSTER SPAWNING
  //////////////////
  //increase spawn rate over time
  if(time_until_spawn>600){
    time_until_spawn-=.5;
  }

  current_time = game.time.time;//used for spawning mobs
  //spawn zombies
  //CREATE SPAWN FUNCTIONS FOR ZOMBIES LATER, ADD MULTIPLE SPAWNS AT ONCE
  if(current_time - last_spawn_time > time_until_spawn){
  //time_until_spawn = Math.random()*3000 + 2000;  Uncomment this to add random spawn times.
    last_spawn_time = current_time;
    var rng=Math.random()*10;
    if(game.input.keyboard.isDown(Phaser.Keyboard.B)){//TEMPORARILY DISABLED. HIT B TO SPAWN TEST GIANT To enable check if rng<2 or some other int
      let sprite = zombies.create(800,380,'fatZombie');
      sprite.health=10;
      sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
      sprite.movementTimer=0;
      sprite.type='giant';
      sprite.animations.add('attack', ['giant0','giant1','giant2','giant0'] , 2, false,false);
      sprite.animations.add('walk', ['giant0'],1,true,false);
    }//innner if
    else{
      let sprite = zombies.create(800,Math.random()*60 + 400,'smallZombie');
      sprite.heatlh=1;
      sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
      sprite.movementTimer=0;
      sprite.type='small';
      sprite.animations.add('stand',['zombie0'],1,false);
      sprite.animations.add('walk', ['zombie0','zombie1'] , 1.5, true, false)
      sprite.animations.add('attack', ['zombie1','zombie2','zombie3','zombie4','zombie1'] , 6, false,false);
      sprite.animations.play('walk',['zombie0','zombie1'], 2.5, true, true);
    }//else
  }﻿//end outer if


  //add timer to reset to Hero0 frame


  }//update
}//play prototype

var GameOver = function(game){}; //Game Over state
GameOver.prototype = {
  init: function() //stores the score the player got
  {
    //this.score = points;
  },
  preload: function(){},
  create: function() //Game Over text
  {
    game.add.text(16, 64, 'Game Over!', {fontSize: '32px', fill: '#ffffff'});
    game.add.text(16, 192, 'Press SPACEBAR to start over!', {fontSize: '32px', fill: '#ffffff'});
  },
  update: function() //start game again
  {
     currentStamina = 1; //reset stamina back to full
     currentHealth = 1; //resets hp back to full
     if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
      game.state.start('Play');

  }
}//gameover prototype

//////////////////////////////////////
//FUNCTIONS
//////////////////////////////////////

//freezes enemy after they attack
function overlapPlayer( player, monster){
  if(monster.movementTimer<=0){
    monster.animations.play('attack');
    monster.movementTimer=100;
    if(monster.type='small'){
      monster.body.velocity.x=-80;
    }
  }
 // monster.animations.play('stand');
}

function damagePlayer(player,zBox){
  if(game.time.time-lastPlayerHit>invulnFrames){
    currentHealth -= 0.1;    
    lastPlayerHit=game.time.time;
  }

  healthBar.scale.setTo(currentHealth, 1);
  if(currentHealth <= 0)//BUG player is dying only when health is negative for some reason
  {
    game.state.start('GameOver');
  }
}

function damageEnemy(player,monster){
  if(current_time-monster.last_hit_time>200){
    monster.last_hit_time=current_time;
    monster.health-=1;
  }
  if(monster.health<=0){
    hitConfirm.play();
    monster.destroy();
    if(currentHealth < 1.0){
      currentHealth += 0.01;
      healthBar.scale.setTo(currentHealth, 1); //incorporates a little bit of healing per kill
    }
  }



  //play death sound
  //http://www.html5gamedevs.com/topic/11047-problem-with-destroy/  recycle sprites to improve performance
}


game.state.add('MainMenu', MainMenu); //add mainmenu state
game.state.add('Play', Play);         //add play state
game.state.add('GameOver', GameOver); //add gameover state
game.state.start('MainMenu'); //start with MainMenu