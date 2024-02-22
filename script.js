/*====================
INITIALIZING GLOBALS
====================*/
const gameContainer = document.getElementById("game-container");
const gameOverAudio = new Audio("./assets/audio/gameOver.mp3");
const shootAudio = new Audio("./assets/audio/shoot.wav");
const startAudio = new Audio("./assets/audio/start.mp3");
const backgroundAudio = new Audio("./assets/audio/backgroundMusic.wav");
const totalNumEnemies = 55;
const enemies = [];
const bullets = [];

let initialScreen = "";
let player = "";
let gameStarted;
let playerX;
let currScore; //initial score value
let gameOverTriggered = false; //used so gameOver() is triggered only once, for the first call
let moveRight; //used in moveEnemies() for having grid of enemies to go left and right
let moveDown;
let moveLeft;
let moveDownAgain;
let enemyReachedEdge;

/*====================
INIT FUNCTION:
SET GLOBALS VALUES
CALL INITIAL / PRE-GAME SCREEN CREATION
CALL EVENTLISTENER CREATION
====================*/
function init() {
  gameStarted = false;
  playerX = 0;
  currScore = 0;
  gameOverTriggered = false;
  moveRight = true;
  moveDown = false;
  moveLeft = false;
  moveDownAgain = false;
  enemyReachedEdge = false;

  createInitialScreen();
  createEventListener();
}

/*====================
CREATE INITIAL / PRE-GAME SCREEN AND ADD TO DOM
====================*/
function createInitialScreen() {
  // backgroundAudio.play(); //Browser policy does not allow auto-play without user interaction first https://goo.gl/xX8pDD
  initialScreen = document.createElement("div");
  initialScreen.id = "initial-screen";
  gameContainer.appendChild(initialScreen);

  const gameNameLabel = document.createElement("h1");
  gameNameLabel.id = "game-name-label";
  gameNameLabel.innerText = "star wars invaders";
  initialScreen.appendChild(gameNameLabel);

  const enterToPlay = document.createElement("p");
  enterToPlay.id = "enter-to-play";
  enterToPlay.innerText = "Press enter to play!";
  initialScreen.appendChild(enterToPlay);

  const moveInstructions = document.createElement("p");
  moveInstructions.id = "move-instructions";
  moveInstructions.innerText = "⭅  ⭆ - Move ship left or right";
  initialScreen.appendChild(moveInstructions);

  const fireInstructions = document.createElement("p");
  fireInstructions.id = "fire-instructions";
  fireInstructions.innerText = "SPACE - Fire!";
  initialScreen.appendChild(fireInstructions);
}

/*====================
EVENT LISTENER TO CAPTURE KEYBOARD INPUT FOR STARTING GAME, PLAYER MOVEMENT AND SHOOTING
====================*/
function createEventListener() {
  document.addEventListener("keydown", function (event) {
    if (!gameStarted && event.key === "Enter") {
      gameStarted = true;
      initialScreen.remove();
      backgroundAudio.play();
      startAudio.play();
      createScore();
      createPlayer();
      createEnemyGrid();
      moveEnemies();
    }
    if (event.key === "ArrowLeft" && event.target == document.body) {
      event.preventDefault(); //prevents arrow left to scroll left on page (its default)
      if (playerX - 30 < 0) {
        //avoid playerX getting negative values that would exceed the left limit (0px) of the gameContainer
        playerX = playerX;
      } else {
        playerX -= 30;
      }
      player.style.left = playerX + "px";
    } else if (event.key === "ArrowRight" && event.target == document.body) {
      event.preventDefault(); //prevents arrow right to scroll right on page (its default)
      if (playerX + 30 > 1200) {
        //avoid playerX getting values that would exceed the reight limit (1200px) of the gameContainer
        playerX = playerX;
      } else {
        playerX += 30;
      }
      player.style.left = playerX + "px";
    } else if (event.key === " " && event.target == document.body) {
      event.preventDefault(); //prevents space bar to scroll down on page (its default)
      shootAudio.play();
      shootBullet();
    }
  });
}

/*====================
CREATE SCORE TOP RIGHT DISPLAY
====================*/

function createScore() {
  const scoreContainer = document.createElement("div");
  scoreContainer.id = "score-container";
  gameContainer.appendChild(scoreContainer);

  const scoreLabel = document.createElement("p");
  scoreLabel.id = "score-label";
  scoreLabel.innerText = "Score:";
  scoreContainer.appendChild(scoreLabel);

  const scoreValue = document.createElement("p");
  scoreValue.id = "score-value";
  scoreValue.textContent = "0";
  scoreContainer.appendChild(scoreValue);
}

/*====================
CREATE & POSITION PLAYER FUNCTIONS
====================*/

function createPlayer() {
  player = document.createElement("div");
  player.id = "player";
  gameContainer.appendChild(player);
  positionPlayer(player);
}

function positionPlayer(player) {
  const initPlayerPos = player.getBoundingClientRect();
  playerX = initPlayerPos.left;
}

