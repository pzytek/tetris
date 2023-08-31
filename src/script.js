import { shapes, shapesColors } from "./shapes.js";

const nickForm = document.querySelector("#nick-form");
let nickInput = document.querySelector("#input-nick");

const modal = document.querySelector("#modal");
//buttons
const openModalButton = document.querySelector("#btn-settings");
const closeModalButton = document.querySelector("#btn-close");
const submitButton = document.querySelector("#btn-submit");
const startGame = document.querySelector("#btn-start");
const pauseGame = document.querySelector("#btn-pause");
const resetGame = document.querySelector("#btn-reset");
const retroStyle = document.querySelector("#btn-retro");
const futureStyle = document.querySelector("#btn-future");
const allButtons = document.querySelectorAll("button");

const score = document.querySelector(".score");
//canvas
const gameCanvas = document.querySelector(".game-canvas");
const shapeCanvas = document.querySelector(".shape-canvas");
const gameCtx = gameCanvas.getContext("2d");
const shapeCtx = shapeCanvas.getContext("2d");
//20 rows and 10 cols for game, 1 row and 2 cols for edges
const ROWS = 21;
const COLS = 12;
const SHAPE_ROWS = 4;
const SHAPE_COLS = 4;
const BLOCK_SIZE = 25;

gameCanvas.width = COLS * BLOCK_SIZE;
gameCanvas.height = ROWS * BLOCK_SIZE;
shapeCanvas.width = SHAPE_COLS * BLOCK_SIZE + 10;
shapeCanvas.height = SHAPE_ROWS * BLOCK_SIZE + 10;

//draw gameboard
function gameBoard(rows, cols, context, fill) {
  for (let row = -3; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * BLOCK_SIZE;
      const y = row * BLOCK_SIZE;
      context.fillStyle = fill[row][col] ? fill[row][col] : "#000";
      context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      context.lineWidth = 1.5;
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
        shapeCtx.fillStyle = shapesColors[nextShape.number];
        shapeCtx.fillRect(x + offsetX, y + offsetY, BLOCK_SIZE, BLOCK_SIZE);
        shapeCtx.lineWidth = 1.5;
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
        gameCtx.fillStyle = shapesColors[shape.number];
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
  let [txtFirstRow, txtSecondRow] = ["GAME OVER!", ""];
  if (scoreNumber > currentHighscore) {
    [txtFirstRow, txtSecondRow] = ["NEW HIGHSCORE!", "CONGRATULATION!"];
    storagedHighscores[currentIndex] = scoreNumber;
    localStorage.setItem("highscores", JSON.stringify(storagedHighscores));
  }
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
  gameCtx.font = "bold 15px 'Press Start 2P'";
  gameCtx.textAlign = "center";
  gameCtx.textBaseline = "middle";
  gameCtx.fillText(
    txtFirstRow,
    gameCanvas.width / 2,
    gameCanvas.height / 2 - BLOCK_SIZE
  );
  gameCtx.fillText(
    txtSecondRow,
    gameCanvas.width / 2,
    gameCanvas.height / 2 -
      BLOCK_SIZE +
      3 * gameCtx.measureText("NEW HIGHSCORE!").actualBoundingBoxAscent
  );

  cancelAnimationFrame(rAF);
  rAF = null;
  isGameOver = true;
}

function isRowFilled() {
  for (let row = 0; row < 20; row++) {
    if (filled[row].every(Boolean)) {
      scoreNumber++;
      score.innerHTML = scoreNumber;
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
        filled[shape.row + row][shape.col + col] = shapesColors[shape.number];
      }
    }
  }
  isRowFilled();
  shape = nextShape;
  nextShape = getShape();
}

function loop() {
  speed = speed === 5 ? 5 : 35 - scoreNumber;
  rAF = requestAnimationFrame(loop);
  gameBoard(ROWS, COLS, gameCtx, filled);
  showNextShape();
  drawShape();
  if (loopCounter++ > speed) {
    shape.row++;
    loopCounter = 0;
    if (!isMoveOkay(shape.matrix, shape.row, shape.col)) {
      shape.row--;
      placeShape();
    }
  }
}

//initialization variables
let scoreNumber;
let shape;
let nextShape;
let loopCounter;
let isGamePaused;
let isGameOver;
let rAF;
let speed;

function initialization() {
  shape = getShape();
  nextShape = getShape();
  loopCounter = 0;
  isGameOver = false;
  isGamePaused = true;
  scoreNumber = 0;
  score.innerHTML = 0;
  speed = 35;
  cancelAnimationFrame(rAF);
  filledBoard();
  gameBoard(ROWS, COLS, gameCtx, filled);
  showNextShape();
}

initialization();

startGame.addEventListener("click", () => {
  if (isGameOver) {
    initialization();
  }
  if (isGamePaused) {
    rAF = requestAnimationFrame(loop);
    isGamePaused = false;
  }
});

pauseGame.addEventListener("click", () => {
  if (!isGamePaused) {
    cancelAnimationFrame(rAF);
    isGamePaused = true;
  }
});

resetGame.addEventListener("click", () => {
  initialization();
  startGame.click();
});

const buttonsClasses = [];

function changeStyle() {
  //buttons, input, font, cursor, modal background
  allButtons.forEach((button, index) => {
    buttonsClasses[index] = button.classList[0];
  });

  console.log(buttonsClasses);
}

changeStyle();

retroStyle.addEventListener("click", () => {
  document.body.classList.remove("font-future");
  nickInput.classList.remove("font-future");
  allButtons.forEach((button) => {
    button.classList.remove("font-future");
  });
});

futureStyle.addEventListener("click", () => {
  document.body.classList.add("font-future");
  nickInput.classList.remove("retro-input");
  nickInput.classList.add("future-input");
  allButtons.forEach((button) => {
    button.classList = [];
    button.classList.add("future-btn");
  });
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
      event.preventDefault();
      while (isMoveOkay(shape.matrix, shape.row + 1, shape.col)) {
        shape.row++;
      }
      placeShape();
    }
  }
});

//load data from local storage
let storagedNicks = JSON.parse(localStorage.getItem("nicks")) || [];
let storagedHighscores = JSON.parse(localStorage.getItem("highscores")) || [];
const lastNick = JSON.parse(localStorage.getItem("lastNick")) || null;
nickInput.value = lastNick;
let currentNick = lastNick || null;
let currentIndex = storagedNicks.indexOf(currentNick);
let currentHighscore = 0;

nickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  currentNick = nickInput.value;

  storagedNicks = JSON.parse(localStorage.getItem("nicks")) || [];
  storagedHighscores = JSON.parse(localStorage.getItem("highscores")) || [];
  localStorage.setItem("lastNick", JSON.stringify(currentNick));
  currentIndex = storagedNicks.indexOf(currentNick);
  if (currentIndex === -1) {
    console.log(storagedNicks);
    localStorage.setItem(
      "nicks",
      JSON.stringify([...storagedNicks, currentNick])
    );
    localStorage.setItem(
      "highscores",
      JSON.stringify([...storagedHighscores, 0])
    );
  } else {
    currentHighscore = storagedHighscores[currentIndex];
  }
});

openModalButton.addEventListener("click", () => {
  modal.showModal();
  modal.classList.toggle("modal"); // must be because of display: flex in modal
  pauseGame.click();
});

closeModalButton.addEventListener("click", () => {
  nickInput.value = currentNick;
  if (currentNick) {
    modal.close();
    modal.classList.toggle("modal"); // must be because of display: flex in modal
  } else {
    alert("Nick field can not be empty!");
  }
});

modal.addEventListener("cancel", (event) => {
  event.preventDefault();
});
