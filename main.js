var AM = new AssetManager();

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


//spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse

function GeneralGrievous(game, spritesheet) {
	this.part = 0;
    this.walkAnimation = new Animation(spritesheet, 5, 100, 69, 90, 0.1, 8, false, false);
    this.jumpWindupAnimation = new Animation(spritesheet, 25, 300, 175, 130, 0.25, 2, false, false);
    this.jumpUpAnimation = new Animation(spritesheet, 375, 300, 175, 130, 1, 2, false, false);
    this.jumpLandAnimation = new Animation(spritesheet, 700, 300, 175, 130, 0.1, 5, false, false);
    this.jumpBackflipAnimation = new Animation(spritesheet, 0, 440, 150, 110, 0.1, 9, false, false);

    this.x = 700;
    this.y = 400;
    this.speed = 100;
    this.game = game;
    this.ctx = game.ctx;
}

GeneralGrievous.prototype.update = function() {
    if (this.part < 2) {
        this.x -= this.game.clockTick * this.speed;
        if (this.walkAnimation.isDone()) {
        	this.walkAnimation.elapsedTime = 0;
        	this.part++;
        }
    } else if (this.part == 2) {
    	if (this.jumpWindupAnimation.isDone()) {
    		this.jumpWindupAnimation.elapsedTime = 0;
    		this.part++;
    	}
    } else if (this.part == 3) {
        var jumpDistance = this.jumpUpAnimation.elapsedTime / this.jumpUpAnimation.totalTime;
        var totalHeight = 200;
        if (jumpDistance > 0.5) {
        	jumpDistance = 1 - jumpDistance;
        }
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = 400 - height;
        this.x -= 3;
    	if (this.jumpUpAnimation.isDone()) {
    		this.jumpUpAnimation.elapsedTime = 0;
    		this.part++;
    	}
    } else if (this.part == 4) {
    	if (this.jumpLandAnimation.isDone()) {
    		this.jumpLandAnimation.elapsedTime = 0;
    		this.part++;
    	}
    } else if (this.part == 5) {
    	if (this.jumpBackflipAnimation.currentFrame() > 3) {
    		this.x += 10;
    	}
    	if (this.jumpBackflipAnimation.isDone()) {
    		this.jumpBackflipAnimation.elapsedTime = 0;
    		this.part++;
    	}
    } else {
    	this.part = 0;
    }
    if (this.x < 0) {
    	this.x = 1200;
	} else if (this.x > 1200) {
		this.x = 0;
	}
}

GeneralGrievous.prototype.draw = function() {
	if (this.part < 2) {
		this.walkAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	} else if (this.part == 2) {
		this.jumpWindupAnimation.drawFrame(this.game.clockTick, this.ctx, this.x - 30, this.y - 45);
	} else if (this.part == 3) {
		this.jumpUpAnimation.drawFrame(this.game.clockTick, this.ctx, this.x - 10, this.y - 45);
	} else if (this.part == 4) {
		this.jumpLandAnimation.drawFrame(this.game.clockTick, this.ctx, this.x - 10, this.y - 45);
	} else {
		this.jumpBackflipAnimation.drawFrame(this.game.clockTick, this.ctx, this.x - 20, this.y - 25);
	}
}

AM.queueDownload("./img/Grievous - Copy.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new GeneralGrievous(gameEngine, AM.getAsset("./img/Grievous - Copy.png")));

    console.log("All Done!");
});