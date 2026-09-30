"""
==============================================================================
PROJECT: Smart Waste Collection Router (Team 10)
SUBJECT: Python Regression Verification & Test Suite
==============================================================================
"""

import unittest
from predictor import calculate_linear_regression


class TestPredictor(unittest.TestCase):

    def test_linear_regression_perfect_fit(self):
        # Line: y = 2x + 10
        x_vals = [0.0, 1.0, 2.0, 3.0, 4.0]
        y_vals = [10.0, 12.0, 14.0, 16.0, 18.0]
        slope, intercept, r2 = calculate_linear_regression(x_vals, y_vals)

        self.assertAlmostEqual(slope, 2.0, places=3)
        self.assertAlmostEqual(intercept, 10.0, places=3)
        self.assertAlmostEqual(r2, 1.0, places=3)

    def test_linear_regression_flat_rate(self):
        # Horizontal line (no growth): y = 50
        x_vals = [0.0, 1.0, 2.0, 3.0]
        y_vals = [50.0, 50.0, 50.0, 50.0]
        slope, intercept, _ = calculate_linear_regression(x_vals, y_vals)

        self.assertAlmostEqual(slope, 0.0, places=3)
        self.assertAlmostEqual(intercept, 50.0, places=3)

    def test_single_point_safety(self):
        slope, intercept, r2 = calculate_linear_regression([1.0], [45.0])
        self.assertEqual(slope, 0.0)
        self.assertEqual(intercept, 45.0)


if __name__ == "__main__":
    print("=" * 60)
    print(" Running Python Linear Regression Unit Tests")
    print("=" * 60)
    unittest.main()
