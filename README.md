# Four in a Row

Four in a Row (Connect Four) against the computer, in three versions:

- **Browser**: `index.html`, with a clickable board
- **Python 3**: `four_in_a_row.py`, in the terminal
- **Node.js 18+**: `four_in_a_row.js`, in the terminal

None of them needs anything installed. All three play the same game with the same computer opponent.

## Play in the browser

Open `index.html` in a browser. It must stay in the same folder as `four_in_a_row_engine.js`. Click a column to drop your disc, or press `1`–`7`. You can also use the arrow keys and `Enter`. The side panel lets you:

- set the computer's strength
- choose who moves first
- take back a move
- start a new game

It also shows the move record and keeps a running score in your browser.

## Play in the terminal

```bash
python3 four_in_a_row.py                    # medium difficulty, you start
python3 four_in_a_row.py --difficulty hard  # easy | medium | hard
python3 four_in_a_row.py --computer-first

node four_in_a_row.js                       # same options
```

You play `X` and the computer plays `O`. Type a column number (1-7) to drop a piece, or `q` to quit. After each game you can play again, and the starting player alternates.

## How the computer plays

The computer uses minimax search with alpha-beta pruning. It looks 2, 4 or 6 moves ahead depending on the difficulty, and it scores positions by counting open lines of two and three and by favouring the centre column. On easy it sometimes plays a random move.

The JavaScript rules and computer player live in `four_in_a_row_engine.js`, which both the browser page and the Node version load.

## Tests

```bash
python3 -m unittest   # Python
node --test           # JavaScript
```
