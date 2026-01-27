const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const newBtn = document.getElementById("newGame");
const msgEl = document.getElementById("msg");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");

let grid;
let score = 0;

let moves = 0;
let startTime = null;
let timerId = null;
let gameOver = false;

function startTimerIfNeeded(){
  if (startTime !== null) return;
  startTime = Date.now();
  timerId = setInterval(() => {
    if (gameOver) return;
    const seconds = (Date.now() - startTime) / 1000;
    timeEl.textContent = seconds.toFixed(1);
  }, 100);
}

function stopTimer(){
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function spawnTile(){
  const empty = [];
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      if (grid[r][c] === 0) empty.push([r,c]);
    }
  }
  if (empty.length === 0) return false;

  const [r,c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function copyGrid(g){
  return g.map(row => row.slice());
}

function gridsEqual(a, b){
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function moveLeftMerge(){
  for (let r = 0; r < 4; r++){
    let row = grid[r].filter(v => v !== 0);

    for (let i = 0; i < row.length - 1; i++){
      if (row[i] === row[i+1]){
        row[i] *= 2;
        score += row[i];
        row[i+1] = 0; // delete merged tile
        i++;          // skip next to avoid double merge
      }
    }

    row = row.filter(v => v !== 0);
    while (row.length < 4) row.push(0);

    grid[r] = row;
  }
}

function rotateRight(g){
  const res = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
  ];
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      res[c][3 - r] = g[r][c];
    }
  }
  return res;
}

function hasEmptyCell(){
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      if (grid[r][c] === 0) return true;
    }
  }
  return false;
}

function hasMergeMove(){
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      const v = grid[r][c];
      if (r + 1 < 4 && grid[r+1][c] === v) return true;
      if (c + 1 < 4 && grid[r][c+1] === v) return true;
    }
  }
  return false;
}

function isGameOver(){
  return !hasEmptyCell() && !hasMergeMove();
}

function has2048(){
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      if (grid[r][c] === 2048) return true;
    }
  }
  return false;
}

function doMove(dir){
  if (gameOver) return;

  const rot = { left:0, up:3, right:2, down:1 }[dir];
  const before = copyGrid(grid);

  for (let i = 0; i < rot; i++) grid = rotateRight(grid);
  moveLeftMerge();
  for (let i = 0; i < (4 - rot) % 4; i++) grid = rotateRight(grid);

  const changed = !gridsEqual(before, grid);

  if (changed){
    startTimerIfNeeded();
    moves++;
    movesEl.textContent = moves;

    spawnTile();
    msgEl.textContent = "";
  }

  render();

  if (changed && has2048()){
    msgEl.textContent = "You hit 2048. Keep going or click New Game.";
  }

  if (changed && isGameOver()){
    msgEl.textContent = "Game over. Click New Game.";
    gameOver = true;
  }
}

function newGame(){
  grid = [
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
    [0,0,0,0],
  ];

  score = 0;
  moves = 0;
  movesEl.textContent = moves;

  gameOver = false;
  msgEl.textContent = "";

  startTime = null;
  timeEl.textContent = "0.0";
  stopTimer();

  spawnTile();
  spawnTile();
  render();
}

function render(){
  boardEl.innerHTML = "";
  for (let r = 0; r < 4; r++){
    for (let c = 0; c < 4; c++){
      const v = grid[r][c];
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = v === 0 ? "" : v;
      boardEl.appendChild(cell);
    }
  }
  scoreEl.textContent = score;
}

newBtn.addEventListener("click", newGame);
newGame();

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "arrowleft" || k === "a") doMove("left");
  if (k === "arrowup" || k === "w") doMove("up");
  if (k === "arrowright" || k === "d") doMove("right");
  if (k === "arrowdown" || k === "s") doMove("down");
});
