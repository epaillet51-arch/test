# Four in a Row

A terminal game of Four in a Row (Connect Four) against the computer, written in plain Python 3 with no dependencies.

## Play

```bash
python3 four_in_a_row.py                    # medium difficulty, you start
python3 four_in_a_row.py --difficulty hard  # easy | medium | hard
python3 four_in_a_row.py --computer-first
```

You play `X`, the computer plays `O`. Type a column number (1-7) to drop a piece, or `q` to quit. The first player to line up four pieces horizontally, vertically or diagonally wins. After each game you can play again, and the starting player alternates.

## How the computer plays

The computer uses minimax search with alpha-beta pruning. It looks 2, 4 or 6 moves ahead depending on the difficulty, and it scores positions by counting open lines of two and three and by favouring the centre column. On easy it sometimes plays a random move.

## Tests

```bash
python3 -m unittest
```
