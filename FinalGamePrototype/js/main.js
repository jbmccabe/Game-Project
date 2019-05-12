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
    
     game.load.image('background', 'assets/nebula.png');
     game.load.atlas('character', 'assets/spritesheet.png', 'assets/sprites.json');
     game.load.image('floor', 'assets/ground.png');
  },
  create: function() //add text and background color
  {
    game.stage.backgroundColor = "#FF4500";
    game.add.text(25, 64, 'Side Scroller Prototype.', {fontSize: '16px', fill: '#ffffff'});
    game.add.text(25, 128, 'Use A and  Keys to Move.', {fontSize: '16px', fill: '#ffffff'});
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


    player = game.add.sprite(20,game.world.height-100,'character'); //creates a playable character at the bottom of the screen
    player.enableBody = true; 
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true; //collision within the boundaries of the game
    

    player.animations.add('forwardSlash', ['frame1', 'frame2', 'frame3', 'frame7'], 20, false ); //adds the animations
    player.animations.add('comboSlash', ['frame4', 'frame5', 'frame6', 'frame7',  ], 20, false);
    //player.animations.add('neutral', ['frame6'], 10, false);  // *** NEEDS WALKING ANIMATION ***



  },

 update: function() 

  {
  		 player.body.velocity.x = 0;
  		

       game.physics.arcade.collide(player, platform); //check for collision with the ground and player

       if(game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
       {
       	player.animations.play('forwardSlash'); //forward slash animation
       }
       if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER))
       {
       	player.animations.play('comboSlash');
       }
       if(game.input.keyboard.isDown(Phaser.Keyboard.D))
       {
       	 player.body.velocity.x = 200;
       	 platform.tilePosition.x -= 5;   
      	 space.tilePosition.x -= 5; //the scrolling for the game

       }
       if(game.input.keyboard.isDown(Phaser.Keyboard.A))
       {
       	 player.body.velocity.x = -200;
       	 platform.tilePosition.x += 5;   
      	 space.tilePosition.x += 5; //the scrolling for the game

       }

      

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

    
      
  }
}





 


game.state.add('MainMenu', MainMenu); //add mainmenu state
game.state.add('Play', Play);         //add play state
game.state.add('GameOver', GameOver); //add gameover state
game.state.start('MainMenu'); //start with MainMenu