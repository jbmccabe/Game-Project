Monster = function(game,plyr,key,x,y){
	Phaser.Sprite.call(this, game, x, y, key);

	this.game.physics.enable(this);
	this.body.velocity.x=game.rnd.integerInRange(30,80);
	this.body.velocity.y=game.rnd.integerInRange(30,80)
	this.body.allowRotation=false;
	this.body.collideWorldBounds=true;
	this.body.gravity.y=500;

	this.animations.add('left',[0,1],10,true);
	this.animations.add('right',[2,3],10,true);	

	var player=plyr;

	var attack_timer=5000;
	var last_attack=0;
	var health=100;
	var damage=10;
	var defence=5;
}

Monster.prototype = Object.create(Phaser.Sprite.prototype);
Monster.prototype.constructor = Monster;


//Reverse horizontal direction of falling snow.
Monster.prototype.update = function(){

	//follow player
	if(player.x-this.x>20){
		this.body.velocity.x=50;
		this.animations.play('right');
	}
	else if(this.x-player.x>20){
		this.body.velocity.x=-50;
		this.animations.play('left');
	}
	else if(this.x-player.x>=0){
		this.body.velocity.x=0;
		this.animations.play('left');
		//attack
	}
	else if(play.x-this.x>0){
		this.body.velocity.x=0;
		this.animations.play('right');
		//attack
		/*
		if(current_time-last_attack>game.time.time){
			last_attack=game.time.time;
			this.animations.play('attack');
		}
		*/
	}

	//if player is too far away, wander around
	if(player.y-this.y>300){
		this.body.velocity=game.rnd.integerInRange(-25,25);
		if(this.body.velocity.x>0){
			this.animations.play('right');
		}
		else if(this.body.velocity.x<0){
			this.animations.play('left');
		}
		else{
			//else not moving so stop animation
			//this.animations.play('')
		}
	}
}

Damaged = function(damage/*,damageType*/){
	this.health -= (damage-this.defence);
}