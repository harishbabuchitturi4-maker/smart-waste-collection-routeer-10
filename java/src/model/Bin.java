package model;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: OOPJ (Object-Oriented Programming in Java) & ADSA (Data Structure Node)
 * ==============================================================================
 * 
 * Bin represents a smart waste container placed at a specific city location.
 * Each bin records:
 * 1. Physical location (x, y) coordinates on the city grid.
 * 2. Current fill level (in liters and percentage).
 * 3. Predicted fill rate (calculated by the Python Linear Regression module).
 * 4. Priority score (used by the ADSA Max-Heap to prioritize urgent collections).
 */
public class Bin implements Comparable<Bin> {
    private String id;
    private String locationName;
    private double x;
    private double y;
    private double capacityLiters;
    private double currentFillLiters;
    
    // Updated after Python Regression step
    private double predictedFillRatePerHour; // Rate of waste accumulation (%/hour)
    private double priorityScore;            // Dynamic urgency score for Max-Heap
    private boolean isScheduledForCollection;

    public Bin(String id, String locationName, double x, double y, double capacityLiters, double currentFillLiters) {
        this.id = id;
        this.locationName = locationName;
        this.x = x;
        this.y = y;
        this.capacityLiters = capacityLiters;
        this.currentFillLiters = currentFillLiters;
        this.predictedFillRatePerHour = 0.0;
        this.isScheduledForCollection = false;
        computePriorityScore(6.0); // Default 6-hour lookahead window
    }

    /**
     * Calculates the fill level as a percentage (0.0% to 100.0%).
     */
    public double getFillPercentage() {
        return Math.min(100.0, (currentFillLiters / capacityLiters) * 100.0);
    }

    /**
     * ADSA & AI Priority Function:
     * Combines Current Fill Level + Predicted Waste Growth over the lookahead window.
     * 
     * Formula:
     * Priority = Current_Fill% + (Predicted_Rate_per_hr * Lookahead_Hours)
     * If Current_Fill% >= 80%, an emergency bonus (+25) is added to ensure immediate pickup.
     */
    public void computePriorityScore(double lookaheadHours) {
        double currentPct = getFillPercentage();
        double futurePredictedPct = currentPct + (predictedFillRatePerHour * lookaheadHours);
        
        // Critical urgency boost for bins overflowing or nearly full
        double emergencyBonus = (currentPct >= 80.0) ? 25.0 : 0.0;
        
        this.priorityScore = futurePredictedPct + emergencyBonus;
    }

    /**
     * Compares two bins for the ADSA Max-Heap.
     * Higher priorityScore comes first (Max-Heap order).
     */
    @Override
    public int compareTo(Bin other) {
        return Double.compare(other.priorityScore, this.priorityScore);
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getLocationName() { return locationName; }
    public double getX() { return x; }
    public double getY() { return y; }
    public double getCapacityLiters() { return capacityLiters; }
    public double getCurrentFillLiters() { return currentFillLiters; }
    public void setCurrentFillLiters(double liters) {
        this.currentFillLiters = Math.max(0, Math.min(capacityLiters, liters));
    }
    public double getPredictedFillRatePerHour() { return predictedFillRatePerHour; }
    public void setPredictedFillRatePerHour(double rate) {
        this.predictedFillRatePerHour = rate;
    }
    public double getPriorityScore() { return priorityScore; }
    public boolean isScheduledForCollection() { return isScheduledForCollection; }
    public void setScheduledForCollection(boolean scheduled) { this.isScheduledForCollection = scheduled; }

    /**
     * Empties the bin during truck collection.
     */
    public double emptyBin() {
        double collected = this.currentFillLiters;
        this.currentFillLiters = 0.0;
        this.isScheduledForCollection = false;
        computePriorityScore(6.0);
        return collected;
    }

    @Override
    public String toString() {
        return String.format("[%s: %s | Fill: %.1f%% (%.0f/%.0f L) | Rate: +%.2f%%/hr | Priority: %.1f]",
                id, locationName, getFillPercentage(), currentFillLiters, capacityLiters,
                predictedFillRatePerHour, priorityScore);
    }
}
