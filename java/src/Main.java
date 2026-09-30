import adsa.BinMaxHeap;
import adsa.RoadGraph;
import ai.AStarRouter;
import ai.RoutePlan;
import io.DataBridge;
import model.Bin;
import model.Truck;
import oopj.FleetManager;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * 
 * INTEGRATION SUMMARY OF 4 SUBJECTS:
 * 1. AI: A* Shortest Path Search Algorithm with Euclidean Heuristic.
 * 2. ADSA (Unit 2): Road Graph (Adjacency List) & Dynamic Bin Max-Heap.
 * 3. OOPJ: Object-Oriented Architecture (FleetManager, Truck, Bin, Edge).
 * 4. PYTHON: Ordinary Least Squares (OLS) Linear Regression for fill-rate forecasting.
 * ==============================================================================
 */
public class Main {

    public static void main(String[] args) {
        printBanner();

        // --------------------------------------------------------------------------
        // STEP 1 [ADSA & OOPJ]: Setup City Road Graph and Waste Bins
        // --------------------------------------------------------------------------
        System.out.println("================================================================================");
        System.out.println(" [STEP 1] Initializing City Road Network Graph & Bin Sensors");
        System.out.println("================================================================================");

        RoadGraph cityGraph = buildSampleCityGraph();
        FleetManager fleetManager = new FleetManager("DEPOT");

        // Register municipal truck (Capacity: 2500 Liters, 3.5 km/L diesel efficiency)
        Truck truck = new Truck("TRUCK-101", "EcoFleet Alpha", 2500.0, 3.5, "DEPOT");
        fleetManager.addTruck(truck);

        // Register Smart Bins across the city with realistic initial readings
        // Parameters: ID, Location Name, X, Y, Capacity (L), Current Fill (L)
        fleetManager.registerBin(new Bin("BIN_01", "City Center Market",  2.0,  5.0, 500, 410)); // 82% (Full)
        fleetManager.registerBin(new Bin("BIN_02", "Greenwood Suburb",     4.0,  9.0, 400, 110)); // 27.5%
        fleetManager.registerBin(new Bin("BIN_03", "Railway Food Street",  7.0,  8.0, 600, 450)); // 75% (Near-full)
        fleetManager.registerBin(new Bin("BIN_04", "Riverside Park",       8.0,  4.0, 350,  90)); // 25.7%
        fleetManager.registerBin(new Bin("BIN_05", "Metro Transit Hub",    6.0,  2.0, 700, 520)); // 74.3%
        fleetManager.registerBin(new Bin("BIN_06", "Tech University",      3.0,  1.0, 500, 240)); // 48%
        fleetManager.registerBin(new Bin("BIN_07", "Grand Plaza Mall",     5.0,  6.0, 600, 390)); // 65%
        fleetManager.registerBin(new Bin("BIN_08", "Old Town Alley",       1.0,  8.0, 300,  70)); // 23.3%

        System.out.println("City network initialized with 8 smart bins and 1 central depot.");
        fleetManager.printFleetStatus();

        // --------------------------------------------------------------------------
        // STEP 2 [ADSA]: Build Initial Max-Heap (Prioritizing without regression)
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 2] ADSA Unit 2: Building Initial Max-Heap (Static Fill Levels Only)");
        System.out.println("================================================================================");

        BinMaxHeap initialHeap = new BinMaxHeap();
        for (Bin b : fleetManager.getAllBins()) {
            initialHeap.insert(b);
        }

        System.out.println("Initial Max-Heap Top Priority Bin: " + initialHeap.peekMax().getId() + 
                           " (" + initialHeap.peekMax().getLocationName() + ") with priority score: " + 
                           String.format("%.1f", initialHeap.peekMax().getPriorityScore()));
        initialHeap.printHeapTree();

