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


var MainMenu = function(game){}; //Main Menu state
MainMenu.prototype = {
  init: function(){},
  preload: function() //preload all assets here
  {

   game.load.image('background', 'assets/BackgroundFIRE.png');
   game.load.image('buildings', 'assets/BuildingFIRE.png');
   game.load.image('pillars', 'assets/pillarsFIRE.png');
   game.load.image('floor', 'assets/GroundFire.png');
   //game.load.image('floor', 'assets/ground.png');//replace this
   game.load.image('fatZombie', 'assets/giant.png');
   game.load.atlas('smallZombie', 'assets/small_ZAtlas.png', 'assets/small_zombie.json');
   game.load.atlas('character', 'assets/prototypeAtlas.png', 'assets/jsonHash.json');
   game.load.audio('slash','assets/slash.mp3');
   game.load.audio('hitConfirm', 'assets/hitConfirm.mp3');
   game.load.image('hp', 'assets/healthBar.png');
 },
  create: function() //add text and background color
  {
    game.stage.backgroundColor = "#FF4500";
    game.add.text(25, 64, 'Side Scroller Prototype.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(25, 128, 'Use A and D Keys to Move.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(25, 192, 'Press Shift to Forward Slash.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(25, 256, 'Press Enter to Combo Slash(insane combo).', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(25, 320, 'Press SPACEBAR to start!', {fontSize: '16px', fill: '#ffffff'});

  },
  update: function() //start game with spacebar
  {
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
      game.state.start('Play');
  }
}

var Play = function(game){}; //Play state

var currentHealth = 1; //global variable that stores the hp for the player
var current_time;
var last_spawn_time=0;
var time_til_spawn=5000;
var zombies;
var last_attack_time=0;
var last_combo_attack_time=0;
var invulnFrames=300; //number of frames players is invuln after getting hit
var lastPlayerHit=0;


Play.prototype = {

  init: function() 
  {
    //this.score = 0;
   // this.highScore = 0;
 },
 preload: function(){},
 create: function()
 {

    space = game.add.tileSprite(0, 0, 800, 600, 'background');  //adds the moving background
    //buildings = game.add.tileSprite(0, 0, 800, 600, 'buildings');  //adds the moving background
    //pillars = game.add.tileSprite(0, 0, 800, 600, 'pillars');  //adds the moving background

    pillars = game.add.tileSprite(0, 0, 800,600, 'pillars'); //adds the moving pillars
    game.physics.arcade.enable(pillars);
    pillars.enableBody = true; 
    pillars.body.immovable = true;

    buildings = game.add.tileSprite(0, 0, 800,600, 'buildings'); //adds the moving buildings
    game.physics.arcade.enable(buildings);
    buildings.enableBody = true;
    buildings.body.immovable = true;

    platform = game.add.tileSprite(0, 0, 800,600, 'floor'); //adds the moving floor
    game.physics.arcade.enable(platform); //enables physica on the ground
    platform.enableBody = true; //enables the body
    platform.body.immovable = true; //makes the platform not fall when touched


    player = game.add.sprite(150,game.world.height-100,'character'); //creates a playable character at the bottom of the screen
    player.enableBody = true; 
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true; //collision within the boundaries of the game
    

    player.animations.add('forwardSlash', ['Hero0', 'Hero1', 'Hero2', 'Hero3','Hero0'], 5, false ); //adds the animations
    player.animations.add('comboSlash', ['Hero3','Hero4', 'Hero5', 'Hero6', 'Hero7','Hero0' ], 5, false);
    //player.animations.add('neutral', ['frame6'], 10, false);  // *** NEEDS WALKING ANIMATION ***


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
     //healthBar.scale.setTo(0.75,1); WILL BE USED FOR TAKING DAMAGE. ONLY TEMPORARY.
},//end create

update: function() {

  //MIGHT NEED TO MAKE DIFFERENT SIZE zBox SPAWN FOR GIANTS
  //i think we could just add a int to zombies when spawned that scales their hitbox size
  //update zombie movement and control resume their walk animations
  for (var i = 0, len = zombies.children.length; i < len; i++) {
    if(zombies.children[i].movementTimer<=0){//check if zombies are stunned
      zombies.children[i].body.velocity.x=-40;  
      zombies.children[i].movementTimer=0;
      zombies.children[i].animations.play('walk');
    }
    else{//decrement movementTimer
      zombies.children[i].body.velocity.x=0;
      zombies.children[i].movementTimer-=1;
    }

    //zombie hitbox
    if(zombies.children[i].frameName == 'zombie4'){
      var zBox = game.add.sprite(zombies.children[i].x - 20, zombies.children[i].y+50);
      zBox.enableBody=true;
      game.physics.arcade.enable(zBox);
      zBox.allowGravity = false;
      zBox.scale.x=20;
      zBox.scale.y=100;
      game.physics.arcade.overlap(player,zBox,damagePlayer,null,this);
      zBox.destroy();
    }
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

        swordBox.kill();
      }

      if(game.input.keyboard.isDown(Phaser.Keyboard.SHIFT) && current_time - last_attack_time > 1000)
      {
        player.animations.play('forwardSlash'); //forward slash animation
        slashEffect.play();//play sword sound
        last_attack_time=game.time.time;
      }
      if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && current_time - last_combo_attack_time > 1000)
      {
        player.animations.play('comboSlash');
          slashEffect.play();//play sword sound
          last_combo_attack_time=game.time.time;
          
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.D))
        {

         zombies.setAll('body.velocity.x', -200);
         platform.tilePosition.x -= 5;   
         space.tilePosition.x -= 5; //the scrolling for the game
         pillars.tilePosition.x -= 5; 
         buildings.tilePosition.x -= 5; 
         //time_til_spawn=50;

       }
       else if(game.input.keyboard.isDown(Phaser.Keyboard.A))
       {
         zombies.setAll('body.velocity.x', 200);
         platform.tilePosition.x += 5;   
         space.tilePosition.x += 5; //the scrolling for the game
         pillars.tilePosition.x += 5;
         buildings.tilePosition.x += 5;
         //time_til_spawn=4000;
       }
       else
       {
        time_til_spawn=300;
      }

      current_time = game.time.time;//used for spawning mobs
       //spawn zombies
       //CREATE SPAWN FUNCTIONS FOR ZOMBIES LATER, ADD MULTIPLE SPAWNS AT ONCE
       if(current_time - last_spawn_time > time_til_spawn){
        //time_til_spawn = Math.random()*3000 + 2000;  Uncomment this to add random spawn times.
        last_spawn_time = current_time;
        var rng=Math.random()*10;
        if(game.input.keyboard.isDown(Phaser.Keyboard.B)){//TEMPORARILY DISABLED. HIT B TO SPAWN TEST GIANT To enable check if rng<2 or some other int
          let sprite = zombies.create(800,380,'fatZombie');
          sprite.health=2;
          sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
          sprite.movementTimer=0;
        }
        else{
          let sprite = zombies.create(800,Math.random()*60 + 400,'smallZombie');
          sprite.heatlh=1;
          sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
          sprite.movementTimer=0;
          sprite.animations.add('stand',['zombie0'],1,false);
          sprite.animations.add('walk', ['zombie0','zombie1'] , 1.5, true, false)
          sprite.animations.add('attack', ['zombie1','zombie2','zombie3','zombie4','zombie1'] , 6, false,false)
          sprite.animations.play('walk');

          // player.animations.add('comboSlash', ['Hero3','Hero4', 'Hero5', 'Hero6', 'Hero7','Hero0' ], 5, false);
        }
      }﻿


       //add timer to reset to Hero0 frame


     }
   }

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
     currentHealth = 1; //resets hp back to full
     if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
      game.state.start('Play');

  }
}

//////////////////////////////////////
//FUNCTIONS
//////////////////////////////////////

//freezes enemy after they attack
function overlapPlayer( player, monster){
  monster.movementTimer=100;
  monster.animations.play('attack');
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
  if(current_time-monster.last_hit_time>100){
    monster.last_hit_time=current_time;
    monster.health-=1;
  }
  if(monster.health<=0){
    hitConfirm.play();
  }
  monster.destroy();

  if(currentHealth < 1.0){
    currentHealth += 0.01;
    healthBar.scale.setTo(currentHealth, 1); //incorporates a little bit of healing per kill
  }

  //play death sound
  //http://www.html5gamedevs.com/topic/11047-problem-with-destroy/  recycle sprites to improve performance
}


game.state.add('MainMenu', MainMenu); //add mainmenu state
game.state.add('Play', Play);         //add play state
game.state.add('GameOver', GameOver); //add gameover state
game.state.start('MainMenu'); //start with MainMenu