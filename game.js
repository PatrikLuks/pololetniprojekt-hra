const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = window.innerWidth * 0.7;
const canvasHeight = window.innerHeight * 0.7;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let playerPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let opponentPaddle = { x: canvas.width - paddleWidth - 10, y: canvas.height / 2 - paddleHeight / 2, width: paddleWidth, height: paddleHeight, dy: 0 };
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, size: ballSize };

let playerNumber;
const socket = new WebSocket('ws://localhost:3000');

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

function drawPaddle(paddle) {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall(ball) {
  ctx.fillStyle = '#FFF';
  ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

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

  if (ball.y < 0 || ball.y + ballSize > canvas.height) ball.dy *= -1;

  if (ball.x < 0) {
    losePoint(2); // Player 2 scored
  }

  if (ball.x + ballSize > canvas.width) {
    losePoint(1); // Player 1 scored
  }

  if (ball.x < playerPaddle.x + paddleWidth && ball.x + ballSize > playerPaddle.x && ball.y < playerPaddle.y + paddleHeight && ball.y + ballSize > playerPaddle.y) {
    ball.dx *= -1;
  }

  if (ball.x < opponentPaddle.x + paddleWidth && ball.x + ballSize > opponentPaddle.x && ball.y < opponentPaddle.y + paddleHeight && ball.y + ballSize > opponentPaddle.y) {
    ball.dx *= -1;
  }

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'update', paddle: playerPaddle.y, ball: ball }));
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle(playerPaddle);
  drawPaddle(opponentPaddle);
  drawBall(ball);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') playerPaddle.dy = -6;
  if (event.key === 'ArrowDown') playerPaddle.dy = 6;
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') playerPaddle.dy = 0;
});

function losePoint(player) {
  console.log(`Player ${player} lost a point!`);
  // Add your logic here for what happens when a player loses a point
}

function startNewGame() {
  playerPaddle.y = canvas.height / 2 - paddleHeight / 2;
  opponentPaddle.y = canvas.height / 2 - paddleHeight / 2;
  ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 4, dy: 4, size: ballSize };
}

const newGameBtn = document.getElementById('newGameBtn');
newGameBtn.addEventListener('click', startNewGame);

function adjustButtonPosition() {
  const gameCanvasRect = canvas.getBoundingClientRect();
  const buttonTopOffset = gameCanvasRect.bottom + 20;

  newGameBtn.style.position = 'absolute';
  newGameBtn.style.left = `calc(50% - ${newGameBtn.offsetWidth / 2}px)`;
  newGameBtn.style.top = `${buttonTopOffset}px`;
}

adjustButtonPosition();
window.addEventListener('resize', adjustButtonPosition);

gameLoop();