        // --------------------------------------------------------------------------
        // STEP 3 [DATA BRIDGE]: Export Historical Sensor Readings to CSV for Python
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 3] Exporting Historical Bin Sensor Readings to CSV for Python");
        System.out.println("================================================================================");

        String csvPath = "data/historical_fill_data.csv";
        String jsonPath = "data/predicted_fill_rates.json";
        String pythonScriptPath = "python/predictor.py";

        try {
            DataBridge.exportHistoricalData(fleetManager.getAllBins(), csvPath);
        } catch (Exception e) {
            System.err.println("Error writing CSV: " + e.getMessage());
        }

        // --------------------------------------------------------------------------
        // STEP 4 [PYTHON]: Run Linear Regression to Calculate Fill Rates
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 4] Executing Python Module: Linear Regression on Time-Series Data");
        System.out.println("================================================================================");

        boolean pythonSuccess = DataBridge.runPythonRegressionScript(pythonScriptPath, csvPath, jsonPath);
        
        // If Python was run externally or output already exists, import predictions
        File jsonFile = new File(jsonPath);
        if (jsonFile.exists()) {
            try {
                DataBridge.importPredictedRates(jsonPath, getBinsMap(fleetManager));
            } catch (Exception e) {
                System.err.println("Error reading JSON predictions: " + e.getMessage());
            }
        }

        // --------------------------------------------------------------------------
        // STEP 5 [ADSA RE-PRIORITIZATION]: Re-prioritize Max-Heap using Predicted Rates
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 5] ADSA Unit 2: Re-prioritizing Max-Heap using Python Predicted Fill Rates");
        System.out.println("================================================================================");

        BinMaxHeap smartHeap = new BinMaxHeap();
        smartHeap.buildHeap(fleetManager.getAllBins());

        System.out.println("Updated Bins with Predicted Fill Rates (%/hr):");
        for (Bin b : fleetManager.getAllBins()) {
            System.out.printf("  %-8s | Current: %5.1f%% | Predicted Rate: +%4.2f%%/hr | Dynamic Priority: %5.1f\n",
                    b.getId(), b.getFillPercentage(), b.getPredictedFillRatePerHour(), b.getPriorityScore());
        }

        System.out.println("\nRe-prioritized Max-Heap Top Priority Bin: " + smartHeap.peekMax().getId() + 
                           " (" + smartHeap.peekMax().getLocationName() + ") with priority score: " + 
                           String.format("%.1f", smartHeap.peekMax().getPriorityScore()));
        smartHeap.printHeapTree();

        // --------------------------------------------------------------------------
        // STEP 6 [AI - A*]: Extract High Priority Bins & Plan Optimal Route
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 6] AI Route Planning: A* Algorithm over Road Graph");
        System.out.println("================================================================================");

        // Only collect bins that exceed critical threshold or will overflow today
        List<Bin> binsToCollect = new ArrayList<>();
        double collectionThreshold = 55.0; // Priority threshold for today's run

        System.out.println("Extracting bins needing collection from Max-Heap (Threshold: > 55.0 priority):");
        while (!smartHeap.isEmpty()) {
            Bin candidate = smartHeap.extractMax();
            if (candidate.getPriorityScore() >= collectionThreshold) {
                binsToCollect.add(candidate);
                System.out.printf("  [EXTRACTED] %-8s (Priority: %5.1f, Fill: %4.1f%%, Rate: +%4.2f%%/hr)\n",
                        candidate.getId(), candidate.getPriorityScore(), candidate.getFillPercentage(), candidate.getPredictedFillRatePerHour());
            } else {
                System.out.printf("  [SKIPPED]   %-8s (Priority: %5.1f - Low fill, will collect next cycle)\n",
                        candidate.getId(), candidate.getPriorityScore());
            }
        }

        AStarRouter router = new AStarRouter();
        RoutePlan smartPlan = router.planSmartCollectionRoute(cityGraph, fleetManager.getDepotNodeId(), binsToCollect, truck);

        System.out.println("\n--- Smart A* Route Plan Results ---");
        System.out.println("Path Sequence: " + String.join(" -> ", smartPlan.getNodePath()));
        System.out.printf("Total Smart Route Distance: %.2f km\n", smartPlan.getTotalDistanceKm());
        System.out.printf("Total Smart Route Fuel:     %.2f Liters\n", smartPlan.getEstimatedFuelLiters());
        System.out.printf("Bins Serviced:              %d of %d\n", smartPlan.getServicedBinIds().size(), fleetManager.getAllBins().size());
        System.out.printf("Waste Collected:            %.0f Liters\n", smartPlan.getTotalWasteCollectedLiters());

        // --------------------------------------------------------------------------
        // STEP 7 [COMPARISON]: Smart Route vs Conventional "Visit-All-Bins" Route
        // --------------------------------------------------------------------------
        System.out.println("\n================================================================================");
        System.out.println(" [STEP 7] Performance Benchmark: Conventional Route vs Smart Route");
        System.out.println("================================================================================");

        Truck dummyTruck = new Truck("DUMMY-01", "Conventional Baseline", 5000.0, 3.5, "DEPOT");
        RoutePlan conventionalPlan = router.planConventionalRoute(cityGraph, fleetManager.getDepotNodeId(), fleetManager.getAllBins(), dummyTruck);

        double distanceSavedKm = conventionalPlan.getTotalDistanceKm() - smartPlan.getTotalDistanceKm();
        double fuelSavedLiters = conventionalPlan.getEstimatedFuelLiters() - smartPlan.getEstimatedFuelLiters();
        double fuelSavingsPercentage = (fuelSavedLiters / conventionalPlan.getEstimatedFuelLiters()) * 100.0;
        double co2SavedKg = fuelSavedLiters * 2.68; // ~2.68 kg CO2 emitted per liter of diesel

        System.out.printf("%-30s | %-18s | %-18s\n", "Metric", "Conventional Route", "Smart Waste Router");
        System.out.println("--------------------------------------------------------------------------------");
        System.out.printf("%-30s | %-15.2f km | %-15.2f km\n", "Total Travel Distance", conventionalPlan.getTotalDistanceKm(), smartPlan.getTotalDistanceKm());
        System.out.printf("%-30s | %-15.2f L  | %-15.2f L\n", "Diesel Fuel Consumed", conventionalPlan.getEstimatedFuelLiters(), smartPlan.getEstimatedFuelLiters());
        System.out.printf("%-30s | %-18s | %-18s\n", "Bins Visited", conventionalPlan.getServicedBinIds().size() + " (All)", smartPlan.getServicedBinIds().size() + " (Prioritized)");
        System.out.printf("%-30s | %-18s | %-15.1f %%\n", "Fuel Efficiency Gain", "0.0% (Baseline)", fuelSavingsPercentage);
        System.out.printf("%-30s | %-18s | %-15.2f kg\n", "CO2 Emissions Prevented", "0.0 kg", co2SavedKg);
        System.out.println("--------------------------------------------------------------------------------");
        System.out.printf("RESULT: Saved %.2f km and %.2f Liters of diesel (%.1f%% fuel savings)!\n\n",
                distanceSavedKm, fuelSavedLiters, fuelSavingsPercentage);
    }

    private static java.util.Map<String, Bin> getBinsMap(FleetManager fm) {
        java.util.Map<String, Bin> map = new java.util.HashMap<>();
        for (Bin b : fm.getAllBins()) {
            map.put(b.getId(), b);
        }
        return map;
    }

    /**
     * Builds the sample city road graph with depot, intersections, and bins.
     */
    private static RoadGraph buildSampleCityGraph() {
        RoadGraph g = new RoadGraph();

        // City vertices with (x, y) coordinates (in km)
        g.addNode("DEPOT",  0.0, 0.0);
        g.addNode("INT_1",  2.0, 2.0);
        g.addNode("INT_2",  5.0, 3.0);
        g.addNode("INT_3",  4.0, 7.0);

        // Bin locations
        g.addNode("BIN_01", 2.0, 5.0);
        g.addNode("BIN_02", 4.0, 9.0);
        g.addNode("BIN_03", 7.0, 8.0);
        g.addNode("BIN_04", 8.0, 4.0);
        g.addNode("BIN_05", 6.0, 2.0);
        g.addNode("BIN_06", 3.0, 1.0);
        g.addNode("BIN_07", 5.0, 6.0);
        g.addNode("BIN_08", 1.0, 8.0);

        // Roads (weighted edges with distance in km and traffic factors)
        g.addEdge("DEPOT", "INT_1", 2.8);
        g.addEdge("DEPOT", "BIN_06", 3.2);

        g.addEdge("INT_1", "BIN_06", 1.4);
        g.addEdge("INT_1", "BIN_01", 3.0);
        g.addEdge("INT_1", "INT_2", 3.2);

        g.addEdge("INT_2", "BIN_05", 1.4);
        g.addEdge("INT_2", "BIN_07", 3.0);
        g.addEdge("INT_2", "BIN_04", 3.2);

        g.addEdge("BIN_05", "BIN_04", 2.8);

        g.addEdge("BIN_01", "BIN_08", 3.2);
        g.addEdge("BIN_01", "INT_3", 2.8);
        g.addEdge("BIN_01", "BIN_07", 3.2);

        g.addEdge("INT_3", "BIN_08", 3.2);
        g.addEdge("INT_3", "BIN_02", 2.0);
        g.addEdge("INT_3", "BIN_07", 1.4);
        g.addEdge("INT_3", "BIN_03", 3.2);

        g.addEdge("BIN_07", "BIN_03", 2.8);
        g.addEdge("BIN_04", "BIN_03", 4.1);
        g.addEdge("BIN_02", "BIN_03", 3.2);

        return g;
    }

    private static void printBanner() {
        System.out.println("================================================================================");
        System.out.println("    SMART WASTE COLLECTION ROUTER - TEAM 10");
        System.out.println("    AI + ADSA (Unit 2) + OOPJ + Python Regression");
        System.out.println("================================================================================");
    }
}
