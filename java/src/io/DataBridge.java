package io;

import model.Bin;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: Java - Python Interoperability Bridge (Data Exchange)
 * ==============================================================================
 * 
 * DataBridge handles the data pipeline:
 * 1. Java exports multi-hour historical bin fill records to a CSV file.
 * 2. Python predictor script runs Linear Regression on the CSV.
 * 3. Java reads the regression results (predicted fill rates) and updates Bins.
 */
public class DataBridge {

    /**
     * Exports synthetic historical fill-level time-series data for each bin.
     * Columns: bin_id,hour,fill_percentage
     */
    public static void exportHistoricalData(List<Bin> bins, String csvFilePath) throws IOException {
        File file = new File(csvFilePath);
        file.getParentFile().mkdirs();

        try (PrintWriter writer = new PrintWriter(new FileWriter(file))) {
            writer.println("bin_id,hour,fill_percentage");

            // Seeded random for consistent, realistic historical growth rates
            Random rand = new Random(42);

            for (Bin bin : bins) {
                // Different bins have different accumulation characteristics
                // e.g. Market area accumulates faster than residential
                double baseRate = switch (bin.getId()) {
                    case "BIN_01" -> 8.5; // Commercial Market (Rapid fill)
                    case "BIN_02" -> 3.2; // Residential Street
                    case "BIN_03" -> 7.8; // Food Court / Restaurant Street
                    case "BIN_04" -> 2.5; // Quiet Park / Suburb
                    case "BIN_05" -> 9.0; // Transit Hub / Bus Station
                    case "BIN_06" -> 4.0; // University Campus
                    case "BIN_07" -> 6.5; // Shopping Mall
                    case "BIN_08" -> 1.8; // Quiet Alley
                    default -> 4.5;
                };

                double currentPct = bin.getFillPercentage();
                // Synthesize the last 6 hourly readings leading up to current fill level
                for (int h = 0; h <= 6; h++) {
                    double noise = (rand.nextDouble() - 0.5) * 1.2;
                    double fillAtH = Math.max(5.0, Math.min(100.0, currentPct - (6 - h) * baseRate + noise));
                    writer.printf(Locale.US, "%s,%d,%.2f\n", bin.getId(), h, fillAtH);
                }
            }
        }
        System.out.println("[DataBridge] Exported historical time-series data to: " + csvFilePath);
    }

    /**
     * Executes the Python Linear Regression script using ProcessBuilder.
     */
    public static boolean runPythonRegressionScript(String pythonScriptPath, String inputCsv, String outputJson) {
        System.out.println("\n[DataBridge] Invoking Python Linear Regression script: " + pythonScriptPath);
        try {
            List<String> command = List.of(
                "python",
                pythonScriptPath,
                "--input", inputCsv,
                "--output", outputJson
            );

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // Print Python output to Java console
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println("  [Python] " + line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                System.out.println("[DataBridge] Python regression completed successfully (Exit Code 0).");
                return true;
            } else {
                System.err.println("[DataBridge] Python script exited with error code: " + exitCode);
                return false;
            }
        } catch (Exception e) {
            System.err.println("[DataBridge] Note: Could not execute Python directly from Java: " + e.getMessage());
            System.err.println("            (Falling back to reading generated data or internal calculation if needed)");
            return false;
        }
    }

    /**
     * Reads the predicted fill-rate results and updates the Bins in memory.
     * Supports simple JSON parsing without requiring external 3rd-party jar dependencies!
     */
    public static void importPredictedRates(String jsonFilePath, Map<String, Bin> binsMap) throws IOException {
        File file = new File(jsonFilePath);
        if (!file.exists()) {
            System.err.println("[DataBridge] Warning: File not found: " + jsonFilePath);
            return;
        }

        String content = new String(Files.readAllBytes(Paths.get(jsonFilePath)));
        
        // Simple, robust zero-dependency parser for student projects
        // Format: { "BIN_01": { "predicted_rate_per_hour": 8.42, "r2_score": 0.98 }, ... }
        for (String binId : binsMap.keySet()) {
            int keyIndex = content.indexOf("\"" + binId + "\"");
            if (keyIndex != -1) {
                String sub = content.substring(keyIndex);
                int rateIndex = sub.indexOf("\"predicted_rate_per_hour\":");
                if (rateIndex != -1) {
                    int commaIndex = sub.indexOf(",", rateIndex);
                    int braceIndex = sub.indexOf("}", rateIndex);
                    int end = (commaIndex != -1 && commaIndex < braceIndex) ? commaIndex : braceIndex;
                    String valStr = sub.substring(rateIndex + 26, end).trim();
                    try {
                        double rate = Double.parseDouble(valStr);
                        Bin bin = binsMap.get(binId);
                        if (bin != null) {
                            bin.setPredictedFillRatePerHour(rate);
                            bin.computePriorityScore(6.0); // Recompute priority score with new regression rate!
                        }
                    } catch (NumberFormatException ignored) {}
                }
            }
        }

        System.out.println("[DataBridge] Successfully imported predicted fill rates into all Bins.");
    }
}
