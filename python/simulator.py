"""
==============================================================================
PROJECT: Smart Waste Collection Router (Team 10)
SUBJECTS: AI (A*), ADSA (Graph & Max-Heap), OOPJ concepts, Python Regression
==============================================================================

This Python simulator provides a complete mirror of the Java system:
1. ADSA: Custom Graph Adjacency List + Binary Max-Heap implementation.
2. AI: A* search algorithm with Euclidean distance heuristic.
3. OOP: Bin, Truck, and FleetManager classes.
4. Python: Linear Regression integration for dynamic priority re-calculation.
5. Exportable state for the interactive visual web dashboard.
"""

import math
import heapq
import json
import os
from typing import Dict, List, Tuple, Optional


class Bin:
    def __init__(self, bin_id: str, location_name: str, x: float, y: float, capacity: float, current_fill: float):
        self.id = bin_id
        self.location_name = location_name
        self.x = x
        self.y = y
        self.capacity = capacity
        self.current_fill = current_fill
        self.predicted_fill_rate = 0.0
        self.priority_score = 0.0
        self.compute_priority(6.0)

    @property
    def fill_percentage(self) -> float:
        return min(100.0, (self.current_fill / self.capacity) * 100.0)

    def compute_priority(self, lookahead_hours: float = 6.0):
        current_pct = self.fill_percentage
        future_pct = current_pct + (self.predicted_fill_rate * lookahead_hours)
        emergency_bonus = 25.0 if current_pct >= 80.0 else 0.0
        self.priority_score = future_pct + emergency_bonus

    def empty_bin(self) -> float:
        collected = self.current_fill
        self.current_fill = 0.0
        self.compute_priority(6.0)
        return collected

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.location_name,
            "x": self.x,
            "y": self.y,
            "capacity": self.capacity,
            "current_fill": self.current_fill,
            "fill_pct": round(self.fill_percentage, 1),
            "predicted_rate": self.predicted_fill_rate,
            "priority": round(self.priority_score, 1)
        }


class Edge:
    def __init__(self, target_id: str, distance_km: float, traffic_factor: float = 1.0):
        self.target_id = target_id
        self.distance_km = distance_km
        self.traffic_factor = traffic_factor

    @property
    def effective_cost(self) -> float:
        return self.distance_km * self.traffic_factor


class RoadGraph:
    """[ADSA Unit 2] Adjacency List Graph representation."""
    def __init__(self):
        self.adj: Dict[str, List[Edge]] = {}
        self.coords: Dict[str, Tuple[float, float]] = {}

    def add_node(self, node_id: str, x: float, y: float):
        if node_id not in self.adj:
            self.adj[node_id] = []
        self.coords[node_id] = (x, y)

    def add_edge(self, u: str, v: str, distance_km: float, traffic_factor: float = 1.0, bidirectional: bool = True):
        self.add_node(u, 0, 0)
        self.add_node(v, 0, 0)
        self.adj[u].append(Edge(v, distance_km, traffic_factor))
        if bidirectional:
            self.adj[v].append(Edge(u, distance_km, traffic_factor))

    def euclidean_distance(self, u: str, v: str) -> float:
        x1, y1 = self.coords.get(u, (0, 0))
        x2, y2 = self.coords.get(v, (0, 0))
        return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)


