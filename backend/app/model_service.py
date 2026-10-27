import os
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Any

from app.config import BASE_DIR, MODELS_DIR, FEATURE_NAMES, PRESET_SAMPLES, MODEL_METRICS
from app.schemas import WaterFeaturesInput, ModelEvaluation, CompareAllResponse, BatchPredictResponse


class ModelService:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.scaler = None
        self.locations_df = None
        self._load_assets()

    def _find_file(self, filename: str) -> Path:
        """Search for model in backend/models or project root."""
        candidate1 = MODELS_DIR / filename
        if candidate1.exists():
            return candidate1
        candidate2 = BASE_DIR.parent / filename
        if candidate2.exists():
            return candidate2
        raise FileNotFoundError(f"Model file {filename} not found in {MODELS_DIR} or {BASE_DIR.parent}")

    def _load_assets(self):
        # 1. Load scaler
        scaler_path = self._find_file("scaler.pkl")
        with open(scaler_path, "rb") as f:
            self.scaler = pickle.load(f)
        print(f"[ModelService] Loaded scaler from {scaler_path}")

        # 2. Load models
        model_files = {
            "logistic_regression": "logistic_regression_model.pkl",
            "random_forest": "random_forest_model.pkl",
            "xgboost": "xgboost_model.pkl",
        }

        for key, fname in model_files.items():
            path = self._find_file(fname)
            with open(path, "rb") as f:
                self.models[key] = pickle.load(f)
            print(f"[ModelService] Loaded {key} from {path}")

        # 3. Load locations metadata if available
        loc_path = BASE_DIR.parent / "water+quality+prediction-1" / "locations.csv"
        if loc_path.exists():
            self.locations_df = pd.read_csv(loc_path)
            print(f"[ModelService] Loaded {len(self.locations_df)} monitoring stations.")
        else:
            self.locations_df = pd.DataFrame()

    def _vectorize_input(self, features: WaterFeaturesInput) -> pd.DataFrame:
        """Convert Pydantic feature model into named pandas DataFrame matching scaler columns."""
        feat_dict = features.model_dump()
        row = [feat_dict[col] for col in FEATURE_NAMES]
        return pd.DataFrame([row], columns=FEATURE_NAMES)

    def _get_risk_level(self, prob_anomaly: float) -> str:
        if prob_anomaly < 0.20:
            return "Safe"
        elif prob_anomaly < 0.45:
            return "Low Risk"
        elif prob_anomaly < 0.70:
            return "Moderate Risk"
        elif prob_anomaly < 0.90:
            return "High Risk"
        else:
            return "Severe Anomaly"

    def predict_single_model(self, model_key: str, features: WaterFeaturesInput) -> ModelEvaluation:
        if model_key not in self.models:
            raise ValueError(f"Unknown model: {model_key}. Available: {list(self.models.keys())}")

        X_raw = self._vectorize_input(features)
        X_scaled = self.scaler.transform(X_raw)

        model = self.models[model_key]
        pred_class = int(model.predict(X_scaled)[0])

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_scaled)[0]
            prob_anomaly = float(probs[1]) if len(probs) > 1 else float(pred_class)
            prob_normal = float(probs[0]) if len(probs) > 1 else 1.0 - prob_anomaly
        else:
            prob_anomaly = float(pred_class)
            prob_normal = 1.0 - prob_anomaly

        label = "Anomaly (Contaminated / Risk)" if pred_class == 1 else "Normal (Safe / Standard)"
        confidence = prob_anomaly if pred_class == 1 else prob_normal
        risk_level = self._get_risk_level(prob_anomaly)

        name_display = MODEL_METRICS.get(model_key, {}).get("name", model_key.replace("_", " ").title())

        return ModelEvaluation(
            name=name_display,
            prediction=pred_class,
            label=label,
            probability_anomaly=round(prob_anomaly, 4),
            probability_normal=round(prob_normal, 4),
            confidence=round(confidence, 4),
            risk_level=risk_level
        )

    def predict_ensemble(self, features: WaterFeaturesInput) -> ModelEvaluation:
        """Weighted soft voting ensemble combining Random Forest (45%), XGBoost (45%), and Logistic Regression (10%)."""
        eval_rf = self.predict_single_model("random_forest", features)
        eval_xgb = self.predict_single_model("xgboost", features)
        eval_lr = self.predict_single_model("logistic_regression", features)

        weights = {"rf": 0.45, "xgb": 0.45, "lr": 0.10}
        weighted_prob_anomaly = (
            eval_rf.probability_anomaly * weights["rf"] +
            eval_xgb.probability_anomaly * weights["xgb"] +
            eval_lr.probability_anomaly * weights["lr"]
        )
        weighted_prob_normal = 1.0 - weighted_prob_anomaly
        pred_class = 1 if weighted_prob_anomaly >= 0.50 else 0

        label = "Anomaly (Contaminated / Risk)" if pred_class == 1 else "Normal (Safe / Standard)"
        confidence = weighted_prob_anomaly if pred_class == 1 else weighted_prob_normal
        risk_level = self._get_risk_level(weighted_prob_anomaly)

        return ModelEvaluation(
            name="Ensemble (Soft Voting)",
            prediction=pred_class,
            label=label,
            probability_anomaly=round(weighted_prob_anomaly, 4),
            probability_normal=round(weighted_prob_normal, 4),
            confidence=round(confidence, 4),
            risk_level=risk_level
        )

    def compare_all(self, features: WaterFeaturesInput) -> CompareAllResponse:
        results = {
            "random_forest": self.predict_single_model("random_forest", features),
            "xgboost": self.predict_single_model("xgboost", features),
            "logistic_regression": self.predict_single_model("logistic_regression", features),
            "ensemble": self.predict_ensemble(features),
        }

        anomaly_votes = sum(1 for k in ["random_forest", "xgboost", "logistic_regression"] if results[k].prediction == 1)
        agreement_ratio = anomaly_votes / 3.0
        consensus_pred = 1 if anomaly_votes >= 2 else 0
        consensus_label = "Anomaly (Contaminated / Risk)" if consensus_pred == 1 else "Normal (Safe / Standard)"

        avg_prob = np.mean([results[k].probability_anomaly for k in ["random_forest", "xgboost", "logistic_regression"]])
        overall_risk = self._get_risk_level(float(avg_prob))

        if consensus_pred == 1:
            summary = f"Alert: {anomaly_votes}/3 models identified abnormal water characteristics ({overall_risk}). Immediate water quality inspection recommended."
        else:
            summary = f"Safe: {3 - anomaly_votes}/3 models verified standard water parameters. No anomalous ionic or thermal spikes detected."

        return CompareAllResponse(
            results=results,
            consensus_prediction=consensus_pred,
            consensus_label=consensus_label,
            anomaly_agreement_ratio=round(agreement_ratio, 2),
            risk_level=overall_risk,
            summary=summary
        )

    def calculate_deviations(self, features: WaterFeaturesInput) -> Dict[str, float]:
        """Calculates Z-score deviations from the USGS training dataset baseline."""
        raw_vec = self._vectorize_input(features)
        scaled = self.scaler.transform(raw_vec)[0]
        return {FEATURE_NAMES[i]: round(float(scaled[i]), 3) for i in range(len(FEATURE_NAMES))}

    def batch_predict(self, model_key: str, items: List[WaterFeaturesInput]) -> BatchPredictResponse:
        results = []
        normal_count = 0
        anomaly_count = 0

        for item in items:
            if model_key == "ensemble":
                eval_res = self.predict_ensemble(item)
            else:
                eval_res = self.predict_single_model(model_key, item)

            if eval_res.prediction == 1:
                anomaly_count += 1
            else:
                normal_count += 1
            results.append(eval_res)

        name_display = "Ensemble" if model_key == "ensemble" else MODEL_METRICS.get(model_key, {}).get("name", model_key)

        return BatchPredictResponse(
            model_used=name_display,
            total_processed=len(items),
            normal_count=normal_count,
            anomaly_count=anomaly_count,
            results=results
        )


# Global singleton instance
model_service = ModelService()
