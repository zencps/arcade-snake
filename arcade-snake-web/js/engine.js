export const TILE_SIZE = 20;      
export const CANVAS_SIZE = 400;           
export const GRID_COUNT = CANVAS_SIZE / TILE_SIZE; 

export let snake = [];      
export let food = { x: 10, y: 10 };
export let direction = 'right';      
export let nextDirection = 'right';  
export let score = 0;
export let highScore = Number(localStorage.getItem('snakeHighScore') || 0);
export let gameOver = false;
export let isPaused = false;
export let isStarted = false;

const DIR_VECTORS = {
  up:    { x: 0, y: -1 },
  down:  { x: 0, y:  1 },
  left:  { x: -1, y: 0 },
  right: { x:  1, y: 0 },
};

const OPPOSITE = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function randomGridCoord() {
  return Math.floor(Math.random() * GRID_COUNT);
}

export function initGame() {
  const mid = Math.floor(GRID_COUNT / 2);
  snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  gameOver = false;
  isPaused = false;
  isStarted = true;
  spawnFood();
}

export function resetGame() {
  initGame();
}

export function setStarted(value) {
  isStarted = value;
}

export function setPaused(value) {
  isPaused = value;
}

export function preparePreview() {
  initGame();
  isStarted = false;
}

export function spawnFood() {
  let pos;
  do {
    pos = { x: randomGridCoord(), y: randomGridCoord() };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  food = pos;
}

export function changeDirection(newDir) {
  if (!['up', 'down', 'left', 'right'].includes(newDir)) return;
  const effectiveDir = nextDirection;
  if (OPPOSITE[effectiveDir] === newDir) return;
  nextDirection = newDir;
}

export function togglePause() {
  if (gameOver || !isStarted) return;
  isPaused = !isPaused;
}

export function getScore() {
  return score;
}

export function isGameOver() {
  return gameOver;
}

export function update() {
  if (gameOver || isPaused || !isStarted) return 'alive';

  direction = nextDirection;

  const head = snake[0];
  const vec = DIR_VECTORS[direction];
  const newHead = { x: head.x + vec.x, y: head.y + vec.y };

  if (
    newHead.x < 0 || newHead.x >= GRID_COUNT ||
    newHead.y < 0 || newHead.y >= GRID_COUNT
  ) {
    gameOver = true;
    return 'dead';
  }

  const willEat = newHead.x === food.x && newHead.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  if (bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
    gameOver = true;
    return 'dead';
  }

  snake.unshift(newHead);

  if (willEat) {
    score += 10;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', String(highScore));
    }
    spawnFood();
    return 'ate';
  } else {
    snake.pop();
    return 'alive';
  }
}

export function setupInput() {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (key === 'arrowup' || key === 'w') { e.preventDefault(); changeDirection('up'); }
    else if (key === 'arrowdown' || key === 's') { e.preventDefault(); changeDirection('down'); }
    else if (key === 'arrowleft' || key === 'a') { e.preventDefault(); changeDirection('left'); }
    else if (key === 'arrowright' || key === 'd') { e.preventDefault(); changeDirection('right'); }

    else if (key === ' ' || e.code === 'Space') {
      e.preventDefault();

      if (!gameOver && isStarted) {
        togglePause();
        document.dispatchEvent(new CustomEvent('snake:pause', { detail: { isPaused } }));
      } else if (!isStarted || gameOver) {
        document.dispatchEvent(new CustomEvent('snake:restart'));
      }
    }

    else if (key === 'r') {
      document.dispatchEvent(new CustomEvent('snake:restart'));
    }
  });
}