/*====================
CREATE ENEMY GRID
- for loop to call createEnemy() depending on the number of total enemies set (totalNumEnemies)
====================*/

function createEnemyGrid() {
  for (let i = 0; i < totalNumEnemies; i++) {
    createEnemy();
  }
}

/*====================
CREATE EACH ENEMY, ADD TO ENEMIES ARRAY AND CALL POSITION ENEMY FUNCTION
- createEnemy() -> create a div with class enemy, append and add enemy to enemies array
- calls positionEnemy() passing enemy and total number of enemies in the array (enemies.length -1) at each iteration
====================*/
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.className = "enemy";
  gameContainer.appendChild(enemy);
  enemies.push(enemy);
  positionEnemy(enemy, enemies.length - 1);
}

/*====================
POSITION EACH ENEMY FROM THE ENEMIES ARRAY IN A GRID AND UPDATES CSS
Note: each row will have 11 enemies as traditional Space Invaders game
- row -> get number of rows by dividing total number of enemies (index) in the array at the iteration time by 11
- column -> get number of columns by getting the remainder of (total number of enemies (index) in the array at the iteration time divided by 11). Ensures maximum of 11 columns
- enemyX -> enemyx is the enemy position on X axis | Adjust the spacing between enemies here (50px right now)
- enemyY -> enemyY is the enemy position on Y axis | Adjust the spacing between rows here
- enemy.style.left -> update CSS property - horizontal pos
- enemy.style.top -> update CSS property - vertical pos
====================*/

function positionEnemy(enemy, index) {
  const row = Math.floor(index / 11);
  const column = index % 11;
  const enemyX = column * 50;
  const enemyY = row * 50;
  enemy.style.left = enemyX + "px";
  enemy.style.top = enemyY + "px";
}

/*====================
MOVE ENEMIES UNTIL REACHES THE END OF PLAYABLE AREA THEN GAME OVER
- For each enemy in the enemies[] array
- enemyY -> retrieves the value of the top CSS property of the enemy element and converts it to an integer using the parseInt function. 100px will become just 100
- if enemyY position checks if the current vertical position of enemyY is greater than the height of the game container (gameContainer.offsetHeight)
    - The subtraction of 50 is to account for the height of the enemy element itself.
    - if gameOver function have not been called yet (!gameOverTriggered) set gameOverTriggered to true and call gameOver()
        - Necessary so the gameOver() funtion don't run again for every single enemy that reaches the bottom
- else update enemy vertical position by 1px in CSS
- requestAnimationFrame() method tells the browser I want to perform an animation. It requests the browser to call moveEnemies before the next repaint.
====================*/

function moveEnemies() {
  let enemyReachedEdge = false; //to control when we reach the left/right edge of gameCountainer
  let enemyReachedBottom = false; //to control when we reach the bottom edge of gameCountainer

  //keep track of the leftmost (first) and rightmost(last) x-coordinate of the enemies.
  let firstEnemyX = Infinity; //ensures that any subsequent x-coordinate value of an enemy will be SMALLER than firstEnemyX.
  let lastEnemyX = -Infinity; //ensures that any subsequent x-coordinate value of an enemy will be GREATER than firstEnemyX.

  enemies.forEach(function (enemy) {
    const enemyX = parseInt(enemy.style.left);
    const enemyY = parseInt(enemy.style.top); //retrieves the value of the top CSS property of the enemy element and converts it to an integer using the parseInt function. 100px will become just 100

    //check if enemyX is the rightmost / lastEnemyX, if its not updates lastEnemyX
    if (enemyX > lastEnemyX) {
      lastEnemyX = enemyX;
    }
    //check if enemyX is the leftmost / firstEnemyX, if its not updates firstEnemyX
    if (enemyX < firstEnemyX) {
      firstEnemyX = enemyX;
    }

    const enemyWidth = enemy.offsetWidth; //get the width of enemy (50px atm)

    //Checks if the current enemy has reached the right edge of the game container AND if the movement direction is set to move right (moveRight)
    if (enemyX >= gameContainer.offsetWidth - enemyWidth && moveRight) {
      enemyReachedEdge = true; //reached the right edge so update variable
    }

    //Checks if the current enemy has reached the left edge of the game container AND if the movement direction is set to move left (!moveRight)
    if (enemyX <= 0 && !moveRight) {
      enemyReachedEdge = true; //reached the left edge so update variable
    }
    //Checks if the current enemy has reached the bottom edge of the game container
    if (enemyY > gameContainer.offsetHeight - enemy.offsetHeight) {
      enemyReachedBottom = true; //reached the bottom edge so update variable
    }
  });

  //if reached the bottom edge calls GameOver()
  if (enemyReachedBottom) {
    gameOver();
    return;
  }

  //if reached left/right edge updates moveDown to true (so it goes dwn in the next if) and invert movement direction left <> right to go after moving down
  if (enemyReachedEdge) {
    moveDown = true;
    moveRight = !moveRight;
    moveLeft = !moveLeft;
  }
  //RIGHT EDGE MOVE DOWN - if moveDown is true goes through the array of enemies moving all of them down
  if (moveDown) {
    enemies.forEach(function (enemy) {
      const enemyY = parseInt(enemy.style.top);
      enemy.style.top = enemyY + 20 + "px";
    });
    //moveDown and moveDownAgain used to control going down at each edge. Will be opposites to each other
    moveDown = false;
    moveDownAgain = true;

    //MOVE LEFT - if moveLeft is true goes through the array of enemies moving all of them left
  } else if (moveLeft) {
    enemies.forEach(function (enemy) {
      const enemyX = parseInt(enemy.style.left);
      enemy.style.left = enemyX - 4 + "px"; //change speed of movement LEFT / RIGHT on how many px added
    });

    //MOVE RIGHT - if moveRight is true goes through the array of enemies moving all of them right
  } else if (moveRight) {
    enemies.forEach(function (enemy) {
      const enemyX = parseInt(enemy.style.left);
      enemy.style.left = enemyX + 4 + "px"; //change speed of movement LEFT / RIGHT on how many px added
    });

    //LEFT EDGE MOVE DOWN -> if moveDownAgain is true goes through the array of enemies moving all of them down
  } else if (moveDownAgain) {
    enemies.forEach(function (enemy) {
      const enemyY = parseInt(enemy.style.top);
      enemy.style.top = enemyY + 20 + "px";
    });
    //moveDown and moveDownAgain used to control going down at each edge. Will be opposites to each other
    moveDownAgain = false;
    moveRight = true;
  }

  requestAnimationFrame(moveEnemies);
}

