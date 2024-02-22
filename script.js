/*====================
INITIALIZING GLOBALS
====================*/
const gameContainer = document.getElementById("game-container");
let initialScreen = "";
let player = "";
const totalNumEnemies = 55;
const enemies = [];
const bullets = [];

let gameStarted;
let playerX;
let currScore; //initial score value
let gameOverTriggered = false; //used so gameOver() is triggered only once, for the first call
let moveRight; //used in moveEnemies() for having grid of enemies to go left and right
let enemyReachedEdge;

/*====================
INIT FUNCTION CREATES INITIAL / PRE-GAME SCREEN
====================*/
function init() {
  gameStarted = false;
  playerX = 0;
  currScore = 0;
  gameOverTriggered = false;
  moveRight = true;
  enemyReachedEdge = false;

  createInitialScreen();
  createEventListener();
}

function createInitialScreen() {
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
      shootBullet();
    }
  });
}

/*====================
CREATE SCORE DISPLAY
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
  // console.log(enemy.style.left);
  // console.log(enemy.style.top);
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

console.log("gameContainer Height: " + gameContainer.offsetHeight);
console.log("gameContainer Width: " + gameContainer.offsetWidth);

function moveEnemies() {
  // let enemyReachedEdge = false;

  enemies.forEach(function (enemy) {
    const enemyX = parseInt(enemy.style.left);
    const enemyY = parseInt(enemy.style.top);

    if (enemyY > gameContainer.offsetHeight - 50) {
      if (!gameOverTriggered) {
        // gameOverTriggered = true;
        gameOver();
      }
    }
    if (!gameOverTriggered) {
      if (enemyX > gameContainer.offsetWidth - 50 || enemyX < 0) {
        enemyReachedEdge = true;
      }

      if (enemyReachedEdge) {
        if (enemyY + 1 < 800) {
          enemy.style.top = enemyY + 1 + "px";
        }
      }

      if (!enemyReachedEdge) {
        if (moveRight) {
          enemy.style.left = enemyX + 1 + "px";
        }
        if (!moveRight) {
          enemy.style.left = enemyX - 1 + "px";
        }
      }
    }
  });

  if (enemyReachedEdge) {
    moveRight = !moveRight;
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
- positionBullet() -> receive bullet from shootBullet and positions the bullet element
- playerPos -> getBoundingClientRect() retrieves the current position and size of the player element on the screen
    -  playerPos object contains properties like top, bottom, left, right, width, and height got by getBoundingClientRect()
- playerX -> Calculates the position for the bullet on the X axis | horizontal
    - Takes the left position of the player (playerPos.left) and adds half of the player's width (playerPos.width / 2) to position bullet horizontally at the center of the player element
- playerY -> Calculates the position for the bullet on the Y axis | vertical.
    - Takes the top position of the player (playerPos.top)
- Update bullet CSS left and top properties
====================*/

function positionBullet(bullet) {
  const playerPos = player.getBoundingClientRect();
  const playerX = playerPos.left + (playerPos.width / 2 - 10); //subtracted another 10px to visually adjust to middle of the player
  const playerY = playerPos.top;
  bullet.style.left = playerX - 2.5 + "px";
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
  alert("Game Over");
  console.log("Game Over");
  reinit();
}

/*====================
INITIALIZATION, DESTROY AND REINITIALIZATION FUNCTIONS
====================*/
function destroy() {
  gameContainer.innerHTML = "";
  document.removeEventListener("keydown", function (event) {});
  enemies.splice(0, enemies.length); //empty enemies array
  bullets.splice(0, bullets.length); //empty bullets array
}

function reinit() {
  destroy();
  init();
}

init();
