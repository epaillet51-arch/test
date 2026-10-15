#!/usr/bin/env node
/**
 * Four in a Row (Connect Four) - play against the computer in your terminal.
 *
 * The game rules and the computer player live in four_in_a_row_engine.js.
 * Run:  node four_in_a_row.js [--difficulty easy|medium|hard]
 */
"use strict";

const readline = require("node:readline");
const { parseArgs } = require("node:util");

const engine = require("./four_in_a_row_engine.js");

const {
  COLS,
  EMPTY,
  HUMAN,
  COMPUTER,
  DIFFICULTY_DEPTH,
  createBoard,
  isValidMove,
  dropPiece,
  isWinner,
  isFull,
  computerMove,
} = engine;

function render(board) {
  const header = [...Array(COLS).keys()].map((c) => c + 1).join(" ");
  return [header, ...board.map((row) => row.join(" ")), "-".repeat(header.length)].join("\n");
}

/**
 * Reads lines from stdin. Uses the async iterator so lines piped in all at
 * once are buffered instead of dropped. Returns null at end of input.
 */
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = rl[Symbol.asyncIterator]();
  return {
    async ask(question) {
      process.stdout.write(question);
      const { value, done } = await lines.next();
      return done ? null : value;
    },
    close: () => rl.close(),
  };
}

async function askHumanMove(prompter, board) {
  while (true) {
    const answer = await prompter.ask(`Your move (1-${COLS}, q to quit): `);
    if (answer === null) return null;
    const raw = answer.trim().toLowerCase();
    if (["q", "quit", "exit"].includes(raw)) return null;
    if (!/^\d+$/.test(raw)) {
      console.log("Please enter a column number.");
      continue;
    }
    const col = Number(raw) - 1;
    if (col < 0 || col >= COLS) console.log(`Column must be between 1 and ${COLS}.`);
    else if (!isValidMove(board, col)) console.log("That column is full, pick another.");
    else return col;
  }
}

async function play(prompter, depth, humanFirst = true) {
  const board = createBoard();
  let humanTurn = humanFirst;
  console.log(`\nYou are ${HUMAN}, the computer is ${COMPUTER}. Connect four to win!\n`);

  while (true) {
    console.log(render(board));
    if (humanTurn) {
      const col = await askHumanMove(prompter, board);
      if (col === null) {
        console.log("Goodbye!");
        return null;
      }
      dropPiece(board, col, HUMAN);
      if (isWinner(board, HUMAN)) {
        console.log(render(board));
        console.log("\nYou win! Congratulations!");
        return HUMAN;
      }
    } else {
      console.log("Computer is thinking...");
      const col = computerMove(board, depth);
      dropPiece(board, col, COMPUTER);
      console.log(`Computer plays column ${col + 1}.`);
      if (isWinner(board, COMPUTER)) {
        console.log(render(board));
        console.log("\nThe computer wins. Better luck next time!");
        return COMPUTER;
      }
    }

    if (isFull(board)) {
      console.log(render(board));
      console.log("\nIt's a draw!");
      return EMPTY;
    }
    humanTurn = !humanTurn;
    console.log();
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      difficulty: { type: "string", short: "d", default: "medium" },
      "computer-first": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) {
    console.log("Usage: node four_in_a_row.js [--difficulty easy|medium|hard] [--computer-first]");
    return;
  }
  if (!(values.difficulty in DIFFICULTY_DEPTH)) {
    console.error(`Unknown difficulty "${values.difficulty}". Choose easy, medium or hard.`);
    process.exitCode = 2;
    return;
  }

  const prompter = createPrompter();
  let humanFirst = !values["computer-first"];
  try {
    while (true) {
      const result = await play(prompter, DIFFICULTY_DEPTH[values.difficulty], humanFirst);
      if (result === null) break;
      const again = await prompter.ask("\nPlay again? (y/n): ");
      if (again === null || !["y", "yes"].includes(again.trim().toLowerCase())) break;
      humanFirst = !humanFirst; // alternate who starts
    }
  } finally {
    prompter.close();
  }
}

if (require.main === module) {
  process.on("SIGINT", () => {
    console.log("\nGoodbye!");
    process.exit(0);
  });
  main();
}

module.exports = { ...engine, render };