/*====================
CREATE EACH BULLET, ADD TO BULLETS ARRAY AND CALL POSITION BULLET FUNCTION
- shootBullet() -> create a div with class bullet, append and add bullet to bullets array
- calls positionBullet() passing bullet
====================*/

function shootBullet() {
  //if (gameStarted) to avoid creating a bullet on the initial screen, before game starting
  if (gameStarted) {
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
    positionBullet(bullet);
  }
}
/*====================
POSITION BULLET RELATIVE TO PLAYER'S POSITION AND CALLS MOVE BULLET FUNCTION
- playerX -> Calculates the position for the bullet on the X axis | horizontal
  - Takes the left position of the player (playerPos.left) and adds half of the player's width (playerPos.width / 2) to position bullet horizontally at the center of the player element
- playerY -> Calculates the position for the bullet on the Y axis | vertical. 
  - Takes the top position of the player (playerPos.top)

====================*/

function positionBullet(bullet) {
  const playerPos = player.getBoundingClientRect();
  //getBoundingClientRect() retrieves the current position and size of the player element on the screen
  const playerX = playerPos.left + (playerPos.width / 2 - 10); //subtracted another 10px to visually adjust to middle of the player
  const playerY = playerPos.top;
  bullet.style.left = playerX - 2.5 + "px"; //Update bullet CSS left and top properties
  bullet.style.top = playerY - 20 + "px";

  moveBullet(bullet);
}

/*====================
MOVE BULLET
====================*/
function moveBullet(bullet) {
  // if (gameOverTriggered) return;

  const bulletY = parseInt(bullet.style.top);

  if (bulletY < 0) {
    bullet.remove();
    bullets.splice(bullets.indexOf(bullet), 1);
    return;
  }

  bullet.style.top = bulletY - 7 + "px";
  checkCollision(bullet);

  requestAnimationFrame(function () {
    moveBullet(bullet);
  });
}

/*====================
CHECK COLLISION
====================*/

function checkCollision(bullet) {
  const bulletPos = bullet.getBoundingClientRect(); //get current position of bullet

  enemies.forEach(function (enemy) {
    const enemyPos = enemy.getBoundingClientRect(); //gets position of enemy

    if (
      //matching bullet and enemy position to detect collision
      bulletPos.left < enemyPos.right &&
      bulletPos.right > enemyPos.left &&
      bulletPos.top < enemyPos.bottom &&
      bulletPos.bottom > enemyPos.top
    ) {
      // Collision detected
      bullet.remove();
      bullets.splice(bullets.indexOf(bullet), 1);
      enemy.remove();
      enemies.splice(enemies.indexOf(enemy), 1);
      incrementScore();
    }
  });
}

/*====================
SCORE CONTROLLER
- Increment score
- update score CSS value
====================*/

function incrementScore() {
  currScore += 10;
  const score = document.getElementById("score-value");
  score.innerHTML = currScore;
}

/*====================
GAME OVER FUNCTION
====================*/
function gameOver() {
  gameOverTriggered = true;
  gameOverAudio.play();
  alert("Game Over");
  console.log("Game Over");
  reinit();
}

/*====================
INITIALIZATION, DESTROY AND REINITIALIZATION FUNCTIONS
====================*/
function destroy() {
  gameContainer.innerHTML = ""; //clean gameContainer removing all HTML within it
  document.removeEventListener("keydown", function (event) {}); //remove eventListener
  enemies.splice(0, enemies.length); //empty enemies array
  bullets.splice(0, bullets.length); //empty bullets array
}

function reinit() {
  destroy();
  init();
}

init();
