# AquaGuard AI • Neo-Brutalist Water Quality Prediction & Anomaly Classification System

AquaGuard AI is a full-stack machine learning application built with **FastAPI** (Python 3.12 backend) and **Next.js 16** (React 19 + Tailwind CSS + GSAP) featuring a **Neo-Brutalism Design System**. It utilizes spatio-temporal telemetry models trained on USGS river and watershed monitoring stations in Georgia, USA to detect water quality anomalies, contamination events, and ecological stress.

### 🎨 Neo-Brutalism Design System
- **Aesthetic**: Bold solid black borders (`2.5px`), signature hard offset drop-shadows (`shadow-[4px_4px_0px_#000]`), and tactile click-depression physics.
- **Palette**: Warm cream canvas (`#F7F4EC`) with subtle blueprint dot grid, paired with high-energy punchy accents (Canary Yellow `#FFDE59`, Electric Cyan `#38BDF8`, Vibrant Green `#4ADE80`, and Hazard Red `#FF5757`).
- **Cyber-Dark Mode**: High-contrast obsidian dark mode with electric cyan offset drop shadows.
- **Typography**: Space Grotesk geometric headings, Plus Jakarta Sans body, and JetBrains Mono for telemetry metrics, z-score deviations, and accuracy data.
- **Micro-Interactions**: Tactile button presses, sticker badges, custom block range sliders, and GSAP tab transitions.

---

## 🚀 Quick Start (Run Both Servers in 1 Click)

### Option 1: PowerShell Script
```powershell
.\start_servers.ps1
```

### Option 2: Windows Batch File
Double-click `start_servers.bat` or run:
```cmd
start_servers.bat
```

### Option 3: Manual Startup

**1. Start FastAPI Backend:**
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)

**2. Start Next.js Frontend:**
```powershell
cd frontend
npm run dev
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🧠 Machine Learning Models & Serialization

The application loads the pickled models trained on the spatio-temporal USGS water quality dataset:

| Model | Pickle File | Test Accuracy | ROC-AUC | Description |
|---|---|---|---|---|
| **Random Forest** | `backend/models/random_forest_model.pkl` | **99.12%** | **0.9984** | 100-tree ensemble with bootstrap bagging. Top overall generalization. |
| **XGBoost** | `backend/models/xgboost_model.pkl` | **99.04%** | **0.9980** | Gradient boosted decision trees for fast, memory-efficient inference. |
| **Logistic Regression** | `backend/models/logistic_regression_model.pkl` | **95.10%** | **0.9782** | Linear probabilistic classifier with L2 regularization. |
| **Standard Scaler** | `backend/models/scaler.pkl` | - | - | StandardScaler fitted on the USGS training split for zero-mean, unit-variance normalization. |

### Input Features (12 Spatio-Temporal Metrics)
1. `Specific_conductance_Max` — Peak electrical conductivity (reflecting dissolved minerals / ionic intrusion).
2. `pH_Max` — Maximum measured alkalinity/acidity.
3. `pH_Min` — Minimum measured pH.
4. `Specific_conductance_Min` — Baseline minimum electrical conductivity.
5. `Specific_conductance_Mean` — Average normalized conductivity.
6. `Dissolved_oxygen_Max` — Peak dissolved oxygen concentration.
7. `Dissolved_oxygen_Mean` — Average dissolved oxygen.
8. `Dissolved_oxygen_Min` — Lowest recorded dissolved oxygen (critical biological threshold).
9. `Temperature_Mean` — Mean water temperature.
10. `Temperature_Min` — Minimum water temperature.
11. `Temperature_Max` — Maximum water temperature.
12. `pH_Median` — Median field baseline pH.

---

## 🌟 Application Capabilities & Tabs

1. **Interactive Predictor**:
   - One-click presets: *Pristine Baseline (Normal)*, *High Salinity Spurt (Anomaly)*, *Thermal Stress & Oxygen Drop*.
   - Fine-grained controls with categorical filtering (Conductance, pH, Oxygen, Temperature).
   - Real-time confidence gauges, probability distribution bars, and standardized Z-score deviation analysis.

2. **Concurrent Multi-Model Consensus**:
   - Compares Random Forest, XGBoost, and Logistic Regression side-by-side for the same input features.
   - Calculates soft-voting consensus agreement and overall risk category.

3. **Batch CSV Ingestion**:
   - Upload any `.csv` dataset containing the 12 features.
   - Built-in **Download Sample CSV** button for immediate testing.
   - Calculates contamination percentage, normal vs anomaly counts, and outputs a row-by-row inspection table.

4. **Model Benchmarks & Metrics**:
   - Visual architectural comparison of the 3 models, file footprints, training/test accuracy, and ROC-AUC curves.

5. **37 USGS Stations Directory**:
   - Searchable and filterable catalogue of the 37 USGS continuous monitoring locations across Georgia, USA.

---

## 🛠️ Project Structure

```text
DSBD Project/
├── backend/
│   ├── app/
│   │   ├── config.py           # Feature definitions, presets, dataset stats
│   │   ├── main.py             # FastAPI application and route handlers
│   │   ├── model_service.py    # Unpickler, scaler, and inference service
│   │   └── schemas.py          # Pydantic request and response models
│   ├── models/
│   │   ├── logistic_regression_model.pkl
│   │   ├── random_forest_model.pkl
│   │   ├── xgboost_model.pkl
│   │   └── scaler.pkl
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main dashboard container
│   │   └── globals.css
│   ├── components/
│   │   ├── BatchUploadView.tsx
│   │   ├── ModelBenchmarkView.tsx
│   │   ├── ModelComparisonTable.tsx
│   │   ├── Navbar.tsx
│   │   ├── PredictionResultCard.tsx
│   │   ├── StationsView.tsx
│   │   └── WaterPredictionForm.tsx
│   ├── lib/
│   │   ├── api.ts              # Type-safe API client
│   │   └── types.ts            # TypeScript interfaces
│   └── package.json
├── water_dataset.csv           # Spatio-temporal USGS dataset
├── water_quality_prediction.py # Original Colab training script
├── start_servers.ps1           # 1-click startup script (PowerShell)
├── start_servers.bat           # 1-click startup script (Windows batch)
└── README.md
```

---

## 📡 API Endpoints

- `GET /` — API metadata and uptime status
- `GET /api/health` — Status of loaded models and scaler
- `GET /api/features` — Feature list with bounds and units
- `GET /api/models` — Benchmark statistics for all 3 models
- `GET /api/samples` — Curated preset samples
- `GET /api/locations` — 37 USGS monitoring stations
- `POST /api/predict` — Single model prediction with feature Z-score deviations
- `POST /api/predict/all` — Head-to-head comparison across all models
- `POST /api/predict/batch` — Batch prediction on JSON array
- `POST /api/predict/upload-csv` — File upload for CSV classification
