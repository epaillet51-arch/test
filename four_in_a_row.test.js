"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");

const g = require("./four_in_a_row.js");

test("drop stacks from the bottom", () => {
  const board = g.createBoard();
  assert.equal(g.dropPiece(board, 0, g.HUMAN), g.ROWS - 1);
  assert.equal(g.dropPiece(board, 0, g.HUMAN), g.ROWS - 2);
});

test("full column is invalid", () => {
  const board = g.createBoard();
  for (let i = 0; i < g.ROWS; i++) g.dropPiece(board, 3, g.HUMAN);
  assert.equal(g.isValidMove(board, 3), false);
  assert.ok(!g.validMoves(board).includes(3));
  assert.throws(() => g.dropPiece(board, 3, g.HUMAN));
});

test("wins in every direction", async (t) => {
  const cases = {
    horizontal: [0, 1, 2, 3].map((c) => [5, c]),
    vertical: [2, 3, 4, 5].map((r) => [r, 2]),
    "diagonal down": [0, 1, 2, 3].map((i) => [i, i]),
    "diagonal up": [0, 1, 2, 3].map((i) => [5 - i, i + 1]),
  };
  for (const [name, cells] of Object.entries(cases)) {
    await t.test(name, () => {
      const board = g.createBoard();
      for (const [r, c] of cells) board[r][c] = g.COMPUTER;
      assert.ok(g.isWinner(board, g.COMPUTER));
      assert.ok(!g.isWinner(board, g.HUMAN));
    });
  }
});

test("three is not a win", () => {
  const board = g.createBoard();
  for (let c = 0; c < 3; c++) board[5][c] = g.HUMAN;
  assert.ok(!g.isWinner(board, g.HUMAN));
});

test("computer takes an immediate win", () => {
  const board = g.createBoard();
  for (let c = 0; c < 3; c++) g.dropPiece(board, c, g.COMPUTER);
  const [col] = g.minimax(board, 4, -Infinity, Infinity, true);
  assert.equal(col, 3);
});

test("computer blocks an immediate loss", () => {
  const board = g.createBoard();
  for (let i = 0; i < 3; i++) g.dropPiece(board, 6, g.HUMAN);
  g.dropPiece(board, 0, g.COMPUTER);
  const [col] = g.minimax(board, 4, -Infinity, Infinity, true);
  assert.equal(col, 6);
});

test("computer always returns a legal move", () => {
  const board = g.createBoard();
  for (let c = 0; c < g.COLS - 1; c++) {
    // A filled top cell means the column is full; alternate pieces so nobody has won.
    board[0][c] = c % 2 ? g.HUMAN : g.COMPUTER;
  }
  assert.equal(g.computerMove(board, 4), g.COLS - 1);
});
