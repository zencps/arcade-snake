import * as Engine from './engine.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');

const FPS = 12;
const FRAME_MS = 1000 / FPS;
let lastFrameTime = 0;


function clearCanvas() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, Engine.CANVAS_SIZE, Engine.CANVAS_SIZE);

  ctx.strokeStyle = 'rgba(0, 168, 255, 0.06)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= Engine.GRID_COUNT; i++) {
    const pos = i * Engine.TILE_SIZE;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, Engine.CANVAS_SIZE);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(Engine.CANVAS_SIZE, pos);
    ctx.stroke();
  }
}

function drawFood() {
  const x = Engine.food.x * Engine.TILE_SIZE;
  const y = Engine.food.y * Engine.TILE_SIZE;
  const padding = 3;

  ctx.shadowColor = '#4dc3ff';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding, y + padding, Engine.TILE_SIZE - padding * 2, Engine.TILE_SIZE - padding * 2);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#4dc3ff';
  ctx.fillRect(x + padding + 4, y + padding + 4, Engine.TILE_SIZE - padding * 2 - 8, Engine.TILE_SIZE - padding * 2 - 8);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + padding + 2, y + padding + 2, 3, 3);
}

function drawSnake() {
  Engine.snake.forEach((segment, index) => {
    const x = segment.x * Engine.TILE_SIZE;
    const y = segment.y * Engine.TILE_SIZE;
    const isHead = index === 0;

    if (isHead) {
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#00cc52';
      ctx.fillRect(x + 1, y + 1, Engine.TILE_SIZE - 2, Engine.TILE_SIZE - 2);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 5, 3, 3);
      ctx.fillRect(x + 12, y + 5, 3, 3);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 6, y + 6, 1, 1);
      ctx.fillRect(x + 13, y + 6, 1, 1);
    } else {
      ctx.shadowColor = 'rgba(0, 255, 102, 0.45)';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(x + 2, y + 2, Engine.TILE_SIZE - 4, Engine.TILE_SIZE - 4);
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(0, 150, 60, 0.25)';
      ctx.fillRect(x + 4, y + 4, Engine.TILE_SIZE - 8, Engine.TILE_SIZE - 8);
    }
  });
}

function drawScore() {
  if (scoreEl) scoreEl.textContent = String(Engine.score);
  if (highScoreEl) highScoreEl.textContent = String(Engine.highScore);
}

function updateOverlay() {
  if (!Engine.isStarted) {
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'PRESS START';
    overlayTitle.style.color = '#4dc3ff';
    overlayTitle.style.textShadow = '0 0 10px #4dc3ff';
    overlayMessage.innerHTML = 'Press SPACE or Click START to play<br>Use ARROW KEYS / WASD to move';
    startBtn.textContent = 'START GAME';
    startBtn.style.display = 'inline-block';
  } else if (Engine.gameOver) {
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'GAME OVER';
    overlayTitle.style.color = '#ff3040';
    overlayTitle.style.textShadow = '0 0 10px #ff3040';
    overlayMessage.innerHTML = `Score: ${Engine.score}<br>High Score: ${Engine.highScore}<br><br>Press SPACE or R to restart`;
    startBtn.textContent = 'PLAY AGAIN';
    startBtn.style.display = 'inline-block';
  } else if (Engine.isPaused) {
    overlay.classList.remove('hidden');
    overlayTitle.textContent = 'PAUSED';
    overlayTitle.style.color = '#ffe74c';
    overlayTitle.style.textShadow = '0 0 10px #ffe74c';
    overlayMessage.innerHTML = 'Press SPACE to resume<br>Press R to restart';
    startBtn.textContent = 'RESUME';
    startBtn.style.display = 'inline-block';
  } else {
    overlay.classList.add('hidden');
  }
}

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);

  if (timestamp - lastFrameTime < FRAME_MS) return;
  lastFrameTime = timestamp;

  clearCanvas();

  if (Engine.isStarted && !Engine.gameOver && !Engine.isPaused) {
    Engine.update();
  }

  if (Engine.snake.length > 0) {
    drawFood();
    drawSnake();
  }

  drawScore();
  updateOverlay();
}

function bindUI() {
  startBtn.addEventListener('click', () => {
    if (!Engine.isStarted || Engine.gameOver) {
      Engine.initGame();
    } else if (Engine.isPaused) {
      Engine.togglePause();
    }
    updateOverlay();
  });

  document.querySelectorAll('.dpad-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    const handler = (e) => {
      e.preventDefault();
      Engine.changeDirection(dir);
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', handler, { passive: false });
  });

  document.addEventListener('snake:pause', () => updateOverlay());
  document.addEventListener('snake:restart', () => {
    Engine.initGame();
    updateOverlay();
  });

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
  });
}

Engine.setupInput();
bindUI();

Engine.preparePreview();

drawScore();
updateOverlay();

lastFrameTime = performance.now();
requestAnimationFrame(gameLoop);
