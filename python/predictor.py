"""
==============================================================================
PROJECT: Smart Waste Collection Router (Team 10)
SUBJECT: Python (Machine Learning / Statistics - Linear Regression)
==============================================================================

This script performs Simple Linear Regression (Ordinary Least Squares) on
historical waste bin fill-level data to compute:
1. Slope (m): Waste accumulation fill-rate (% increase per hour).
2. Intercept (c): Baseline fill level at t=0.
3. R^2 Score (Coefficient of Determination): Goodness of fit.
4. Estimated time until bin reaches 100% capacity.

Mathematical Formulation:
    y = m * x + c

    m = (N * Σ(xy) - Σx * Σy) / (N * Σ(x^2) - (Σx)^2)
    c = (Σy - m * Σx) / N
    R^2 = 1 - (SS_res / SS_tot)

Zero External Dependencies:
    Uses standard Python library (csv, math, json, argparse) so it runs
    instantly on ANY student machine without requiring 'pip install'.
"""

import sys
import os
import csv
import json
import argparse
from typing import Dict, List, Tuple


def calculate_linear_regression(x_vals: List[float], y_vals: List[float]) -> Tuple[float, float, float]:
    """
    Computes slope (m), intercept (c), and R^2 score using Ordinary Least Squares.
    """
    n = len(x_vals)
    if n < 2:
        return 0.0, (y_vals[0] if y_vals else 0.0), 1.0

    sum_x = sum(x_vals)
    sum_y = sum(y_vals)
    sum_xy = sum(x * y for x, y in zip(x_vals, y_vals))
    sum_x2 = sum(x * x for x in x_vals)

    denominator = (n * sum_x2) - (sum_x * sum_x)
    if abs(denominator) < 1e-9:
        # Vertical line or no variation in x
        m = 0.0
    else:
        m = ((n * sum_xy) - (sum_x * sum_y)) / denominator

    c = (sum_y - (m * sum_x)) / n

    # Compute R^2 score
    mean_y = sum_y / n
    ss_tot = sum((y - mean_y) ** 2 for y in y_vals)
    ss_res = sum((y - (m * x + c)) ** 2 for x, y in zip(x_vals, y_vals))

    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 1e-9 else 1.0
    return max(0.0, round(m, 4)), round(c, 4), max(0.0, min(1.0, round(r2, 4)))


def process_historical_data(input_csv_path: str, output_json_path: str):
    print("=" * 70)
    print(" [PYTHON] Smart Waste Collection Router - Linear Regression Engine")
    print("=" * 70)
    print(f"Reading historical bin data from: {input_csv_path}")

    if not os.path.exists(input_csv_path):
        print(f"Error: Input file '{input_csv_path}' not found!")
        sys.exit(1)

    bin_data: Dict[str, Dict[str, List[float]]] = {}

    with open(input_csv_path, mode="r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            bin_id = row["bin_id"].strip()
            hour = float(row["hour"])
            fill_pct = float(row["fill_percentage"])

            if bin_id not in bin_data:
                bin_data[bin_id] = {"hours": [], "fill": []}
            bin_data[bin_id]["hours"].append(hour)
            bin_data[bin_id]["fill"].append(fill_pct)

    results = {}
    print(f"\nProcessing regression for {len(bin_data)} bins:\n")
    print(f"{'Bin ID':<10} | {'Current %':<10} | {'Fill Rate (%/hr)':<18} | {'R^2 Score':<10} | {'Hours to 100%':<15}")
    print("-" * 72)

    for bin_id, data in sorted(bin_data.items()):
        hours = data["hours"]
        fill_levels = data["fill"]
        current_fill = fill_levels[-1] if fill_levels else 0.0

        slope, intercept, r2 = calculate_linear_regression(hours, fill_levels)

        # Hours until bin is completely full
        if slope > 0.01:
            hours_to_full = round(max(0.0, (100.0 - current_fill) / slope), 1)
        else:
            hours_to_full = 999.0  # negligible fill rate

        results[bin_id] = {
            "current_fill_percentage": round(current_fill, 2),
            "predicted_rate_per_hour": slope,
            "intercept": intercept,
            "r2_score": r2,
            "hours_to_full": hours_to_full,
            "urgency": "CRITICAL" if current_fill >= 80 or hours_to_full <= 2.5 else ("WARNING" if current_fill >= 50 else "NORMAL")
        }

        print(f"{bin_id:<10} | {current_fill:>8.1f}% | {slope:>14.2f} %/hr | {r2:>9.3f} | {hours_to_full:>12.1f} hrs")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_json_path)), exist_ok=True)
    with open(output_json_path, mode="w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("-" * 72)
    print(f"[Python] Regression results successfully exported to: {output_json_path}\n")


def main():
    parser = argparse.ArgumentParser(description="Waste Bin Fill-Rate Regression Model")
    parser.add_argument("--input", default="data/historical_fill_data.csv", help="Path to input CSV file")
    parser.add_argument("--output", default="data/predicted_fill_rates.json", help="Path to output JSON file")
    args = parser.parse_args()

    process_historical_data(args.input, args.output)


if __name__ == "__main__":
    main()
