package ai;

import adsa.RoadGraph;
import model.Bin;
import model.Edge;
import model.Truck;

import java.util.*;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: AI (Artificial Intelligence - A* Heuristic Search Algorithm)
 * ==============================================================================
 * 
 * AStarRouter implements the A* (A-Star) search algorithm for finding the
 * shortest path between any two nodes on the city road graph.
 * 
 * Mathematical Formulation:
 *   f(n) = g(n) + h(n)
 * 
 *   - g(n): Exact cost of the path from start node to current node n.
 *   - h(n): Admissible heuristic estimating cost from n to goal node.
 *           Here we use Euclidean Straight-Line Distance, which is ADMISSIBLE
 *           because a straight line is always <= actual road distance.
 *           Hence, A* is GUARANTEED to find the optimal shortest path!
 *   - f(n): Estimated total cost of cheapest solution through node n.
 */
public class AStarRouter {

    /**
     * Internal node wrapper for the A* Priority Queue.
     */
    private static class NodeWrapper implements Comparable<NodeWrapper> {
        final String nodeId;
        final double gScore;
        final double fScore;

        NodeWrapper(String nodeId, double gScore, double fScore) {
            this.nodeId = nodeId;
            this.gScore = gScore;
            this.fScore = fScore;
        }

        @Override
        public int compareTo(NodeWrapper other) {
            return Double.compare(this.fScore, other.fScore);
        }
    }

    public static class PathResult {
        public final List<String> path;
        public final double distanceKm;

        public PathResult(List<String> path, double distanceKm) {
            this.path = path;
            this.distanceKm = distanceKm;
        }
    }

    /**
     * Executes A* search to find the shortest path between startNode and goalNode.
     * 
     * @param graph The city road graph
     * @param startNode Starting intersection or bin ID
     * @param goalNode Destination intersection or bin ID
     * @return PathResult containing ordered node sequence and total distance
     */
    public PathResult findShortestPath(RoadGraph graph, String startNode, String goalNode) {
        if (startNode.equals(goalNode)) {
            return new PathResult(Collections.singletonList(startNode), 0.0);
        }

        PriorityQueue<NodeWrapper> openSet = new PriorityQueue<>();
        Map<String, Double> gScore = new HashMap<>();
        Map<String, String> cameFrom = new HashMap<>();
        Set<String> closedSet = new HashSet<>();

        // Initialize gScores to infinity
        for (String node : graph.getAllNodeIds()) {
            gScore.put(node, Double.POSITIVE_INFINITY);
        }

        gScore.put(startNode, 0.0);
        double initialH = graph.getEuclideanDistance(startNode, goalNode);
        openSet.add(new NodeWrapper(startNode, 0.0, initialH));

        while (!openSet.isEmpty()) {
            NodeWrapper currentWrapper = openSet.poll();
            String current = currentWrapper.nodeId;

            // Reached destination!
            if (current.equals(goalNode)) {
                return reconstructPath(cameFrom, current, gScore.get(goalNode));
            }

            if (closedSet.contains(current)) continue;
            closedSet.add(current);

            // Explore all connected road neighbors
            for (Edge edge : graph.getNeighbors(current)) {
                String neighbor = edge.getTargetNodeId();
                if (closedSet.contains(neighbor)) continue;

                double tentativeGScore = gScore.get(current) + edge.getEffectiveCost();

                if (tentativeGScore < gScore.get(neighbor)) {
                    cameFrom.put(neighbor, current);
                    gScore.put(neighbor, tentativeGScore);
                    double h = graph.getEuclideanDistance(neighbor, goalNode);
                    double f = tentativeGScore + h;
                    openSet.add(new NodeWrapper(neighbor, tentativeGScore, f));
                }
            }
        }

        // Return empty path if no route exists
        return new PathResult(Collections.emptyList(), 0.0);
    }

