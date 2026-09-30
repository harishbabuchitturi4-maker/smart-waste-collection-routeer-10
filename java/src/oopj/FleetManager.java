package oopj;

import model.Bin;
import model.Truck;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ==============================================================================
 * PROJECT: Smart Waste Collection Router (Team 10)
 * SUBJECT: OOPJ (Fleet Management System & Encapsulation)
 * ==============================================================================
 * 
 * FleetManager encapsulates the municipal vehicle fleet and coordinates
 * collection operations across the city grid.
 * 
 * OOP Principles Applied:
 * - Encapsulation: Hides internal state of trucks and bins behind clean APIs.
 * - Composition: Has-a relationship with Trucks and Bins.
 * - Single Responsibility: Manages fleet lifecycle, capacity distribution, and stats.
 */
public class FleetManager {
    private final String depotNodeId;
    private final List<Truck> trucks;
    private final Map<String, Bin> binsMap;

    public FleetManager(String depotNodeId) {
        this.depotNodeId = depotNodeId;
        this.trucks = new ArrayList<>();
        this.binsMap = new HashMap<>();
    }

    public void addTruck(Truck truck) {
        trucks.add(truck);
    }

    public void registerBin(Bin bin) {
        binsMap.put(bin.getId(), bin);
    }

    public Bin getBin(String id) {
        return binsMap.get(id);
    }

    public List<Bin> getAllBins() {
        return new ArrayList<>(binsMap.values());
    }

    public List<Truck> getTrucks() {
        return new ArrayList<>(trucks);
    }

    public String getDepotNodeId() {
        return depotNodeId;
    }

    public double getTotalFleetFuelConsumed() {
        double totalFuel = 0.0;
        for (Truck t : trucks) {
            totalFuel += t.calculateFuelConsumedLiters();
        }
        return totalFuel;
    }

    public double getTotalFleetDistanceTraveled() {
        double totalDistance = 0.0;
        for (Truck t : trucks) {
            totalDistance += t.getTotalDistanceKm();
        }
        return totalDistance;
    }

    public void printFleetStatus() {
        System.out.println("\n--- [OOPJ] Fleet Status Report ---");
        System.out.printf("Central Depot Location: %s\n", depotNodeId);
        System.out.printf("Total Active Trucks: %d | Total Monitored Bins: %d\n", trucks.size(), binsMap.size());
        for (Truck t : trucks) {
            System.out.println("  " + t.toString());
        }
    }
}
