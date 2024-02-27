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

let highScores = [];
let initialScreen = "";
let player = "";
let gameStarted;
let choosePlayerType;
let selectedPlayer;
let playerX;
let playerMoveSpeed;
let currScore;
let bulletMoveSpeed;
let waveCounter;
let enemySwitcher;
let enemyYMoveSpeed;
let enemyXMoveSpeed;
let moveRight;
let moveLeft;
let moveDown;
let moveDownAgain;
let enemyReachedEdge;
let canShoot;

/*====================
INIT FUNCTION:
SET GLOBALS VALUES
CALL INITIAL / PRE-GAME SCREEN CREATION
CALL EVENTLISTENER CREATION
====================*/
function init() {
  gameStarted = false;
  gameOverAudio.volume = 0.5; //play audio at 50% of the volume as not to blast the user in case their volume is already set high
  shootAudio.volume = 0.5;
  startAudio.volume = 0.5;
  backgroundAudio.volume = 1; //background audio at 100% as it is already low
  backgroundAudio.loop = true; //loop background music
  selectedPlayer = "MF"; //standard player is set to Millenium Falcon
  playerX = 0;
  playerMoveSpeed = 50; //player move at this px speed at each keystroke (left/right)
  currScore = 0; //initial score value
  bulletMoveSpeed = 7; //speed in px that bullet moves up in the Y axis
  waveCounter = 0;
  enemyYMoveSpeed = 20; //speed enemies move vertically
  enemyXMoveSpeed = 9; //speed enemies move horizontally
  moveRight = true; //variables used by moveEnemies() for moving grid of enemies. Right = true as that is the first direction
  moveLeft = false;
  moveDown = false;
  moveDownAgain = false;
  enemyReachedEdge = false;
  canShoot = true;

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

  choosePlayerType = document.createElement("p");
  choosePlayerType.id = "choose-player-type";
  choosePlayerType.innerText = "< Choose Player >";
  initialScreen.appendChild(choosePlayerType);

  const instructionsLabel = document.createElement("p");
  instructionsLabel.id = "instructions-label";
  instructionsLabel.innerText = "How to play:";
  initialScreen.appendChild(instructionsLabel);

  const moveInstructions = document.createElement("p");
  moveInstructions.id = "move-instructions";
  moveInstructions.innerText = "⭅ ⭆ Move ship";
  initialScreen.appendChild(moveInstructions);

  const fireInstructions = document.createElement("p");
  fireInstructions.id = "fire-instructions";
  fireInstructions.innerText = "SPACEBAR Fire!";
  initialScreen.appendChild(fireInstructions);

  displayHighScores();
}

