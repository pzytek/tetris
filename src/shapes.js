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
  [1, 1],
  [1, 1],
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

export const shapes = [I, O, L, L2, Y, Y2, T];
export const shapesColors = {
  0: "red",
  1: "green",
  2: "blue",
  3: "purple",
  4: "cyan",
  5: "orange",
  6: "yellow",
};
