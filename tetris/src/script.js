const L = [
  [1, 1, 1],
  [1, 0, 0],
  [0, 0, 0],
];
const L2 = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 0],
];
const Y = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
];
const Y2 = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
];
const O = [
  ["red", "red"],
  ["red", "red"],
];
const T = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
];
const I = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const shapes = [I, O, L, L2, Y, Y2, T];
const colors = {
  0: "red",
  1: "green",
  2: "blue",
  3: "purple",
  4: "cyan",
  5: "orange",
  6: "yellow",
};

const start = document.querySelector(".start");
const pause = document.querySelector(".pause");
const reset = document.querySelector(".reset");
const score = document.querySelector(".score");

const gameCanvas = document.querySelector(".game-canvas");
const shapeCanvas = document.querySelector(".shape-canvas");
const gameCtx = gameCanvas.getContext("2d");
const shapeCtx = shapeCanvas.getContext("2d");

const ROWS = 21;
const COLS = 12;
const SHAPE_ROWS = 4;
const SHAPE_COLS = 4;

const BLOCK_SIZE = 25;
gameCanvas.width = COLS * BLOCK_SIZE;
gameCanvas.height = ROWS * BLOCK_SIZE;
shapeCanvas.width = SHAPE_COLS * BLOCK_SIZE + 10;
shapeCanvas.height = SHAPE_ROWS * BLOCK_SIZE + 10;

function gameBoard(rows, cols, context, fill) {
  for (let row = -3; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * BLOCK_SIZE;
      const y = row * BLOCK_SIZE;

      context.fillStyle = fill[row][col] ? fill[row][col] : "#000";
      context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      context.strokeStyle = "#333";
      context.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
}

function showNextShape() {
  shapeCtx.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
  for (let row = 0; row < nextShape.matrix.length; row++) {
    for (let col = 0; col < nextShape.matrix[0].length; col++) {
      const x = col * BLOCK_SIZE;
      const y = row * BLOCK_SIZE;
      if (nextShape.matrix[row][col]) {
        const num = nextShape.number;
        const [offsetX, offsetY] =
          num == 0 ? [5, 17.5] : num == 1 ? [30, 30] : [17.5, 27.5];
        shapeCtx.fillStyle = colors[nextShape.number];
        shapeCtx.fillRect(x + offsetX, y + offsetY, BLOCK_SIZE, BLOCK_SIZE);
        shapeCtx.strokeStyle = "#333";
        shapeCtx.strokeRect(x + offsetX, y + offsetY, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

//fill the board
let filled = [];
function filledBoard() {
  for (let row = -3; row < ROWS; row++) {
    filled[row] = [];
    for (let col = 0; col < COLS; col++) {
      // fill the edges with grey
      filled[row][col] = col == 0 || col == 11 || row == 20 ? "grey" : 0;
    }
  }
}
function getRandom() {
  return Math.floor(Math.random() * 7);
}

function getShape() {
  const number = getRandom();
  const matrix = shapes[number];
  const col = 4;
  const row = -1;
  return {
    number: number,
    col: col,
    row: row,
    matrix: matrix,
  };
}

function drawShape() {
  for (let i = 0; i < shape.matrix.length; i++) {
    for (let j = 0; j < shape.matrix[0].length; j++) {
      if (shape.matrix[i][j]) {
        const x = (shape.col + j) * BLOCK_SIZE;
        const y = (shape.row + i) * BLOCK_SIZE;
        gameCtx.fillStyle = colors[shape.number];
        gameCtx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        gameCtx.strokeStyle = "#333";
        gameCtx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function rotateShape(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((val, j) => matrix[j][N - i]));
  return result;
}

function isMoveOkay(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (
        matrix[row][col] &&
        filled[cellRow + row][cellCol + col] //shape detected
      ) {
        return false;
      }
    }
  }
  return true;
}
function gameOver() {
  gameCtx.globalAlpha = 0.75;
  gameCtx.fillStyle = "black";
  gameCtx.fillRect(
    BLOCK_SIZE,
    0,
    gameCanvas.width - 2 * BLOCK_SIZE,
    gameCanvas.height - BLOCK_SIZE
  );

  gameCtx.globalAlpha = 1;
  gameCtx.fillStyle = "white";
  gameCtx.font = "bold 25px '8BIT WONDER'";
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "middle";
  gameCtx.fillText(
    "GAME OVER",
    gameCanvas.width / 2,
    gameCanvas.height / 2 - BLOCK_SIZE
  );
  cancelAnimationFrame(rAF);
  rAF = null;
  isGameOver = true;
}

function isRowFilled() {
  for (let row = 0; row < 20; row++) {
    if (filled[row].every(Boolean)) {
      score.innerHTML++;
      for (let r = row; r >= 0; r--) {
        for (let c = 1; c < 11; c++) {
          filled[r][c] = filled[r - 1][c];
        }
      }
    }
  }
}

function placeShape() {
  for (let row = 0; row < shape.matrix.length; row++) {
    for (let col = 0; col < shape.matrix[row].length; col++) {
      if (shape.matrix[row][col]) {
        if (shape.row + row < 0) {
          return gameOver();
        }
        filled[shape.row + row][shape.col + col] = colors[shape.number];
      }
    }
  }
  isRowFilled();
  shape = nextShape;
  nextShape = getShape();
}

function loop() {
  rAF = requestAnimationFrame(loop);
  gameBoard(ROWS, COLS, gameCtx, filled);
  showNextShape();
  drawShape();
  if (loopCounter++ > 35) {
    shape.row++;
    loopCounter = 0;
    if (!isMoveOkay(shape.matrix, shape.row, shape.col)) {
      shape.row--;
      placeShape();
    }
  }
}

//initialization variables

let shape;
let nextShape;
let loopCounter;
let isGamePaused;
let isGameOver;
let rAF;

function initialization() {
  shape = getShape();
  nextShape = getShape();
  loopCounter = 0;
  isGameOver = false;
  isGamePaused = true;
  score.innerHTML = 0;
  cancelAnimationFrame(rAF);
  filledBoard();
  gameBoard(ROWS, COLS, gameCtx, filled);
  showNextShape();
}

initialization();

start.addEventListener("click", () => {
  if (isGameOver) {
    initialization();
  }
  if (isGamePaused) {
    rAF = requestAnimationFrame(loop);
    isGamePaused = false;
  }
});

pause.addEventListener("click", () => {
  if (!isGamePaused) {
    cancelAnimationFrame(rAF);
    isGamePaused = true;
  }
});

reset.addEventListener("click", () => {
  initialization();
  start.click();
});

document.addEventListener("keydown", (event) => {
  if (rAF) {
    if (event.key === "ArrowUp") {
      const matrix = rotateShape(shape.matrix);
      if (isMoveOkay(matrix, shape.row, shape.col)) shape.matrix = matrix;
    }
    if (event.key === "ArrowDown") {
      shape.row++;
      if (!isMoveOkay(shape.matrix, shape.row, shape.col)) shape.row--;
    }
    if (event.key === "ArrowLeft") {
      shape.col--;
      if (!isMoveOkay(shape.matrix, shape.row, shape.col)) shape.col++;
    }
    if (event.key === "ArrowRight") {
      shape.col++;
      if (!isMoveOkay(shape.matrix, shape.row, shape.col)) shape.col--;
    }
    if (event.key === " ") {
      while (isMoveOkay(shape.matrix, shape.row + 1, shape.col)) {
        shape.row++;
      }
      placeShape();
    }
  }
});
