const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastaveni rozmeru platna
const canvasWidth = window.innerWidth * 0.7;
const canvasHeight = window.innerHeight * 0.7;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Nastaveni rozmeru palek a micku
const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

// Nastaveni pozic objektu
let playerPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let opponentPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, size: ballSize };

let playerNumber;
const socket = new WebSocket('ws://localhost:3000');   //novy socket na localhostu

// Event listener pro prijem zprav ze serveru
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'init') {
    playerNumber = message.player;
  } else if (message.type === 'update') {
    if (playerNumber === 1) {
      opponentPaddle.y = message.paddle;
      ball = message.ball;
    } else {
      playerPaddle.y = message.paddle;
      ball = message.ball;
    }
  }
});

// Funkce pro vykresleni palky
function drawPaddle(paddle) {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Funkce pro vykresleni micku
function drawBall(ball) {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

// Funkce pro aktualizaci hry
function update() {
  if (playerNumber === 1) {
    playerPaddle.y += playerPaddle.dy;
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + paddleHeight > canvas.height) playerPaddle.y = canvas.height - paddleHeight;
  } else {
    opponentPaddle.y += opponentPaddle.dy;
    if (opponentPaddle.y < 0) opponentPaddle.y = 0;
    if (opponentPaddle.y + paddleHeight > canvas.height) opponentPaddle.y = canvas.height - paddleHeight;
  }

  ball.x += ball.dx;
  ball.y += ball.dy;

  // Odraz micku od horni a dolni hrany
  if (ball.y < 0 || ball.y + ballSize > canvas.height) ball.dy *= -1;

  // Detekce ztraty bodu
  if (ball.x < 0) {
    losePoint(2); // Hrac 2 dal gol
  }

  if (ball.x + ballSize > canvas.width) {
    losePoint(1); // Hrac 1 dal gol
  }

  // Odraz micku od palky hrace
  if (ball.x < playerPaddle.x + paddleWidth && ball.x + ballSize > playerPaddle.x && ball.y < playerPaddle.y + paddleHeight && ball.y + ballSize > playerPaddle.y) {
    ball.dx *= -1;
  }

  // Odraz micku od palky protivnika
  if (ball.x < opponentPaddle.x + paddleWidth && ball.x + ballSize > opponentPaddle.x && ball.y < opponentPaddle.y + paddleHeight && ball.y + ballSize > opponentPaddle.y) {
    ball.dx *= -1;
  }

  // Poslani aktualizaci na server
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'update', paddle: playerPaddle.y, ball: ball }));
  }
}

// Funkce pro vykresleni hry
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle(playerPaddle);
  drawPaddle(opponentPaddle);
  drawBall(ball);
}

// Herni smycka
function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

// Event listenery pro ovladani palky
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') playerPaddle.dy = -6;
  if (event.key === 'ArrowDown') playerPaddle.dy = 6;
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') playerPaddle.dy = 0;
});

// Funkce pro zpracovani ztraty bodu
function losePoint(player) {
  console.log(`Hrac ${player} ztratil bod!`);
  // Pridat logiku pro zpracovani ztraty bodu
}

// Funkce pro spusteni nove hry
function startNewGame() {
  playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
  opponentPaddle.y = canvas.height / 2 - paddleHeight / 2;
  ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, size: ballSize };
}

const newGameBtn = document.getElementById('newGameBtn');
newGameBtn.addEventListener('click', startNewGame);

// Funkce pro nastaveni pozice tlacitka
function adjustButtonPosition() {
  const gameCanvasRect = canvas.getBoundingClientRect();
  const buttonTopOffset = gameCanvasRect.bottom + 20;

  newGameBtn.style.position = 'absolute';
  newGameBtn.style.left = `calc(50% - ${newGameBtn.offsetWidth / 2}px)`;
  newGameBtn.style.top = `${buttonTopOffset}px`;
}

adjustButtonPosition();
window.addEventListener('resize', adjustButtonPosition);

// Spusteni herni smycky
gameLoop();
