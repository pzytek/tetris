const lShape = [
  [1, 1, 1],
  [1, 0, 0],
  [0, 0, 0],
];
const lShape2 = [
  [1, 1, 1],
  [0, 0, 1],
  [0, 0, 0],
];
const yShape = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
];
const yShape2 = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
];
const iShape = [
  [0, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const sShape = [
  [1, 1],
  [1, 1],
];
const tShape = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
];
const gridContainer = document.querySelector(".grid-container");
//create the playfield
for (let i = -10; i <= 209; i++) {
  const cell = document.createElement("div");
  cell.innerHTML = i;
  cell.classList.add("cell");
  if (i >= 200) cell.classList.add("cell--bottom");
  gridContainer.appendChild(cell);
}

const allCells = document.querySelectorAll(".cell");
const start = document.querySelector(".start");
const stop = document.querySelector(".stop");
const scoreGlobal = document.querySelector(".score");

const shapes = [lShape, lShape2, iShape, yShape, yShape2, sShape, tShape];
const colors = [
  "red",
  "green",
  "blue",
  "yellow",
  "violet",
  "greenyellow",
  "brown",
];
const randomNumber = 0;

let shapeCells = [];
let previousCells = [];
let collisionCells = [];
let curCol = 3;
let curRow = 0;
let leftEdgeCollision = [];
let leftEdge = [];
let rightEdgeCollision = [];
let rightEdge = [];
let downEdge = [];
let height = 0;
let width = 0;
let filled = [];
let bottom = [200, 201, 202, 203, 204, 205, 206, 207, 208, 209];
let score = 0;
let rotateIndex = 0;

function generateNumber() {
  randomNumber = Math.floor(Math.random() * 7);
}

function drawShape(shape, color) {
  //eraseShape(color);
  shapeCells = [];
  collisionCells = [];
  shape.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      if (col == 1) {
        const cellNumber = (curRow + rowIndex) * 10 + curCol + colIndex;
        gridContainer.children[cellNumber].classList.add("cell--" + color);
        shapeCells.push(cellNumber);
        collisionCells.push(cellNumber + 10);
      }
    });
  });
  previousCells = shapeCells;
  collisionCells = collisionCells.filter((a) => !shapeCells.includes(a));
  getEdges();
  getDimensions(shape);
}

drawShape(shapes[0], "red");
moveShape();
function moveShape() {
  curRow++;
}

function startGame() {
  //drawShape(shapes[0], "red");
  //curRow++;
  const collisionDetected = filled.some((r) => collisionCells.indexOf(r) >= 0);
  const bottomDetected = bottom.some((r) => collisionCells.indexOf(r) >= 0);
  if (bottomDetected || collisionDetected) {
    shapeCells.forEach((a) => filled.push(a));
    filled.forEach((a) => gridContainer.children[a].classList.add("cell--red"));
    shapeCells = [];
    filled.sort((a, b) => a - b);
    boardUpdate();
    checkRows();
    curCol = 3;
    curRow = 0;
  }
}

function checkRows() {
  const firstRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = 0; i <= 19; i++) {
    let row = firstRow.map((a) => a + i * 10);

    if (row.every((a) => filled.includes(a))) {
      score++;
      console.log(filled);
      filled.splice(filled.indexOf(row[0]), row.length); //remove row from filled
      filled = filled.map((val, index) => (val < row[0] ? (val += 10) : val)); //low rest of the blocks
      boardUpdate();
    }
  }
  scoreGlobal.innerText = score;
}

function boardUpdate() {
  allCells.forEach((a) => a.classList.remove("cell--red"));
  filled.forEach((a) => gridContainer.children[a].classList.add("cell--red"));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    if (curCol > 0 && canIGoLeft()) curCol--;
  }
  if (event.key === "ArrowRight") {
    if (curCol + width < 10 && canIGoRight()) curCol++;
  }
  if (event.key === "ArrowUp") {
    //rotateIndex < 3 ? rotateIndex++ : (rotateIndex = 0);
    rotate(shapeCells);
  }
  if (event.key === "ArrowDown") {
    curRow + height > 20 ? (curRow = 20) : curRow++;
    console.log(curRow);
  }
  if (event.key === " ") {
    //shapeCells = rotateShape(shapeCells);
  }
});

start.addEventListener("click", () => {
  gameInterval = setInterval(startGame, 500);
});
stop.addEventListener("click", () => {
  clearInterval(gameInterval);
});

function canIGoLeft() {
  return (
    !leftEdgeCollision.some((a) => filled.includes(a)) && leftEdge[0] % 10 != 0
  );
}
function canIGoRight() {
  return (
    !rightEdgeCollision.some((a) => filled.includes(a)) &&
    rightEdge[0] % 10 != 9
  );
}

function getDimensions(matrix) {
  let firstRowIndex = matrix.findIndex((row) => row.some((cell) => cell === 1));
  let lastRowIndex =
    matrix.length -
    1 -
    matrix
      .slice()
      .reverse()
      .findIndex((row) => row.some((cell) => cell === 1));
  let firstColIndex = matrix.reduce((acc, row) => {
    let index = row.findIndex((cell) => cell === 1);
    return index === -1 ? acc : Math.min(acc, index);
  }, Infinity);
  let lastColIndex = matrix.reduce((acc, row) => {
    let index = row.lastIndexOf(1);
    return Math.max(acc, index);
  }, 0);

  width = lastColIndex - firstColIndex + 1;
  height = lastRowIndex - firstRowIndex + 1;
}

function getEdges() {
  leftEdge = [];
  rightEdge = [];
  const rights = shapeCells.map((a) => a % 10);
  const rightUnit = Math.max(...rights);
  const leftUnit = Math.min(...rights);
  const rightIndexes = [];
  const leftIndexes = [];
  rights.forEach((a, index) => {
    if (a == rightUnit) rightIndexes.push(index);
    if (a == leftUnit) leftIndexes.push(index);
  });
  rightIndexes.forEach((a) => rightEdge.push(shapeCells[a]));
  leftIndexes.forEach((a) => leftEdge.push(shapeCells[a]));
  rightEdgeCollision = rightEdge.map((a) => a + 1);
  leftEdgeCollision = leftEdge.map((a) => a - 1);
}

function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
  return result;
}

// function drawShape(shape, color) {
//   //eraseShape(color);
//   shapeCells = [];
//   collisionCells = [];
//   shape.forEach((row, rowIndex) => {
//     row.forEach((col, colIndex) => {
//       if (col == 1) {
//         const cellNumber = (curRow + rowIndex) * 10 + curCol + colIndex;
//         gridContainer.children[cellNumber].classList.add("cell--" + color);
//         shapeCells.push(cellNumber);
//         collisionCells.push(cellNumber + 10);
//       }
//     });
//   });
//   previousCells = shapeCells;
//   collisionCells = collisionCells.filter((a) => !shapeCells.includes(a));
//   getEdges();
//   getDimensions(shape);
// }

// function eraseShape(color) {
//   shapeCells.forEach((cellNumber) => {
//     gridContainer.children[cellNumber].classList.remove("cell--" + color);
//   });
// }
