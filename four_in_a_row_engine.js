/**
 * Four in a Row (Connect Four) rules and computer player.
 *
 * Shared by the Node.js terminal game (four_in_a_row.js) and the browser
 * version (index.html). In Node it is a CommonJS module; in a browser it
 * defines a global `FourInARow`.
 *
 * The computer uses minimax search with alpha-beta pruning.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FourInARow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const ROWS = 6;
  const COLS = 7;
  const EMPTY = ".";
  const HUMAN = "X";
  const COMPUTER = "O";
  const WINDOW = 4;

  const DIFFICULTY_DEPTH = { easy: 2, medium: 4, hard: 6 };

  // Prefer the centre columns when moves score equally; also speeds up pruning.
  const COLUMN_ORDER = [...Array(COLS).keys()].sort(
    (a, b) => Math.abs(a - Math.floor(COLS / 2)) - Math.abs(b - Math.floor(COLS / 2)),
  );

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
  }

  function isValidMove(board, col) {
    return col >= 0 && col < COLS && board[0][col] === EMPTY;
  }

  function validMoves(board) {
    return COLUMN_ORDER.filter((c) => isValidMove(board, c));
  }

  /** Drop a piece into a column. Returns the row it landed in. */
  function dropPiece(board, col, piece) {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) {
        board[row][col] = piece;
        return row;
      }
    }
    throw new Error(`Column ${col + 1} is full`);
  }

  function undoPiece(board, row, col) {
    board[row][col] = EMPTY;
  }

  /** Yield every line of four cells on the board as [row, col] pairs. */
  function* windowCells() {
    const range = (n) => [...Array(n).keys()];
    const line = (r, c, dr, dc) => range(WINDOW).map((i) => [r + dr * i, c + dc * i]);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c <= COLS - WINDOW; c++) yield line(r, c, 0, 1); // horizontal
    for (let r = 0; r <= ROWS - WINDOW; r++)
      for (let c = 0; c < COLS; c++) yield line(r, c, 1, 0); // vertical
    for (let r = 0; r <= ROWS - WINDOW; r++)
      for (let c = 0; c <= COLS - WINDOW; c++) yield line(r, c, 1, 1); // diagonal down-right
    for (let r = WINDOW - 1; r < ROWS; r++)
      for (let c = 0; c <= COLS - WINDOW; c++) yield line(r, c, -1, 1); // diagonal up-right
  }

  // The lines never change, so compute them once.
  const WINDOWS = [...windowCells()];

  function windows(board) {
    return WINDOWS.map((cells) => cells.map(([r, c]) => board[r][c]));
  }

  /** The four [row, col] cells of a winning line for `piece`, or null. */
  function winningLine(board, piece) {
    return WINDOWS.find((cells) => cells.every(([r, c]) => board[r][c] === piece)) || null;
  }

  function isWinner(board, piece) {
    return winningLine(board, piece) !== null;
  }

  function isFull(board) {
    return board[0].every((cell) => cell !== EMPTY);
  }

  function count(window, piece) {
    return window.filter((cell) => cell === piece).length;
  }

  function scoreWindow(window, piece) {
    const opponent = piece === COMPUTER ? HUMAN : COMPUTER;
    const mine = count(window, piece);
    const theirs = count(window, opponent);
    const empty = count(window, EMPTY);

    if (mine === 4) return 100;
    if (mine === 3 && empty === 1) return 5;
    if (mine === 2 && empty === 2) return 2;
    if (theirs === 3 && empty === 1) return -4;
    return 0;
  }

  /** Heuristic score of a position from `piece`'s point of view. */
  function evaluate(board, piece) {
    const centre = board.map((row) => row[Math.floor(COLS / 2)]);
    let score = count(centre, piece) * 3;
    for (const window of windows(board)) score += scoreWindow(window, piece);
    return score;
  }

  /** Return [bestColumn, score] for the computer. */
  function minimax(board, depth, alpha, beta, maximizing) {
    const moves = validMoves(board);

    if (isWinner(board, COMPUTER)) return [null, 1_000_000 + depth]; // prefer faster wins
    if (isWinner(board, HUMAN)) return [null, -1_000_000 - depth]; // prefer slower losses
    if (moves.length === 0) return [null, 0];
    if (depth === 0) return [null, evaluate(board, COMPUTER)];

    let bestCol = moves[0];
    let value = maximizing ? -Infinity : Infinity;
    for (const col of moves) {
      const row = dropPiece(board, col, maximizing ? COMPUTER : HUMAN);
      const [, score] = minimax(board, depth - 1, alpha, beta, !maximizing);
      undoPiece(board, row, col);
      if (maximizing ? score > value : score < value) {
        value = score;
        bestCol = col;
      }
      if (maximizing) alpha = Math.max(alpha, value);
      else beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return [bestCol, value];
  }

  function computerMove(board, depth) {
    // A little randomness on easy keeps it beatable and less predictable.
    if (depth <= DIFFICULTY_DEPTH.easy && Math.random() < 0.25) {
      const moves = validMoves(board);
      return moves[Math.floor(Math.random() * moves.length)];
    }
    const [col] = minimax(board, depth, -Infinity, Infinity, true);
    return col;
  }

  return {
    ROWS,
    COLS,
    EMPTY,
    HUMAN,
    COMPUTER,
    DIFFICULTY_DEPTH,
    createBoard,
    isValidMove,
    validMoves,
    dropPiece,
    winningLine,
    isWinner,
    isFull,
    evaluate,
    minimax,
    computerMove,
  };
});
