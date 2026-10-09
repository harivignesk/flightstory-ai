# ✈️ FlightStory AI - Honeywell FMS Multi-Node Log Analytics & 3D WebGL Event Mapper

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-3D_WebGL-black.svg)](https://threejs.org/)

> **FlightStory AI** is an advanced Flight Management System (FMS) log analytics platform and 3D WebGL event mapping engine built for the Honeywell Hackathon. It ingests multi-node decoded HTML telemetry logs, normalizes **5,257 total records** across 3 redundant nodes (`NODE_A`, `NODE_B`, `NODE_C`), and visualizes chronological event cascades in 3D spatial WebGL coordinates.

---

## 🌟 Key Features

### 1. 🛡️ Supervisory Executive Briefing
- High-level, action-oriented briefing view tailored for supervisory engineering teams.
- Clear incident profile of **Fault Code 6025** (*Background Service Identity Failure*) on `NODE_C` at `09:09:54 AM`.
- Actionable directives: Process ID lookup patch, IPC semaphore timeout tuning, and automated alerting.

### 2. 🔮 Interactive 3D WebGL Event Mapping Space
- Spatial 3D representation powered by **Three.js**:
  - **X-Axis**: Timeline (09:00:00 AM to 13:05:18 PM).
  - **Y-Axis**: Event Severity (`INFO`, `WARNING`, `CRITICAL`).
  - **Z-Axis**: Redundant FMS Node Planes (`NODE_A` = Front, `NODE_B` = Center, `NODE_C` = Back).
- Interactive 3D Orbit camera controls (Rotate, Zoom, Pan).
- Floating 3D HUD Tooltip Drawer upon clicking any 3D event sphere.
- Pulsing 3D ray lines mapping the event cascade from `NODE_C` to `NODE_B` and `NODE_A`.

### 3. 🎯 Main Event Mapper & Root Cause Flowchart
- 5-stage chronological event mapping diagram connecting the initial trigger (`Navigation Database Refresh Cycle`) to the primary root cause (`Fault Code 6025: get current process id failure 653`) and subsequent failover re-synchronization.

### 4. 🛰️ 3-Node Topology Telemetry
- Real-time status cards for `NODE_A` (Primary Master - 2,199 records), `NODE_B` (Secondary Standby - 1,177 records), and `NODE_C` (Auxiliary Spare - 1,881 records).

### 5. 📋 Unified Log Explorer (5,257 Records)
- Instant search across messages, fault codes, sequence numbers.
- Filter by node, log family, and severity with fast pagination.
- Modal inspector displaying raw key-value pairs with one-click JSON copy.

---

## 📊 Dataset Metrics Summary

| Metric | Target Value | Verification Status |
| :--- | :--- | :--- |
| **Total Decoded HTML Files** | `15 Files` | `100% Ingested` |
| **Total Normalized Records** | `5,257 Records` | `100% Parsed` |
| **Timestamp Health** | `0 Errors` | `100% Validated` |
| **Fault Repository Events** | `1,577 Events` | `CRITICAL` |
| **BPQ / Telemetry Events** | `3,281 Events` | `INFO` |

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher)
- [npm](https://www.npmjs.com/) (v9.x or higher)

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/harivignesk/flightstory-ai.git

# Navigate into project directory
cd flightstory-ai

# Install dependencies
npm install

# Launch local development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.

### Production Build

```bash
npm run build
```

---

## 📂 Project Structure

```text
flightstory-ai/
├── public/
│   └── honeywell_fms_dataset.json     # Normalized 5,257 records dataset
├── src/
│   ├── components/
│   │   ├── SupervisorBriefing.jsx    # Supervisory Executive Briefing
│   │   ├── LogVisualization3D.jsx    # Three.js 3D Event Mapping Space
│   │   ├── MainEventMapper.jsx       # Event Cascade Flowchart (PS)
│   │   ├── TopologyView.jsx          # 3-Node Telemetry Cards
│   │   ├── OverviewTab.jsx           # Analytics & Charts
│   │   ├── CorrelationTab.jsx        # Cross-Node Correlation Matrix
│   │   ├── FaultTab.jsx              # Fault Repository Inspector
│   │   ├── ExplorerTab.jsx           # 5,257 Records Searchable Table
│   │   ├── ValidationTab.jsx         # 15 File Quality Audit Report
│   │   ├── Header.jsx                # Navigation Header & Ticker
│   │   ├── KPICards.jsx              # Metric Summary Cards
│   │   └── DetailModal.jsx           # Record Inspector Drawer
│   ├── data/
│   │   └── honeywell_fms_dataset.json # Embedded dataset JSON
│   ├── App.jsx                       # Main Application Shell
│   ├── index.css                     # Glassmorphic Design System
│   └── main.jsx                      # React Entrypoint
├── package.json
├── vite.config.js
└── README.md
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
