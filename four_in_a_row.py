#!/usr/bin/env python3
"""Four in a Row (Connect Four) - play against the computer in your terminal.

The computer uses minimax search with alpha-beta pruning.
Run:  python3 four_in_a_row.py [--difficulty easy|medium|hard]
"""

import argparse
import math
import random

ROWS = 6
COLS = 7
EMPTY = "."
HUMAN = "X"
COMPUTER = "O"
WINDOW = 4

DIFFICULTY_DEPTH = {"easy": 2, "medium": 4, "hard": 6}

# Prefer the centre columns when moves score equally; also speeds up pruning.
COLUMN_ORDER = sorted(range(COLS), key=lambda c: abs(c - COLS // 2))


def create_board():
    return [[EMPTY] * COLS for _ in range(ROWS)]


def is_valid_move(board, col):
    return 0 <= col < COLS and board[0][col] == EMPTY


def valid_moves(board):
    return [c for c in COLUMN_ORDER if is_valid_move(board, c)]


def drop_piece(board, col, piece):
    """Drop a piece into a column. Returns the row it landed in."""
    for row in range(ROWS - 1, -1, -1):
        if board[row][col] == EMPTY:
            board[row][col] = piece
            return row
    raise ValueError(f"Column {col + 1} is full")


def undo_piece(board, row, col):
    board[row][col] = EMPTY


def is_winner(board, piece):
    # Horizontal
    for r in range(ROWS):
        for c in range(COLS - 3):
            if all(board[r][c + i] == piece for i in range(WINDOW)):
                return True
    # Vertical
    for r in range(ROWS - 3):
        for c in range(COLS):
            if all(board[r + i][c] == piece for i in range(WINDOW)):
                return True
    # Diagonal down-right
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            if all(board[r + i][c + i] == piece for i in range(WINDOW)):
                return True
    # Diagonal up-right
    for r in range(3, ROWS):
        for c in range(COLS - 3):
            if all(board[r - i][c + i] == piece for i in range(WINDOW)):
                return True
    return False


def is_full(board):
    return all(cell != EMPTY for cell in board[0])


def _score_window(window, piece):
    opponent = HUMAN if piece == COMPUTER else COMPUTER
    mine = window.count(piece)
    theirs = window.count(opponent)
    empty = window.count(EMPTY)

    if mine == 4:
        return 100
    if mine == 3 and empty == 1:
        return 5
    if mine == 2 and empty == 2:
        return 2
    if theirs == 3 and empty == 1:
        return -4
    return 0


def _windows(board):
    for r in range(ROWS):
        for c in range(COLS - 3):
            yield [board[r][c + i] for i in range(WINDOW)]
    for r in range(ROWS - 3):
        for c in range(COLS):
            yield [board[r + i][c] for i in range(WINDOW)]
    for r in range(ROWS - 3):
        for c in range(COLS - 3):
            yield [board[r + i][c + i] for i in range(WINDOW)]
    for r in range(3, ROWS):
        for c in range(COLS - 3):
            yield [board[r - i][c + i] for i in range(WINDOW)]


def evaluate(board, piece):
    """Heuristic score of a position from `piece`'s point of view."""
    centre = [board[r][COLS // 2] for r in range(ROWS)]
    score = centre.count(piece) * 3
    for window in _windows(board):
        score += _score_window(window, piece)
    return score


def minimax(board, depth, alpha, beta, maximizing):
    """Return (best_column, score) for the computer."""
    moves = valid_moves(board)

    if is_winner(board, COMPUTER):
        return None, 1_000_000 + depth  # prefer faster wins
    if is_winner(board, HUMAN):
        return None, -1_000_000 - depth  # prefer slower losses
    if not moves:
        return None, 0
    if depth == 0:
        return None, evaluate(board, COMPUTER)

    best_col = moves[0]
    if maximizing:
        value = -math.inf
        for col in moves:
            row = drop_piece(board, col, COMPUTER)
            _, score = minimax(board, depth - 1, alpha, beta, False)
            undo_piece(board, row, col)
            if score > value:
                value, best_col = score, col
            alpha = max(alpha, value)
            if alpha >= beta:
                break
    else:
        value = math.inf
        for col in moves:
            row = drop_piece(board, col, HUMAN)
            _, score = minimax(board, depth - 1, alpha, beta, True)
            undo_piece(board, row, col)
            if score < value:
                value, best_col = score, col
            beta = min(beta, value)
            if alpha >= beta:
                break
    return best_col, value


def computer_move(board, depth):
    # A little randomness on easy keeps it beatable and less predictable.
    if depth <= DIFFICULTY_DEPTH["easy"] and random.random() < 0.25:
        return random.choice(valid_moves(board))
    col, _ = minimax(board, depth, -math.inf, math.inf, True)
    return col


def render(board):
    header = " ".join(str(c + 1) for c in range(COLS))
    lines = [header]
    lines += [" ".join(row) for row in board]
    lines.append("-" * len(header))
    return "\n".join(lines)


def ask_human_move(board):
    while True:
        raw = input(f"Your move (1-{COLS}, q to quit): ").strip().lower()
        if raw in ("q", "quit", "exit"):
            return None
        if not raw.isdigit():
            print("Please enter a column number.")
            continue
        col = int(raw) - 1
        if not 0 <= col < COLS:
            print(f"Column must be between 1 and {COLS}.")
        elif not is_valid_move(board, col):
            print("That column is full, pick another.")
        else:
            return col


def play(depth, human_first=True):
    board = create_board()
    human_turn = human_first
    print(f"\nYou are {HUMAN}, the computer is {COMPUTER}. Connect four to win!\n")

    while True:
        print(render(board))
        if human_turn:
            col = ask_human_move(board)
            if col is None:
                print("Goodbye!")
                return None
            drop_piece(board, col, HUMAN)
            if is_winner(board, HUMAN):
                print(render(board))
                print("\nYou win! Congratulations!")
                return HUMAN
        else:
            print("Computer is thinking...")
            col = computer_move(board, depth)
            drop_piece(board, col, COMPUTER)
            print(f"Computer plays column {col + 1}.")
            if is_winner(board, COMPUTER):
                print(render(board))
                print("\nThe computer wins. Better luck next time!")
                return COMPUTER

        if is_full(board):
            print(render(board))
            print("\nIt's a draw!")
            return EMPTY
        human_turn = not human_turn
        print()


def main():
    parser = argparse.ArgumentParser(description="Play Four in a Row against the computer.")
    parser.add_argument(
        "--difficulty", "-d", choices=DIFFICULTY_DEPTH, default="medium",
        help="computer strength (default: medium)",
    )
    parser.add_argument(
        "--computer-first", action="store_true", help="let the computer make the first move",
    )
    args = parser.parse_args()

    human_first = not args.computer_first
    try:
        while True:
            play(DIFFICULTY_DEPTH[args.difficulty], human_first)
            again = input("\nPlay again? (y/n): ").strip().lower()
            if again not in ("y", "yes"):
                break
            human_first = not human_first  # alternate who starts
    except (KeyboardInterrupt, EOFError):
        print("\nGoodbye!")


if __name__ == "__main__":
    main()