/*====================
CREATE HIGH SCORE TABLE ON INITIAL SCREEN
====================*/
function displayHighScores() {
  const highScores = getHighScores();

  // Display the high scores in a table
  const table = document.createElement("table");
  table.id = "initial-screen-high-score-table";
  const tableBody = document.createElement("tbody");

  //create table headers
  const rowHeader = document.createElement("tr");

  const rankCellHeader = document.createElement("th");
  rankCellHeader.textContent = "#";
  rowHeader.appendChild(rankCellHeader);

  const nameCellHeader = document.createElement("th");
  nameCellHeader.textContent = "Name";
  rowHeader.appendChild(nameCellHeader);

  const wavesCellHeader = document.createElement("th");
  wavesCellHeader.textContent = "Waves";
  rowHeader.appendChild(wavesCellHeader);

  const scoreCellHeader = document.createElement("th");
  scoreCellHeader.textContent = "Score";
  rowHeader.appendChild(scoreCellHeader);

  tableBody.appendChild(rowHeader);

  // Create table rows for each high score
  highScores.forEach((highScore, index) => {
    const row = document.createElement("tr");

    const rankCell = document.createElement("td");
    rankCell.textContent = index + 1;
    row.appendChild(rankCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = highScore.playerName;
    row.appendChild(nameCell);

    const wavesCell = document.createElement("td");
    wavesCell.textContent = highScore.waves;
    row.appendChild(wavesCell);

    const scoreCell = document.createElement("td");
    scoreCell.textContent = highScore.score;
    row.appendChild(scoreCell);

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  initialScreen.appendChild(table);
}

/*====================
EVENT LISTENER TO CAPTURE KEYBOARD INPUT FOR STARTING GAME, PLAYER MOVEMENT AND SHOOTING
====================*/
function createEventListener() {
  document.addEventListener("keydown", function (event) {
    //right and left arrows on initial screen allow for capturing player ship choice
    if (!gameStarted) {
      if (event.key === "ArrowLeft" && event.target == document.body) {
        choosePlayerType.innerText = "< Millenium Falcon >";
        selectedPlayer = "MF";
      }
      if (event.key === "ArrowRight" && event.target == document.body) {
        choosePlayerType.innerText = "< X-Wing >";
        selectedPlayer = "XW";
      }
    }
    if (!gameStarted && event.key === "Enter") {
      gameStarted = true;
      initialScreen.remove();
      backgroundAudio.play();
      startAudio.play();
      createScore();
      createPlayer(selectedPlayer); // pass selected player MF Millenium Falcon or XW X-Wing
      createEnemyGrid();
      moveEnemies();
    }
    if (gameStarted) {
      if (event.key === "ArrowLeft" && event.target == document.body) {
        event.preventDefault(); //prevents arrow left to scroll left on page (its default)
        if (playerX - playerMoveSpeed < 0) {
          //avoid playerX getting negative values that would exceed the left limit (0px) of the gameContainer
          playerX = playerX;
        } else {
          playerX -= playerMoveSpeed;
        }
        player.style.left = playerX + "px";
      } else if (event.key === "ArrowRight" && event.target == document.body) {
        event.preventDefault(); //prevents arrow right to scroll right on page (its default)
        if (playerX + playerMoveSpeed > 1200) {
          //avoid playerX getting values that would exceed the reight limit (1200px) of the gameContainer
          playerX = playerX;
        } else {
          playerX += playerMoveSpeed;
        }
        player.style.left = playerX + "px";
      } else if (event.key === " " && event.target == document.body) {
        event.preventDefault(); //prevents space bar to scroll down on page (its default)
        shootBullet();
      }
    }
  });
}

/*====================
CREATE SCREEN TOP RIGHT SCORE ON THE DOM - AFTER GAME START
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
  scoreValue.textContent = currScore;
  scoreContainer.appendChild(scoreValue);

  const waveLabel = document.createElement("p");
  waveLabel.id = "wave-label";
  waveLabel.innerText = "Wave:";
  scoreContainer.appendChild(waveLabel);

  const waveValue = document.createElement("p");
  waveValue.id = "wave-value";
  waveValue.textContent = waveCounter;
  scoreContainer.appendChild(waveValue);
}

/*====================
CREATE & POSITION PLAYER
====================*/

function createPlayer(selectedPlayer) {
  if (selectedPlayer === "MF") {
    player = document.createElement("div");
    //calls id on CSS depending on ship selection on initial screen
    player.id = "player-MF";
    gameContainer.appendChild(player);
    positionPlayer(player);
  } else if (selectedPlayer === "XW") {
    player = document.createElement("div");
    player.id = "player-XW";
    gameContainer.appendChild(player);
    positionPlayer(player);
  }
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
    createEnemy(i);
  }
}

/*====================
CREATE EACH ENEMY, ADD TO ENEMIES ARRAY AND CALL POSITION ENEMY FUNCTION
- createEnemy() -> create a div with class enemy, append and add enemy to enemies array
- calls positionEnemy() passing enemy and total number of enemies in the array (enemies.length -1) at each iteration
====================*/
function createEnemy(enemySwitcher) {
  const enemy = document.createElement("div");
  //Get different enemy id
  if (enemySwitcher % 2) {
    enemy.className = "enemy-1";
  } else {
    enemy.className = "enemy-2";
  }
  gameContainer.appendChild(enemy);
  enemies.push(enemy);
  positionEnemy(enemy, enemies.length - 1);
}

/*====================
POSITION EACH ENEMY FROM THE ENEMIES ARRAY IN A GRID AND UPDATES CSS
Note: each row will have 11 enemies as traditional Space Invaders game
====================*/

function positionEnemy(enemy, index) {
  const row = Math.floor(index / 11); //get number of rows by dividing total number of enemies (index) in the array at the iteration time by 11
  const column = index % 11; //get number of columns by getting the remainder of (total number of enemies (index) in the array at the iteration time divided by 11). Ensures maximum of 11 columns
  const enemyX = column * 50; //enemyx is the enemy position on X axis | Adjust the spacing between enemies here (50px right now)
  const enemyY = row * 50; //enemyY is the enemy position on Y axis | Adjust the spacing between rows here
  enemy.style.left = enemyX + "px"; //update CSS property - horizontal pos
  enemy.style.top = enemyY + "px"; //update CSS property - vertical pos
}

/*====================
MOVE ENEMIES UNTIL REACHES THE END OF PLAYABLE AREA THEN GAME OVER
====================*/

function moveEnemies() {
  enemyReachedEdge = false; //to control when we reach the left/right edge of gameCountainer
  enemyReachedBottom = false; //to control when we reach the bottom edge of gameCountainer

  //keep track of the leftmost and rightmost x-coordinate of the enemies.
  //The Infinity global property is a numeric value representing infinity.
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
      enemy.style.top = enemyY + enemyXMoveSpeed + waveCounter + "px";
      //using waveCounter to the equation to increase speed of enemy and increase difficulty as game progress through each wave
    });
    //moveDown and moveDownAgain used to control going down at each edge. Will be opposites to each other
    moveDown = false;
    moveDownAgain = true;

    //MOVE LEFT - if moveLeft is true goes through the array of enemies moving all of them left
  } else if (moveLeft) {
    enemies.forEach(function (enemy) {
      const enemyX = parseInt(enemy.style.left);
      enemy.style.left = enemyX - enemyXMoveSpeed - waveCounter + "px"; //change speed of movement LEFT / RIGHT on how many px added
      //using waveCounter to the equation to increase speed of enemy and increase difficulty as game progress through each wave
    });

    //MOVE RIGHT - if moveRight is true goes through the array of enemies moving all of them right
  } else if (moveRight) {
    enemies.forEach(function (enemy) {
      const enemyX = parseInt(enemy.style.left);
      enemy.style.left = enemyX + enemyXMoveSpeed + waveCounter + "px"; //change speed of movement LEFT / RIGHT on how many px added
      //using waveCounter to the equation to increase speed of enemy and increase difficulty as game progress through each wave
    });

    //LEFT EDGE MOVE DOWN -> if moveDownAgain is true goes through the array of enemies moving all of them down
  } else if (moveDownAgain) {
    enemies.forEach(function (enemy) {
      const enemyY = parseInt(enemy.style.top);
      enemy.style.top = enemyY + enemyXMoveSpeed + waveCounter + "px";
      //using waveCounter to the equation to increase speed of enemy and increase difficulty as game progress through each wave
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
  if (gameStarted && canShoot) {
    //check the value of CanShoot before creating new bullet. If false exit function early
    //chack if game started to avoid creating a bullet on the initial screen, before game stars
    shootAudio.play();
    const bullet = document.createElement("div");
    bullet.className = "bullet";
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
    positionBullet(bullet);

    //otherwise set canShoot to false and start a timer to reset canShoot to true after 0.5 seconds (to limit the rate of fire to 2 bullets per second).
    canShoot = false;
    setTimeout(function () {
      canShoot = true;
    }, 500);
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
  const playerPos = player.getBoundingClientRect(); //getBounding funtion retrieves the current position and size of the player element on the screen
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
  const bulletY = parseInt(bullet.style.top);

  if (bulletY < 0) {
    bullet.remove();
    bullets.splice(bullets.indexOf(bullet), 1);
    return;
  }

  bullet.style.top = bulletY - bulletMoveSpeed + "px";
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
      bullet.remove(); //remove bullet from the DOM
      bullets.splice(bullets.indexOf(bullet), 1);

      enemy.remove(); //remove enemy from the DOM
      enemies.splice(enemies.indexOf(enemy), 1);
      incrementScore();

      //respawn new enemy grid if player killed them all
      if (enemies.length === 0) {
        createEnemyGrid();
        incrementWave();
      }
    }
  });
}