    private PathResult reconstructPath(Map<String, String> cameFrom, String current, double totalDistance) {
        List<String> path = new ArrayList<>();
        path.add(current);
        while (cameFrom.containsKey(current)) {
            current = cameFrom.get(current);
            path.add(0, current);
        }
        return new PathResult(path, totalDistance);
    }

    /**
     * Plans the complete daily collection tour for a truck visiting prioritized bins.
     * Uses A* for segment-by-segment optimal road navigation.
     */
    public RoutePlan planSmartCollectionRoute(RoadGraph graph, String depotId, List<Bin> prioritizedBins, Truck truck) {
        RoutePlan plan = new RoutePlan();
        String currentLocation = depotId;
        plan.addNodeToPath(currentLocation);

        double totalWasteCollected = 0.0;
        double totalDistance = 0.0;

        for (Bin bin : prioritizedBins) {
            // Check if truck capacity allows collecting this bin
            if (!truck.canAccommodate(bin.getCurrentFillLiters())) {
                System.out.printf("  [!] Truck %s reached capacity limit. Returning to depot.\n", truck.getId());
                break;
            }

            // Find A* shortest path from current position to this bin
            PathResult segment = findShortestPath(graph, currentLocation, bin.getId());
            if (segment.path.isEmpty()) {
                System.out.printf("  [!] Warning: No road path found from %s to %s\n", currentLocation, bin.getId());
                continue;
            }

            // Append segment path nodes (skipping duplicate start node)
            for (int i = 1; i < segment.path.size(); i++) {
                plan.addNodeToPath(segment.path.get(i));
            }

            totalDistance += segment.distanceKm;
            truck.travelDistance(segment.distanceKm, bin.getId());

            // Collect waste
            double waste = bin.getCurrentFillLiters();
            truck.loadWaste(bin);
            plan.addServicedBin(bin.getId());
            totalWasteCollected += waste;

            currentLocation = bin.getId();
        }

        // Return to Depot at the end of the tour
        PathResult returnSegment = findShortestPath(graph, currentLocation, depotId);
        for (int i = 1; i < returnSegment.path.size(); i++) {
            plan.addNodeToPath(returnSegment.path.get(i));
        }
        totalDistance += returnSegment.distanceKm;
        truck.travelDistance(returnSegment.distanceKm, depotId);

        plan.addDistance(totalDistance);
        plan.setEstimatedFuelLiters(totalDistance / truck.getFuelEfficiencyKmPerLiter());
        plan.setTotalWasteCollectedLiters(totalWasteCollected);

        return plan;
    }

    /**
     * Simulates the conventional baseline: visiting ALL bins in order regardless of fill level.
     */
    public RoutePlan planConventionalRoute(RoadGraph graph, String depotId, List<Bin> allBins, Truck truck) {
        RoutePlan plan = new RoutePlan();
        String currentLocation = depotId;
        plan.addNodeToPath(currentLocation);

        double totalDistance = 0.0;
        double totalWasteCollected = 0.0;

        for (Bin bin : allBins) {
            PathResult segment = findShortestPath(graph, currentLocation, bin.getId());
            for (int i = 1; i < segment.path.size(); i++) {
                plan.addNodeToPath(segment.path.get(i));
            }
            totalDistance += segment.distanceKm;
            totalWasteCollected += bin.getCurrentFillLiters();
            plan.addServicedBin(bin.getId());
            currentLocation = bin.getId();
        }

        PathResult returnSegment = findShortestPath(graph, currentLocation, depotId);
        for (int i = 1; i < returnSegment.path.size(); i++) {
            plan.addNodeToPath(returnSegment.path.get(i));
        }
        totalDistance += returnSegment.distanceKm;

        plan.addDistance(totalDistance);
        plan.setEstimatedFuelLiters(totalDistance / truck.getFuelEfficiencyKmPerLiter());
        plan.setTotalWasteCollectedLiters(totalWasteCollected);

        return plan;
    }
}
