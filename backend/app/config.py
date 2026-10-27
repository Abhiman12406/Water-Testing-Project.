import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

FEATURE_NAMES = [
    "Specific_conductance_Max",
    "pH_Max",
    "pH_Min",
    "Specific_conductance_Min",
    "Specific_conductance_Mean",
    "Dissolved_oxygen_Max",
    "Dissolved_oxygen_Mean",
    "Dissolved_oxygen_Min",
    "Temperature_Mean",
    "Temperature_Min",
    "Temperature_Max",
    "pH_Median",
]

FEATURE_METADATA = {
    "Specific_conductance_Max": {
        "label": "Specific Conductance (Max)",
        "unit": "μS/cm (norm)",
        "min": 0.0005,
        "max": 1.0,
        "default": 0.0023,
        "step": 0.001,
        "description": "Maximum electrical conductivity measurement reflecting ionic and mineral presence."
    },
    "pH_Max": {
        "label": "pH Level (Max)",
        "unit": "pH (norm)",
        "min": 0.4,
        "max": 1.0,
        "default": 0.9103,
        "step": 0.01,
        "description": "Maximum measured alkalinity / acidity scale value."
    },
    "pH_Min": {
        "label": "pH Level (Min)",
        "unit": "pH (norm)",
        "min": 0.0002,
        "max": 1.0,
        "default": 0.0020,
        "step": 0.001,
        "description": "Minimum measured pH value in sample interval."
    },
    "Specific_conductance_Min": {
        "label": "Specific Conductance (Min)",
        "unit": "μS/cm (norm)",
        "min": 0.0005,
        "max": 1.0,
        "default": 0.0021,
        "step": 0.001,
        "description": "Minimum electrical conductivity of water sample."
    },
    "Specific_conductance_Mean": {
        "label": "Specific Conductance (Mean)",
        "unit": "μS/cm (norm)",
        "min": 0.1,
        "max": 1.0,
        "default": 0.5789,
        "step": 0.01,
        "description": "Average normalized electrical conductivity."
    },
    "Dissolved_oxygen_Max": {
        "label": "Dissolved Oxygen (Max)",
        "unit": "mg/L (norm)",
        "min": 0.7,
        "max": 1.0,
        "default": 0.8659,
        "step": 0.01,
        "description": "Peak dissolved oxygen concentration crucial for aquatic health."
    },
    "Dissolved_oxygen_Mean": {
        "label": "Dissolved Oxygen (Mean)",
        "unit": "mg/L (norm)",
        "min": 0.05,
        "max": 1.0,
        "default": 0.6515,
        "step": 0.01,
        "description": "Mean dissolved oxygen levels."
    },
    "Dissolved_oxygen_Min": {
        "label": "Dissolved Oxygen (Min)",
        "unit": "mg/L (norm)",
        "min": 0.03,
        "max": 1.0,
        "default": 0.6614,
        "step": 0.01,
        "description": "Minimum dissolved oxygen recorded in water sample."
    },
    "Temperature_Mean": {
        "label": "Water Temperature (Mean)",
        "unit": "°C (norm)",
        "min": 0.05,
        "max": 1.0,
        "default": 0.5719,
        "step": 0.01,
        "description": "Average water temperature."
    },
    "Temperature_Min": {
        "label": "Water Temperature (Min)",
        "unit": "°C (norm)",
        "min": 0.02,
        "max": 1.0,
        "default": 0.5737,
        "step": 0.01,
        "description": "Minimum recorded water temperature."
    },
    "Temperature_Max": {
        "label": "Water Temperature (Max)",
        "unit": "°C (norm)",
        "min": 0.09,
        "max": 1.0,
        "default": 0.5436,
        "step": 0.01,
        "description": "Maximum recorded water temperature."
    },
    "pH_Median": {
        "label": "pH Level (Median Target Reference)",
        "unit": "pH (norm)",
        "min": 0.55,
        "max": 1.0,
        "default": 0.6667,
        "step": 0.01,
        "description": "Median field pH measurement indicating baseline neutral water condition."
    }
}

PRESET_SAMPLES = [
    {
        "id": "normal_safe",
        "name": "Standard Pristine River (Normal)",
        "description": "Typical baseline readings from USGS monitoring station with optimal dissolved oxygen and normal conductance.",
        "expected": "Normal (Potable / Safe)",
        "values": {
            "Specific_conductance_Max": 0.0023,
            "pH_Max": 0.9103,
            "pH_Min": 0.0020,
            "Specific_conductance_Min": 0.0021,
            "Specific_conductance_Mean": 0.5789,
            "Dissolved_oxygen_Max": 0.8659,
            "Dissolved_oxygen_Mean": 0.6515,
            "Dissolved_oxygen_Min": 0.6614,
            "Temperature_Mean": 0.5719,
            "Temperature_Min": 0.5737,
            "Temperature_Max": 0.5436,
            "pH_Median": 0.6667
        }
    },
    {
        "id": "anomaly_contaminated",
        "name": "High Salinity & Low Oxygen Spurt (Anomaly)",
        "description": "Extreme jump in specific conductance (ionic pollution/run-off) and depleted dissolved oxygen.",
        "expected": "Anomaly (Contaminated / Risk)",
        "values": {
            "Specific_conductance_Max": 0.7407,
            "pH_Max": 0.9231,
            "pH_Min": 0.6935,
            "Specific_conductance_Min": 0.7168,
            "Specific_conductance_Mean": 0.4737,
            "Dissolved_oxygen_Max": 0.9024,
            "Dissolved_oxygen_Mean": 0.4545,
            "Dissolved_oxygen_Min": 0.3543,
            "Temperature_Mean": 0.6031,
            "Temperature_Min": 0.5801,
            "Temperature_Max": 0.6395,
            "pH_Median": 0.7130
        }
    },
    {
        "id": "thermal_dissolved_stress",
        "name": "Thermal Stress & Critical Oxygen Drop",
        "description": "Elevated temperature combined with dangerously low minimum dissolved oxygen levels.",
        "expected": "Anomaly (Ecosystem Stress)",
        "values": {
            "Specific_conductance_Max": 0.3500,
            "pH_Max": 0.9500,
            "pH_Min": 0.1200,
            "Specific_conductance_Min": 0.2800,
            "Specific_conductance_Mean": 0.6200,
            "Dissolved_oxygen_Max": 0.7500,
            "Dissolved_oxygen_Mean": 0.3800,
            "Dissolved_oxygen_Min": 0.1800,
            "Temperature_Mean": 0.8500,
            "Temperature_Min": 0.7900,
            "Temperature_Max": 0.8900,
            "pH_Median": 0.6900
        }
    }
]

MODEL_METRICS = {
    "random_forest": {
        "name": "Random Forest Classifier",
        "file": "random_forest_model.pkl",
        "train_accuracy": 0.9997,
        "test_accuracy": 0.9912,
        "roc_auc": 0.9984,
        "description": "Ensemble of 100 decision trees. Highly robust against feature noise and non-linear interactions."
    },
    "xgboost": {
        "name": "XGBoost Classifier",
        "file": "xgboost_model.pkl",
        "train_accuracy": 0.9995,
        "test_accuracy": 0.9904,
        "roc_auc": 0.9980,
        "description": "Gradient boosted decision trees optimized for speed, precision, and handling boundary cases."
    },
    "logistic_regression": {
        "name": "Logistic Regression",
        "file": "logistic_regression_model.pkl",
        "train_accuracy": 0.9542,
        "test_accuracy": 0.9510,
        "roc_auc": 0.9782,
        "description": "Linear probabilistic baseline classifier with L2 regularization."
    }
}
