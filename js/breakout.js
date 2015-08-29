!(function () {
  if (typeof window.Breakout === "undefined") {
    window.Breakout = {};
  }

  /*
  * by default, time is measured in ms.
  *  for readability reasons, speed is in pixel per s, and,
  *  this code will utilize time / 1000
  */

  Breakout.Game = function (options) {
    options = _.extend({
      lives: 3,
      paddle: new Breakout.Paddle ({}),
      bricks: new Breakout.BrickField(),
      balls: _([]),
      score: 0,
    }, options);

    this.lives = options.lives;
    this.paddle = options.paddle;
    this.bricks = options.bricks;
    this.balls = options.balls;
    this.score = options.score;
    this.activate();
  };

  _.extend(Breakout.Game.prototype, {
    runtimeOptions: {
      ms: 1000/180,
      render: 0,
      renderRatio: 3,
    },

    activate: function () {
      if (this.scheduler) return;
      this.scheduler = setInterval( this.frame.bind(this), this.runtimeOptions.ms);
    },

    allObjects: function () {
      return _(this.bricks.concat(this.balls.flatten()).concat(this.paddle) );
    },

    checkGameLogics: function () {
      var deadBalls = _(this.balls.filter( function (ball) {
        return ball.y > canvas.height;
      }));
      this.removeItemsFrom(deadBalls, this.balls);

      if (this.balls.size() && this.lives) {
        return false;
      } else if (this.lives) {
        this.lives--;
        this.balls.push(new Breakout.CircularElement());
      }

      return true;
    },

    deactivate: function () {
      clearInterval(this.scheduler);
      this.scheduler = null;
    },

    draw: function () {
      this.runtimeOptions.render = (this.runtimeOptions.render + 1) % this.runtimeOptions.renderRatio;
      if (this.runtimeOptions.render) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.allObjects().each( function (brick) { brick.draw(); } );

      this.drawStats();
    },

    drawStats: function () {
      ctx.font = "16px Arial";
      ctx.fillStyle = "#FF0";
      ctx.fillText("Score: "+ this.score, 8, 20);
      ctx.fillText("Lives: "+ this.lives, 100, 20);
    },

    keyDownHandler: function (event) {
      this.paddle.keyDownHandler(event);
    },

    keyUpHandler: function (event) {
      this.paddle.keyUpHandler(event);
    },

    removeItemsFrom: function (items, collection) {
      items.each( function (item) {
        var idx = collection.indexOf(item);
        if (idx >= 0) collection.splice(idx, 1);
      });
    },

    checkCollision: function () {
      this.balls.each( function (ball) {
        this.paddle.checkCollision(ball);

        var brokenBricks = _(this.bricks.filter( function (brick) {
          return brick.checkCollision(ball);
        }));
        this.score += brokenBricks.size();
        this.removeItemsFrom(brokenBricks, this.bricks);
      }.bind(this));
    },

    frame: function () {
      this.move();
      this.draw();
      this.checkCollision();
      this.checkGameLogics();
    },

    move: function () {
      var runtimeOptions = this.runtimeOptions;
      this.allObjects().each( function (obj) {
        obj.move(runtimeOptions.ms);
      });
    }
  });
})();