/*====================
In-GAME SCORE & WAVES CONTROLLER
- Increment score
- update score CSS value
====================*/

function incrementScore() {
  currScore += 10 + waveCounter * 2; //using waveCounter to get more points per enemy as you progress through waves
  const score = document.getElementById("score-value");
  score.innerHTML = currScore;
}
//increment wave counter for every new enemy grid creation
function incrementWave() {
  waveCounter += 1;
  const wave = document.getElementById("wave-value");
  wave.innerHTML = waveCounter;
}

/*====================
SAVE HIGH SCORES
- Get high score array from local storage, add score to array, sort (descending), remove scores beyond top 5, update local storage
====================*/
function saveHighScore(playerName, waves, score) {
  // Get existing high scores from localStorage
  highScores = getHighScores();

  // Create a new high score object
  const newHighScore = { playerName, waves, score };

  // Add the new high score to the array
  highScores.push(newHighScore);

  // Sort the high scores array in descending order based on the score (wave follows score)
  highScores.sort((a, b) => b.score - a.score);

  // Remove any extra scores beyond the top 5
  if (highScores.length > 5) {
    highScores.splice(5);
  }

  // Store the updated high scores array in localStorage
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

/*====================
GET HIGH SCORES FROM BROWSER LOCAL STORAGE
====================*/

function getHighScores() {
  // Get high scores from localStorage or return an empty array if there are no high scores
  return JSON.parse(localStorage.getItem("highScores")) || [];
}

/*====================
GAME OVER FUNCTION
====================*/
function gameOver() {
  gameOverAudio.play();
  let lastOfTopHighScores = getHighScores();
  let lastScore;
  let playerName;

  //if high score has all 5 positions get the 5th position score
  if (lastOfTopHighScores.length > 4) {
    lastScore = lastOfTopHighScores[lastOfTopHighScores.length - 1].score;
  } else {
    lastScore = 0;
  }

  if (currScore > lastScore && currScore > 0) {
    //Prompt to get name only if score is higher than the last High Score (10th highest score)
    playerName = window.prompt("Top 5 High Score! Enter your name:");
  } else {
    //getting any playerName otherwise just to pass it to saveHighScore funtion that will discart it as it does not make it to top5
    playerName = " ";
  }

  let waves = waveCounter;
  let score = currScore;

  saveHighScore(playerName, waves, score);
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
