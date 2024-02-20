/*====================
INITIALIZING MAIN VARIABLES
- enemies[] -> all enemies will be inserted in this array
- bullets[] -> bullets array
- gameOverTriggered -> creating this variable so game over alert don't show multiple times for every enemy that reaches the bottom
- player starting position (half of container width)
====================*/

const player = document.getElementById("player");
const gameContainer = document.getElementById("game-container");
const enemies = [];
const bullets = [];
let gameOverTriggered = false;
let playerX = 600;

/*====================
EVENT LISTENER TO CAPTURE KEYBOARD INPUT AND UPDATE PLAYER POSITION AND SHOOTING
- eventListener to capture player movement from keyboard and update its position
- Keyboard Arrows are used to move: update player.style.left
- Space is used to shoot: Calls shootBullet() to create bullet
====================*/
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 32 && event.target == document.body) {
    event.preventDefault();
  }
  if (event.key === "ArrowLeft") {
    playerX -= 10;
    player.style.left = playerX + "px";
  } else if (event.key === "ArrowRight") {
    playerX += 10;
    player.style.left = playerX + "px";
  } else if (event.key === " ") {
    if (event.target == document.body) {
      event.preventDefault(); //prevents space bar to scroll down on page (its default)
    }
    shootBullet();
  }
});

/*====================
CREATE ENEMY AND ADD TO ENEMIES ARRAY AND PASS IT TO POSITION ENEMY FUNCTION
- createEnemy(): create a div with class enemy, append and add enemy to enemies array
====================*/
function createEnemy() {
  const enemy = document.createElement("div");
  enemy.className = "enemy";
  gameContainer.appendChild(enemy);
  enemies.push(enemy);
  positionEnemy(enemy, enemies.length - 1);
}

/*====================
POSITION EACH ENEMY FROM THE ENEMIES ARRAY IN A GRID / UPDATES CSS
- column -> get number of columns by: total number of enemies diveded by 11 - each row will have 11 enemies
- enemyX -> enemyx is the enemy position on X axis | Adjust the spacing between enemies here
- enemyY -> enemyY is the enemy position on Y axis | Adjust the spacing between rows here
- enemy.style.left -> update CSS property - horizontal pos
- enemy.style.top -> update CSS property - vertical pos
====================*/

function positionEnemy(enemy, index) {
  const row = Math.floor(index / 11);
  const column = index % 11;
  const enemyX = column * 60;
  const enemyY = row * 60;
  enemy.style.left = enemyX + "px";
  enemy.style.top = enemyY + "px";
}

/*====================
MOVE ENEMIES UNTIL REACHES THE END OF PLAYABLE AREA THEN GAME OVER
- For each enemy in the enemies[] array
- enemyY -> retrieves the value of the top CSS property of the enemy element and converts it to an integer using the parseInt function.
- if enemyY position checks if the current vertical position of enemyY is greater than the height of the game container (gameContainer.offsetHeight)
    - The subtraction of 50 is to account for the height of the enemy element itself.
    - if gameOver function have not been called yet (!gameOverTriggered) set gameOverTriggered to true and call gameOver()
        - Necessary so the gameOver() funtion don't run again for every single enemy that reaches the bottom
- else update enemy vertical position by 1px in CSS
- requestAnimationFrame() method tells the browser I want to perform an animation. It requests the browser to call moveEnemies before the next repaint.
====================*/
function moveEnemies() {
  enemies.forEach(function (enemy) {
    const enemyY = parseInt(enemy.style.top);
    if (enemyY > gameContainer.offsetHeight - 50) {
      if (!gameOverTriggered) {
        gameOverTriggered = true;
        gameOver();
      }
    } else {
      enemy.style.top = enemyY + 1 + "px";
    }
  });

  requestAnimationFrame(moveEnemies);
}

/*====================
- 155
====================*/

function shootBullet() {
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  gameContainer.appendChild(bullet);
  bullets.push(bullet);
  positionBullet(bullet);
}
/*====================
- positionBullet() -> positions a bullet element relative to the player's position
- playerPos -> getBoundingClientRect() retrieves the current position and size of the player element on the screen
    -  playerPos object contains properties like top, bottom, left, right, width, and height
- playerX -> This line calculates the horizontal position for the bullet. 
    - It takes the left position of the player (playerPos.left) and adds half of the player's width (playerPos.width / 2) to position bullet horizontally at the center of the player
- playerY -> This line assigns the vertical position (playerY) for the bullet. simply takes the top position of the player (playerPos.top)
====================*/

function positionBullet(bullet) {
  const playerPos = player.getBoundingClientRect();
  const playerX = playerPos.left + playerPos.width / 2;
  const playerY = playerPos.top;

  bullet.style.left = playerX - 2.5 + "px";
  bullet.style.top = playerY - 20 + "px";

  moveBullet(bullet);
}

/*====================
MOVE BULLET 
====================*/
function moveBullet(bullet) {
  if (gameOverTriggered) return;

  const bulletY = parseInt(bullet.style.top);

  if (bulletY < 0) {
    bullet.remove();
    bullets.splice(bullets.indexOf(bullet), 1);
    return;
  }

  bullet.style.top = bulletY - 1 + "px";
  //checkCollision(bullet);

  requestAnimationFrame(function () {
    moveBullet(bullet);
  });
}

/*====================
GAME OVER FUNCTION
====================*/
function gameOver() {
  gameOverTriggered = true;
  //alert("Game Over");
}

/*====================
NUMBER OF ENEMIES
Space invaders has 55 enemies or 5 rows of 11
====================*/
for (let i = 0; i < 55; i++) {
  createEnemy();
}
/*====================
KICK OFF
moveEnmies kick off
====================*/

moveEnemies();
