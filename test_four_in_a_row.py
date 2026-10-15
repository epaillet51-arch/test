import unittest

import four_in_a_row as g


class BoardTests(unittest.TestCase):
    def test_drop_stacks_from_bottom(self):
        board = g.create_board()
        self.assertEqual(g.drop_piece(board, 0, g.HUMAN), g.ROWS - 1)
        self.assertEqual(g.drop_piece(board, 0, g.HUMAN), g.ROWS - 2)

    def test_full_column_is_invalid(self):
        board = g.create_board()
        for _ in range(g.ROWS):
            g.drop_piece(board, 3, g.HUMAN)
        self.assertFalse(g.is_valid_move(board, 3))
        self.assertNotIn(3, g.valid_moves(board))
        with self.assertRaises(ValueError):
            g.drop_piece(board, 3, g.HUMAN)

    def test_wins_in_every_direction(self):
        cases = {
            "horizontal": [(5, c) for c in range(4)],
            "vertical": [(r, 2) for r in range(2, 6)],
            "diagonal down": [(i, i) for i in range(4)],
            "diagonal up": [(5 - i, i + 1) for i in range(4)],
        }
        for name, cells in cases.items():
            with self.subTest(name):
                board = g.create_board()
                for r, c in cells:
                    board[r][c] = g.COMPUTER
                self.assertTrue(g.is_winner(board, g.COMPUTER))
                self.assertFalse(g.is_winner(board, g.HUMAN))

    def test_three_is_not_a_win(self):
        board = g.create_board()
        for c in range(3):
            board[5][c] = g.HUMAN
        self.assertFalse(g.is_winner(board, g.HUMAN))


class ComputerTests(unittest.TestCase):
    def test_takes_immediate_win(self):
        board = g.create_board()
        for c in range(3):
            g.drop_piece(board, c, g.COMPUTER)
        col, _ = g.minimax(board, 4, float("-inf"), float("inf"), True)
        self.assertEqual(col, 3)

    def test_blocks_immediate_loss(self):
        board = g.create_board()
        for _ in range(3):
            g.drop_piece(board, 6, g.HUMAN)
        g.drop_piece(board, 0, g.COMPUTER)
        col, _ = g.minimax(board, 4, float("-inf"), float("inf"), True)
        self.assertEqual(col, 6)

    def test_always_returns_a_legal_move(self):
        board = g.create_board()
        for c in range(g.COLS - 1):
            # A filled top cell means the column is full; alternate pieces so nobody has won.
            board[0][c] = g.HUMAN if c % 2 else g.COMPUTER
        self.assertEqual(g.computer_move(board, 4), g.COLS - 1)


if __name__ == "__main__":
    unittest.main()
