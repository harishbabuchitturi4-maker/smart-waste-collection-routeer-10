package model;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: ADSA (Unit 2 - Graphs)
 * ==============================================================================
 * 
 * Edge represents a directed or undirected road segment connecting two vertices
 * in the road network graph.
 */
public class Edge {
    private String targetNodeId;
    private double distanceKm;
    private double trafficFactor; // 1.0 = normal, 1.5 = heavy traffic

    public Edge(String targetNodeId, double distanceKm, double trafficFactor) {
        this.targetNodeId = targetNodeId;
        this.distanceKm = distanceKm;
        this.trafficFactor = trafficFactor;
    }

    public Edge(String targetNodeId, double distanceKm) {
        this(targetNodeId, distanceKm, 1.0);
    }

    public String getTargetNodeId() {
        return targetNodeId;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getTrafficFactor() {
        return trafficFactor;
    }

    /**
     * Effective traversal cost (used in AI A* pathfinding g-cost).
     */
    public double getEffectiveCost() {
        return distanceKm * trafficFactor;
    }
}
