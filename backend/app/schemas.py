from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field


class WaterFeaturesInput(BaseModel):
    Specific_conductance_Max: float = Field(0.0023, description="Specific Conductance Max", ge=0.0, le=5.0)
    pH_Max: float = Field(0.9103, description="pH Max", ge=0.0, le=5.0)
    pH_Min: float = Field(0.0020, description="pH Min", ge=0.0, le=5.0)
    Specific_conductance_Min: float = Field(0.0021, description="Specific Conductance Min", ge=0.0, le=5.0)
    Specific_conductance_Mean: float = Field(0.5789, description="Specific Conductance Mean", ge=0.0, le=5.0)
    Dissolved_oxygen_Max: float = Field(0.8659, description="Dissolved Oxygen Max", ge=0.0, le=5.0)
    Dissolved_oxygen_Mean: float = Field(0.6515, description="Dissolved Oxygen Mean", ge=0.0, le=5.0)
    Dissolved_oxygen_Min: float = Field(0.6614, description="Dissolved Oxygen Min", ge=0.0, le=5.0)
    Temperature_Mean: float = Field(0.5719, description="Temperature Mean", ge=0.0, le=5.0)
    Temperature_Min: float = Field(0.5737, description="Temperature Min", ge=0.0, le=5.0)
    Temperature_Max: float = Field(0.5436, description="Temperature Max", ge=0.0, le=5.0)
    pH_Median: float = Field(0.6667, description="pH Median", ge=0.0, le=5.0)


class PredictRequest(BaseModel):
    features: WaterFeaturesInput
    model: Literal["random_forest", "xgboost", "logistic_regression", "ensemble"] = "random_forest"


class ModelEvaluation(BaseModel):
    name: str
    prediction: int
    label: str
    probability_anomaly: float
    probability_normal: float
    confidence: float
    risk_level: Literal["Safe", "Low Risk", "Moderate Risk", "High Risk", "Severe Anomaly"]


class PredictResponse(BaseModel):
    model_used: str
    result: ModelEvaluation
    all_models: Optional[Dict[str, ModelEvaluation]] = None
    feature_contributions: Optional[Dict[str, float]] = None
    summary_message: str


class CompareAllResponse(BaseModel):
    results: Dict[str, ModelEvaluation]
    consensus_prediction: int
    consensus_label: str
    anomaly_agreement_ratio: float
    risk_level: str
    summary: str


class BatchPredictItem(BaseModel):
    id: Optional[str] = None
    features: WaterFeaturesInput


class BatchPredictRequest(BaseModel):
    model: Literal["random_forest", "xgboost", "logistic_regression", "ensemble"] = "random_forest"
    items: List[WaterFeaturesInput]


class BatchPredictResponse(BaseModel):
    model_used: str
    total_processed: int
    normal_count: int
    anomaly_count: int
    results: List[ModelEvaluation]


class PresetSample(BaseModel):
    id: str
    name: str
    description: str
    expected: str
    values: Dict[str, float]


class StationMetadata(BaseModel):
    location_index: int
    location_id: int
    location_group: int
