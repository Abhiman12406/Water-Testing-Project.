import io
import time
import pandas as pd
from typing import List, Dict, Any, Literal
from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import FEATURE_NAMES, FEATURE_METADATA, PRESET_SAMPLES, MODEL_METRICS
from app.schemas import (
    WaterFeaturesInput,
    PredictRequest,
    PredictResponse,
    CompareAllResponse,
    BatchPredictRequest,
    BatchPredictResponse,
)
from app.model_service import model_service

app = FastAPI(
    title="Water Quality Anomaly Detection & Prediction API",
    description="Backend API powered by trained Random Forest, XGBoost, and Logistic Regression models on USGS spatio-temporal water datasets.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Water Quality Prediction API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "available_models": list(MODEL_METRICS.keys()) + ["ensemble"]
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": list(model_service.models.keys()),
        "scaler_loaded": model_service.scaler is not None,
        "stations_loaded": len(model_service.locations_df) if model_service.locations_df is not None else 0
    }


@app.get("/api/features")
def get_features_info():
    """Returns the 12 features required by the models with metadata, labels, and bounds."""
    return {
        "features": FEATURE_NAMES,
        "metadata": FEATURE_METADATA
    }


@app.get("/api/models")
def get_models_info():
    """Returns information on all available models, including their benchmark evaluation metrics."""
    return {
        "models": MODEL_METRICS,
        "ensemble": {
            "name": "Ensemble (Soft Voting)",
            "description": "Combines Random Forest (45%), XGBoost (45%), and Logistic Regression (10%) for resilient consensus.",
            "components": ["random_forest", "xgboost", "logistic_regression"]
        }
    }


@app.get("/api/samples")
def get_preset_samples():
    """Returns curated representative normal and anomalous water quality samples."""
    return {"samples": PRESET_SAMPLES}


@app.get("/api/locations")
def get_stations():
    """Returns the list of 37 USGS monitoring stations in Georgia, USA."""
    if model_service.locations_df is not None and not model_service.locations_df.empty:
        return {"stations": model_service.locations_df.to_dict(orient="records")}
    return {"stations": []}


@app.post("/api/predict", response_model=PredictResponse)
def predict_water_quality(request: PredictRequest):
    """Predict water quality anomaly using the specified model."""
    try:
        if request.model == "ensemble":
            res = model_service.predict_ensemble(request.features)
        else:
            res = model_service.predict_single_model(request.model, request.features)

        deviations = model_service.calculate_deviations(request.features)

        if res.prediction == 1:
            msg = f"Water sample flagged as ANOMALY with {res.confidence * 100:.1f}% confidence. Parameters indicate elevated risk of contamination or ecological stress."
        else:
            msg = f"Water sample classified as NORMAL with {res.confidence * 100:.1f}% confidence. Measurements lie within acceptable baselines."

        return PredictResponse(
            model_used=res.name,
            result=res,
            feature_contributions=deviations,
            summary_message=msg
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/all", response_model=CompareAllResponse)
def compare_all_models(features: WaterFeaturesInput):
    """Runs all models concurrently on the input features and produces a consensus comparison."""
    try:
        return model_service.compare_all(features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/batch", response_model=BatchPredictResponse)
def batch_predict(request: BatchPredictRequest):
    """Batch prediction on multiple feature records."""
    try:
        return model_service.batch_predict(request.model, request.items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/upload-csv")
async def upload_csv_predict(
    file: UploadFile = File(...),
    model: Literal["random_forest", "xgboost", "logistic_regression", "ensemble"] = Query("random_forest")
):
    """Upload a CSV dataset and get batch anomaly predictions with summary statistics."""
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))

        # Check required columns
        missing = [c for c in FEATURE_NAMES if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"CSV missing required feature columns: {missing}. Expected columns: {FEATURE_NAMES}"
            )

        items = []
        for _, row in df.iterrows():
            item_dict = {col: float(row[col]) for col in FEATURE_NAMES}
            items.append(WaterFeaturesInput(**item_dict))

        batch_result = model_service.batch_predict(model, items)

        return {
            "filename": file.filename,
            "model_used": batch_result.model_used,
            "total_rows": batch_result.total_processed,
            "normal_samples": batch_result.normal_count,
            "anomaly_samples": batch_result.anomaly_count,
            "anomaly_percentage": round((batch_result.anomaly_count / batch_result.total_processed) * 100, 2) if batch_result.total_processed else 0,
            "sample_results": [r.model_dump() for r in batch_result.results[:20]]  # preview first 20
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
