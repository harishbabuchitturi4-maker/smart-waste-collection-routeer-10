# 🚛 Smart Waste Collection Router (Team 10)

> An advanced municipal route optimization platform combining **Artificial Intelligence (A\*)**, **Advanced Data Structures & Algorithms (Graphs & Max-Heap)**, **Object-Oriented Java (OOPJ)**, and **Python (Linear Regression)** with an interactive visual dashboard, live sandbox fill sliders, step-by-step debugger, and student quiz.

---

## 🌟 Key Features & Academic Breakdown

1. **AI (Artificial Intelligence):**
   - **A\* Shortest Path Algorithm** with Euclidean distance heuristic ($f(n) = g(n) + h(n)$).
   - Proven admissible heuristic ($h(n) \le h^*(n)$) guaranteeing mathematically optimal shortest routes.
2. **ADSA (Unit 2):**
   - City road network represented as a space-optimal **Adjacency List Graph** ($O(V + E)$).
   - Dynamic urgency ranking implemented using a custom **Binary Max-Heap Priority Queue** ($O(\log N)$ extraction).
3. **OOPJ (Object-Oriented Programming in Java):**
   - Clean, modular domain architecture (`Bin`, `Truck`, `Edge`, `FleetManager`, `AStarRouter`, `DataBridge`).
   - Encapsulation protecting truck load limits, composition orchestrating fleet lifecycle.
4. **Python (Machine Learning / Statistics):**
   - **Ordinary Least Squares (OLS) Linear Regression** ($y = mx + c$) computing waste accumulation fill rate ($m = \%/\text{hr}$) and $R^2$ fit with zero external dependencies.
5. **Interactive Web Visualizer Dashboard:**
   - **Live Map Canvas:** Animated truck navigating optimal paths with waste load meters.
   - **Live City Scenarios:** Normal Day, Weekend Market Rush, Monsoon Flood Alert, University Fest.
   - **Interactive Sandbox Slider:** Drag fill-levels of any bin and watch the heap, regression line, and route re-render in real time!
   - **Step-by-Step A\* Navigator:** Step forward/backward through path segments.
   - **Interactive Student Quiz:** Self-testing viva prep module with audio sound effects.
   - **Municipal Audit Report:** Printable dispatch summary.

---

## 📊 Performance Benchmark

| Metric | Conventional Route (Visit All Bins) | Smart Waste Router | Municipal Savings |
|---|---|---|---|
| **Distance Traveled** | 56.00 km | **33.90 km** | **22.10 km avoided** |
| **Fuel Consumed** | 16.00 Liters | **9.69 Liters** | **39.5% Fuel Saved** |
| **Bins Serviced** | 8 (All bins blindly) | **5 (Urgent bins only)** | 3 unnecessary visits avoided |
| **CO₂ Prevented** | 42.88 kg | **25.96 kg** | **16.92 kg CO₂ Saved** |

---

## 📁 Repository Structure

```
smart-waste-collection-router-team-10/
│
├── java/
│   ├── src/
│   │   ├── model/
│   │   │   ├── Bin.java                  # Smart bin entity (fill level, priority)
│   │   │   ├── Truck.java                # Municipal collection vehicle
│   │   │   └── Edge.java                 # Road graph weighted edge
│   │   ├── adsa/
│   │   │   ├── RoadGraph.java            # [ADSA] Adjacency List Graph (O(V+E))
│   │   │   └── BinMaxHeap.java           # [ADSA] Binary Max-Heap Priority Queue (O(log N))
│   │   ├── ai/
│   │   │   ├── AStarRouter.java          # [AI] A* Pathfinding Algorithm
│   │   │   └── RoutePlan.java            # Route solution trajectory
│   │   ├── oopj/
│   │   │   └── FleetManager.java         # [OOPJ] Encapsulated fleet coordinator
│   │   ├── io/
│   │   │   └── DataBridge.java           # Java-Python file pipeline
│   │   ├── test/
│   │   │   └── SystemTest.java           # Unit test verification suite
│   │   └── Main.java                     # Orchestrator running the 5-step pipeline
│   └── bin/                              # Compiled .class files
│
├── python/
│   ├── predictor.py                      # [Python] Linear Regression Engine (OLS)
│   ├── simulator.py                      # Standalone Python simulation mirror
│   └── test_predictor.py                 # Python regression unit tests
│
├── web/
│   ├── index.html                        # Interactive Web Dashboard
│   ├── app.js                            # Interactive canvas & simulation engine
│   └── style.css                         # Sleek modern dark mode UI
│
├── data/
│   ├── historical_fill_data.csv          # Exported hourly sensor readings
│   └── predicted_fill_rates.json         # Python regression outputs
│
├── tools/
│   └── jdk-17/                           # Portable OpenJDK 17 (pre-installed!)
│
├── run.bat                               # 1-Click Windows execution script
├── run_server.py                         # Local HTTP server for the Web Dashboard
├── STUDENT_GUIDE.md                      # Comprehensive student presentation guide
├── VIVA_QUESTIONS.md                     # Curated Viva Questions & Model Answers
└── README.md                             # This file
```

---

## 🚀 How to Run

### Method 1: Double-Click `run.bat` (Recommended)
1. Double-click [`run.bat`](file:///c:/Users/haris/OneDrive/Desktop/smart%20waste%20collection%20router%20team-10/run.bat).
2. Choose **[1]** to launch the interactive web dashboard or **[2]** to run the unit test suite!

### Method 2: Command Line (PowerShell)
```powershell
# 1. Run Python Linear Regression
python python/predictor.py

# 2. Compile & Run Java System
.\tools\jdk-17\bin\javac.exe -d java/bin (Get-ChildItem -Path java/src -Recurse -Filter *.java | Select-Object -ExpandProperty FullName)
.\tools\jdk-17\bin\java.exe -cp java/bin Main

# 3. Launch Interactive Web Dashboard
python run_server.py
```
Open **`http://localhost:8000`** in your browser.