class BinMaxHeap:
    """[ADSA Unit 2] Custom Binary Max-Heap array data structure."""
    def __init__(self):
        self.heap: List[Bin] = []

    def insert(self, bin_obj: Bin):
        self.heap.append(bin_obj)
        self._heapify_up(len(self.heap) - 1)

    def peek_max(self) -> Optional[Bin]:
        return self.heap[0] if self.heap else None

    def extract_max(self) -> Optional[Bin]:
        if not self.heap:
            return None
        max_bin = self.heap[0]
        last_bin = self.heap.pop()
        if self.heap:
            self.heap[0] = last_bin
            self._heapify_down(0)
        return max_bin

    def _heapify_up(self, index: int):
        while index > 0:
            parent = (index - 1) // 2
            if self.heap[index].priority_score > self.heap[parent].priority_score:
                self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
                index = parent
            else:
                break

    def _heapify_down(self, index: int):
        size = len(self.heap)
        while index < size:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index

            if left < size and self.heap[left].priority_score > self.heap[largest].priority_score:
                largest = left
            if right < size and self.heap[right].priority_score > self.heap[largest].priority_score:
                largest = right

            if largest != index:
                self.heap[index], self.heap[largest] = self.heap[largest], self.heap[index]
                index = largest
            else:
                break

    def build_heap(self, bins: List[Bin]):
        self.heap = list(bins)
        for i in range((len(self.heap) // 2) - 1, -1, -1):
            self._heapify_down(i)

    def is_empty(self) -> bool:
        return len(self.heap) == 0


class AStarRouter:
    """[AI] A* Heuristic Pathfinding Algorithm: f(n) = g(n) + h(n)"""
    @staticmethod
    def find_path(graph: RoadGraph, start: str, goal: str) -> Tuple[List[str], float]:
        if start == goal:
            return [start], 0.0

        # Priority queue stores tuples: (f_score, node_id)
        open_set = []
        heapq.heappush(open_set, (0.0, start))
        
        g_score = {node: float("inf") for node in graph.adj}
        g_score[start] = 0.0
        came_from = {}
        visited = set()

        while open_set:
            _, current = heapq.heappop(open_set)

            if current == goal:
                # Reconstruct path
                path = [current]
                while current in came_from:
                    current = came_from[current]
                    path.append(current)
                path.reverse()
                return path, g_score[goal]

            if current in visited:
                continue
            visited.add(current)

            for edge in graph.adj.get(current, []):
                neighbor = edge.target_id
                if neighbor in visited:
                    continue

                tentative_g = g_score[current] + edge.effective_cost
                if tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    h = graph.euclidean_distance(neighbor, goal)
                    f = tentative_g + h
                    heapq.heappush(open_set, (f, neighbor))

        return [], 0.0


def create_city():
    g = RoadGraph()
    # Intersections & Depot
    g.add_node("DEPOT", 0.0, 0.0)
    g.add_node("INT_1", 2.0, 2.0)
    g.add_node("INT_2", 5.0, 3.0)
    g.add_node("INT_3", 4.0, 7.0)

    # Bins
    bins = [
        Bin("BIN_01", "City Center Market", 2.0, 5.0, 500, 410),
        Bin("BIN_02", "Greenwood Suburb", 4.0, 9.0, 400, 110),
        Bin("BIN_03", "Railway Food Street", 7.0, 8.0, 600, 450),
        Bin("BIN_04", "Riverside Park", 8.0, 4.0, 350, 90),
        Bin("BIN_05", "Metro Transit Hub", 6.0, 2.0, 700, 520),
        Bin("BIN_06", "Tech University", 3.0, 1.0, 500, 240),
        Bin("BIN_07", "Grand Plaza Mall", 5.0, 6.0, 600, 390),
        Bin("BIN_08", "Old Town Alley", 1.0, 8.0, 300, 70),
    ]

    for b in bins:
        g.add_node(b.id, b.x, b.y)

    # Road Segments
    roads = [
        ("DEPOT", "INT_1", 2.8),
        ("DEPOT", "BIN_06", 3.2),
        ("INT_1", "BIN_06", 1.4),
        ("INT_1", "BIN_01", 3.0),
        ("INT_1", "INT_2", 3.2),
        ("INT_2", "BIN_05", 1.4),
        ("INT_2", "BIN_07", 3.0),
        ("INT_2", "BIN_04", 3.2),
        ("BIN_05", "BIN_04", 2.8),
        ("BIN_01", "BIN_08", 3.2),
        ("BIN_01", "INT_3", 2.8),
        ("BIN_01", "BIN_07", 3.2),
        ("INT_3", "BIN_08", 3.2),
        ("INT_3", "BIN_02", 2.0),
        ("INT_3", "BIN_07", 1.4),
        ("INT_3", "BIN_03", 3.2),
        ("BIN_07", "BIN_03", 2.8),
        ("BIN_04", "BIN_03", 4.1),
        ("BIN_02", "BIN_03", 3.2),
    ]

    for u, v, d in roads:
        g.add_edge(u, v, d)

    return g, bins


def run_full_simulation():
    print("=" * 75)
    print(" SMART WASTE COLLECTION ROUTER - COMPLETE PIPELINE")
    print(" Team 10 | AI + ADSA + OOPJ + Python Regression")
    print("=" * 75)

    graph, bins = create_city()
    bins_map = {b.id: b for b in bins}

    # Step 1: Initial Max-Heap
    heap = BinMaxHeap()
    heap.build_heap(bins)
    print("\n[ADSA] Initial Max-Heap Root (without regression):", heap.peek_max().id, 
          f"Priority: {heap.peek_max().priority_score:.1f}")

    # Step 2: Read Regression Predictions
    pred_path = "data/predicted_fill_rates.json"
    if os.path.exists(pred_path):
        with open(pred_path, "r") as f:
            predictions = json.load(f)
        for b_id, p_info in predictions.items():
            if b_id in bins_map:
                bins_map[b_id].predicted_fill_rate = p_info["predicted_rate_per_hour"]
                bins_map[b_id].compute_priority(6.0)

    # Step 3: Re-prioritize Heap
    heap.build_heap(bins)
    print("[ADSA] Re-prioritized Max-Heap Root (with regression):", heap.peek_max().id, 
          f"Priority: {heap.peek_max().priority_score:.1f}")

    # Step 4: Extract Prioritized Bins (Priority >= 55.0)
    collection_queue = []
    print("\n[ADSA] Extracting Priority Bins from Max-Heap:")
    while not heap.is_empty():
        b = heap.extract_max()
        if b.priority_score >= 55.0:
            collection_queue.append(b)
            print(f"  -> Selected: {b.id} ({b.location_name}) | Priority: {b.priority_score:.1f} | Fill: {b.fill_percentage:.1f}%")
        else:
            print(f"  -- Skipped:  {b.id} (Priority: {b.priority_score:.1f} < threshold)")

    # Step 5: AI A* Route Generation
    print("\n[AI] Running A* Search Algorithm to Plan Route:")
    current = "DEPOT"
    smart_path = [current]
    smart_distance = 0.0
    collected_waste = 0.0

    for b in collection_queue:
        segment, dist = AStarRouter.find_path(graph, current, b.id)
        smart_path.extend(segment[1:])
        smart_distance += dist
        collected_waste += b.current_fill
        current = b.id

    # Return to Depot
    return_seg, dist = AStarRouter.find_path(graph, current, "DEPOT")
    smart_path.extend(return_seg[1:])
    smart_distance += dist

    smart_fuel = smart_distance / 3.5

    # Conventional comparison (visiting all 8 bins)
    conv_current = "DEPOT"
    conv_distance = 0.0
    for b in bins:
        _, dist = AStarRouter.find_path(graph, conv_current, b.id)
        conv_distance += dist
        conv_current = b.id
    _, dist = AStarRouter.find_path(graph, conv_current, "DEPOT")
    conv_distance += dist
    conv_fuel = conv_distance / 3.5

    fuel_saved = conv_fuel - smart_fuel
    pct_saved = (fuel_saved / conv_fuel) * 100.0

    print("\n" + "=" * 75)
    print(" ROUTING COMPARISON & RESULTS")
    print("=" * 75)
    print(f"Smart Path: {' -> '.join(smart_path)}")
    print(f"Smart Distance:        {smart_distance:.2f} km")
    print(f"Smart Fuel:            {smart_fuel:.2f} Liters")
    print(f"Conventional Distance: {conv_distance:.2f} km")
    print(f"Conventional Fuel:     {conv_fuel:.2f} Liters")
    print(f"Fuel Saved:            {fuel_saved:.2f} L ({pct_saved:.1f}%)")
    print(f"Waste Collected:       {collected_waste:.0f} Liters")
    print("=" * 75)


if __name__ == "__main__":
    run_full_simulation()
