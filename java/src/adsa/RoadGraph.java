package adsa;

import model.Edge;
import java.util.*;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: ADSA (Unit 2 - Graph Data Structures)
 * ==============================================================================
 * 
 * RoadGraph models the city road network as an undirected/directed weighted graph.
 * - Vertices: Waste Bin locations, road intersections, and the Central Truck Depot.
 * - Edges: Roads connecting vertices with physical distance (km) and traffic factor.
 * - Representation: Adjacency List (Map<String, List<Edge>>) for optimal O(V + E) space.
 */
public class RoadGraph {

    public static class NodeLocation {
        public final String id;
        public final double x;
        public final double y;

        public NodeLocation(String id, double x, double y) {
            this.id = id;
            this.x = x;
            this.y = y;
        }
    }

    private final Map<String, List<Edge>> adjacencyList;
    private final Map<String, NodeLocation> nodeCoordinates;

    public RoadGraph() {
        this.adjacencyList = new HashMap<>();
        this.nodeCoordinates = new HashMap<>();
    }

    /**
     * Adds a vertex to the graph with its 2D coordinates (x, y).
     */
    public void addNode(String nodeId, double x, double y) {
        adjacencyList.putIfAbsent(nodeId, new ArrayList<>());
        nodeCoordinates.put(nodeId, new NodeLocation(nodeId, x, y));
    }

    /**
     * Adds an edge between two vertices.
     * In city road networks, most streets are two-way, so bidirectional = true by default.
     */
    public void addEdge(String fromNode, String toNode, double distanceKm, double trafficFactor, boolean bidirectional) {
        addNode(fromNode, 0, 0); // ensure existence
        addNode(toNode, 0, 0);

        adjacencyList.get(fromNode).add(new Edge(toNode, distanceKm, trafficFactor));
        if (bidirectional) {
            adjacencyList.get(toNode).add(new Edge(fromNode, distanceKm, trafficFactor));
        }
    }

    public void addEdge(String fromNode, String toNode, double distanceKm) {
        addEdge(fromNode, toNode, distanceKm, 1.0, true);
    }

    public List<Edge> getNeighbors(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    public NodeLocation getNodeLocation(String nodeId) {
        return nodeCoordinates.get(nodeId);
    }

    public Set<String> getAllNodeIds() {
        return adjacencyList.keySet();
    }

    public Map<String, List<Edge>> getAdjacencyList() {
        return adjacencyList;
    }

    /**
     * Calculates direct Euclidean distance between two nodes (used as A* admissible heuristic).
     */
    public double getEuclideanDistance(String fromId, String toId) {
        NodeLocation a = nodeCoordinates.get(fromId);
        NodeLocation b = nodeCoordinates.get(toId);
        if (a == null || b == null) return 0.0;
        double dx = a.x - b.x;
        double dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Prints the Adjacency List representation (very useful for viva/lab presentations).
     */
    public void printGraphStructure() {
        System.out.println("\n--- [ADSA] Road Network Graph (Adjacency List) ---");
        for (String node : adjacencyList.keySet()) {
            StringBuilder sb = new StringBuilder(node + " -> ");
            for (Edge edge : adjacencyList.get(node)) {
                sb.append(String.format("[%s (%.1f km, tf: %.1f)] ", 
                    edge.getTargetNodeId(), edge.getDistanceKm(), edge.getTrafficFactor()));
            }
            System.out.println(sb.toString());
        }
    }
}
