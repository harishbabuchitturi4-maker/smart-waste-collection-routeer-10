package model;

import java.util.ArrayList;
import java.util.List;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: OOPJ (Fleet Management & Truck Domain Model)
 * ==============================================================================
 * 
 * Truck represents a municipal waste collection vehicle in the fleet.
 * Features:
 * - Capacity tracking (prevents overloading).
 * - Real-time fuel consumption calculation.
 * - Route log tracking (distance, visited bins, stops).
 */
public class Truck {
    private String id;
    private String name;
    private double maxCapacityLiters;
    private double currentLoadLiters;
    private double fuelEfficiencyKmPerLiter; // e.g. 3.5 km per Liter for heavy trucks
    private String currentLocationId;
    private double totalDistanceKm;
    private List<String> routeHistory;

    public Truck(String id, String name, double maxCapacityLiters, double fuelEfficiencyKmPerLiter, String depotId) {
        this.id = id;
        this.name = name;
        this.maxCapacityLiters = maxCapacityLiters;
        this.fuelEfficiencyKmPerLiter = fuelEfficiencyKmPerLiter;
        this.currentLocationId = depotId;
        this.currentLoadLiters = 0.0;
        this.totalDistanceKm = 0.0;
        this.routeHistory = new ArrayList<>();
        this.routeHistory.add(depotId);
    }

    public boolean canAccommodate(double liters) {
        return (currentLoadLiters + liters) <= maxCapacityLiters;
    }

    public boolean loadWaste(Bin bin) {
        double litersToCollect = bin.getCurrentFillLiters();
        if (canAccommodate(litersToCollect)) {
            currentLoadLiters += bin.emptyBin();
            routeHistory.add(bin.getId());
            return true;
        }
        return false;
    }

    public void travelDistance(double distanceKm, String destinationId) {
        this.totalDistanceKm += distanceKm;
        this.currentLocationId = destinationId;
        if (!routeHistory.get(routeHistory.size() - 1).equals(destinationId)) {
            routeHistory.add(destinationId);
        }
    }

    public double calculateFuelConsumedLiters() {
        return totalDistanceKm / fuelEfficiencyKmPerLiter;
    }

    public double getLoadPercentage() {
        return (currentLoadLiters / maxCapacityLiters) * 100.0;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public double getMaxCapacityLiters() { return maxCapacityLiters; }
    public double getCurrentLoadLiters() { return currentLoadLiters; }
    public double getFuelEfficiencyKmPerLiter() { return fuelEfficiencyKmPerLiter; }
    public String getCurrentLocationId() { return currentLocationId; }
    public double getTotalDistanceKm() { return totalDistanceKm; }
    public List<String> getRouteHistory() { return new ArrayList<>(routeHistory); }

    public void reset(String depotId) {
        this.currentLocationId = depotId;
        this.currentLoadLiters = 0.0;
        this.totalDistanceKm = 0.0;
        this.routeHistory.clear();
        this.routeHistory.add(depotId);
    }

    @Override
    public String toString() {
        return String.format("[%s: %s | Load: %.1f%% (%.0f/%.0f L) | Traveled: %.2f km | Fuel: %.2f L]",
                id, name, getLoadPercentage(), currentLoadLiters, maxCapacityLiters,
                totalDistanceKm, calculateFuelConsumedLiters());
    }
}
