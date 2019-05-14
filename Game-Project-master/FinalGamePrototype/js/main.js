/*
Kody Fong
Jackson McCabe
Aj Miranda
Final Game Prototype
 

*/

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser');





var MainMenu = function(game){}; //Main Menu state
MainMenu.prototype = {
  init: function(){},
  preload: function() //preload all assets here
  {
    
     game.load.image('background', 'assets/background1.png');
     game.load.image('smallZombie', 'assets/zombie.png');
     game.load.image('fatZombie', 'assets/giant.png');
     game.load.atlas('character', 'assets/prototypeAtlas.png', 'assets/jsonHash.json');
     game.load.image('floor', 'assets/ground.png');
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

var current_time;
var last_spawn_time=0;
var time_til_spawn=5000;
var monsters;
var last_attack_time=0;

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
    
    platform = game.add.tileSprite(0,  500, 800, 500, 'floor'); //adds the moving floor
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



    monsters=game.add.group();
    let sprite = monsters.create(Math.random()*800 + 250,420,'smallZombie');
    monsters.enableBody=true;
    game.physics.arcade.enable(monsters);
    sprite.health=2;
    sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
    //let sprite = monsters.create(400,420,'character');
    //sprite.anchor.setTo(0.5,0.5);

  },

 update: function() 

  {
  		monsters.setAll('body.velocity.x', -40);  		

      game.physics.arcade.collide(player, platform); //check for collision with the ground and player
      //game.physics.arcade.collide(this.monsters);//monster collision

      current_time = game.time.time;


      //check for correct attack frame then spawn hitbox and call damage enemy function
      if(player.frameName == 'Hero2' || player.frameName == 'Hero4' || player.frameName == 'Hero5' || player.frameName == 'Hero7'){
        var swordBox = game.add.sprite(player.x + 100, player.y);
        swordBox.enableBody=true;
        game.physics.arcade.enable(swordBox);
        swordBox.allowGravity = false;
        swordBox.scale.x=150;
        swordBox.scale.y=10;
        game.physics.arcade.overlap(swordBox, monsters,damageEnemy,null,this);
        swordBox.kill();
      }

      if(game.input.keyboard.isDown(Phaser.Keyboard.SHIFT) && current_time - last_attack_time > 500)
      {
       	player.animations.play('forwardSlash'); //forward slash animation
        //play sword sound
      }
      if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && current_time - last_attack_time > 500)
      {
       	player.animations.play('comboSlash');
        //play sword sound
      }
      if(game.input.keyboard.isDown(Phaser.Keyboard.D))
      {

       	 monsters.setAll('body.velocity.x', -200);
       	 platform.tilePosition.x -= 5;   
      	 space.tilePosition.x -= 5; //the scrolling for the game
         time_til_spawn=4000;

      }
      if(game.input.keyboard.isDown(Phaser.Keyboard.A))
      {
       	 monsters.setAll('body.velocity.x', 200);
       	 platform.tilePosition.x += 5;   
      	 space.tilePosition.x += 5; //the scrolling for the game
         time_til_spawn=6000;
      }
      else
      {
        time_til_spawn=5000;
      }


       //spawn monsters
      if(current_time - last_spawn_time > time_til_spawn){
        //time_til_spawn = Math.random()*3000 + 2000;  Uncomment this to add random spawn times.
        last_spawn_time = current_time;
        var rng=Math.random()*10;
        if(rng<=2){
          let sprite = monsters.create(800,380,'fatZombie');
          sprite.health=2;
          sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
        }
        else{
          let sprite = monsters.create(800,420,'smallZombie');
          sprite.heatlh=1;
          sprite.last_hit_time=0;//timer to prevent multiple damage procs from a hit
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
    
  },
  update: function() //start game again
  {

    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
      game.state.start('Play');
      
  }
}


function damageEnemy(player,monster){
  if(current_time-monster.last_hit_time>300){
      monster.last_hit_time=current_time;
      monster.health-=1;
  }
  if(monster.health<=0)//add condition to check if attack animation is done
    monster.kill();
  //play death sound
  //http://www.html5gamedevs.com/topic/11047-problem-with-destroy/  recycle sprites to improve performance
}




 


game.state.add('MainMenu', MainMenu); //add mainmenu state
game.state.add('Play', Play);         //add play state
game.state.add('GameOver', GameOver); //add gameover state
game.state.start('MainMenu'); //start with MainMenu