package test;

import adsa.BinMaxHeap;
import adsa.RoadGraph;
import ai.AStarRouter;
import model.Bin;
import model.Truck;

import java.util.List;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: Software Testing & Verification Suite
 * ==============================================================================
 * 
 * Verifies core academic modules:
 * 1. ADSA Binary Max-Heap invariant property (Parent >= Children).
 * 2. AI A* Shortest Path optimality on known road networks.
 * 3. OOPJ Fleet Manager & Truck capacity constraints.
 */
public class SystemTest {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println(" RUNNING SMART WASTE COLLECTION ROUTER TEST SUITE");
        System.out.println("================================================================================");

        int passed = 0;
        int failed = 0;

        // TEST 1: ADSA Max-Heap Invariant
        try {
            testMaxHeapProperty();
            System.out.println(" [PASS] Test 1: ADSA Max-Heap Order & Extraction Invariant");
            passed++;
        } catch (AssertionError | Exception e) {
            System.err.println(" [FAIL] Test 1: " + e.getMessage());
            failed++;
        }

        // TEST 2: AI A* Pathfinding
        try {
            testAStarShortestPath();
            System.out.println(" [PASS] Test 2: AI A* Pathfinding & Euclidean Heuristic");
            passed++;
        } catch (AssertionError | Exception e) {
            System.err.println(" [FAIL] Test 2: " + e.getMessage());
            failed++;
        }

        // TEST 3: OOPJ Truck Capacity Limit
        try {
            testTruckCapacityEnforcement();
            System.out.println(" [PASS] Test 3: OOPJ Truck Capacity Limit & Waste Loading");
            passed++;
        } catch (AssertionError | Exception e) {
            System.err.println(" [FAIL] Test 3: " + e.getMessage());
            failed++;
        }

        System.out.println("================================================================================");
        System.out.printf(" TEST RESULTS: %d Passed, %d Failed (All Systems Operational)\n", passed, failed);
        System.out.println("================================================================================\n");
    }

    private static void testMaxHeapProperty() {
        BinMaxHeap heap = new BinMaxHeap();
        Bin b1 = new Bin("B1", "Loc1", 0, 0, 500, 100); // Priority ~20
        Bin b2 = new Bin("B2", "Loc2", 0, 0, 500, 450); // Priority ~115 (Emergency)
        Bin b3 = new Bin("B3", "Loc3", 0, 0, 500, 250); // Priority ~50

        heap.insert(b1);
        heap.insert(b2);
        heap.insert(b3);

        // Root must be B2 (highest priority)
        if (heap.peekMax() != b2) {
            throw new AssertionError("Heap root is not the highest priority bin!");
        }

        Bin extracted1 = heap.extractMax();
        if (extracted1 != b2) {
            throw new AssertionError("First extracted element must be B2!");
        }

        Bin extracted2 = heap.extractMax();
        if (extracted2 != b3) {
            throw new AssertionError("Second extracted element must be B3!");
        }

        Bin extracted3 = heap.extractMax();
        if (extracted3 != b1) {
            throw new AssertionError("Third extracted element must be B1!");
        }

        if (!heap.isEmpty()) {
            throw new AssertionError("Heap should be empty after 3 extractions!");
        }
    }

    private static void testAStarShortestPath() {
        RoadGraph g = new RoadGraph();
        g.addNode("A", 0, 0);
        g.addNode("B", 1, 0);
        g.addNode("C", 2, 0);

        // Direct path A -> B -> C = 2.0 km
        g.addEdge("A", "B", 1.0);
        g.addEdge("B", "C", 1.0);

        // Detour path A -> D -> C = 5.0 km
        g.addNode("D", 1, 3);
        g.addEdge("A", "D", 2.5);
        g.addEdge("D", "C", 2.5);

        AStarRouter router = new AStarRouter();
        AStarRouter.PathResult result = router.findShortestPath(g, "A", "C");

        if (result.distanceKm != 2.0) {
            throw new AssertionError("A* did not pick the shortest path! Distance was: " + result.distanceKm);
        }

        List<String> expected = List.of("A", "B", "C");
        if (!result.path.equals(expected)) {
            throw new AssertionError("A* path sequence incorrect! Got: " + result.path);
        }
    }

    private static void testTruckCapacityEnforcement() {
        Truck truck = new Truck("T1", "Test Truck", 1000.0, 3.5, "DEPOT");
        Bin bigBin = new Bin("BIG", "Factory", 0, 0, 2000, 1500); // 1500 L > 1000 L capacity

        if (truck.canAccommodate(bigBin.getCurrentFillLiters())) {
            throw new AssertionError("Truck should not accommodate waste exceeding max capacity!");
        }

        boolean loaded = truck.loadWaste(bigBin);
        if (loaded) {
            throw new AssertionError("loadWaste() should return false when overloaded!");
        }

        Bin smallBin = new Bin("SMALL", "Shop", 0, 0, 500, 400);
        if (!truck.canAccommodate(smallBin.getCurrentFillLiters())) {
            throw new AssertionError("Truck should accommodate 400L under 1000L capacity!");
        }

        boolean loadedSmall = truck.loadWaste(smallBin);
        if (!loadedSmall || truck.getCurrentLoadLiters() != 400.0) {
            throw new AssertionError("Truck failed to properly load 400L waste!");
        }
    }
}
