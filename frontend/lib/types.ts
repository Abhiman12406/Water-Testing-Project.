export interface WaterFeatures {
  Specific_conductance_Max: number;
  pH_Max: number;
  pH_Min: number;
  Specific_conductance_Min: number;
  Specific_conductance_Mean: number;
  Dissolved_oxygen_Max: number;
  Dissolved_oxygen_Mean: number;
  Dissolved_oxygen_Min: number;
  Temperature_Mean: number;
  Temperature_Min: number;
  Temperature_Max: number;
  pH_Median: number;
}

export type ModelType = 'random_forest' | 'xgboost' | 'logistic_regression' | 'ensemble';

export interface ModelEvaluation {
  name: string;
  prediction: number;
  label: string;
  probability_anomaly: number;
  probability_normal: number;
  confidence: number;
  risk_level: 'Safe' | 'Low Risk' | 'Moderate Risk' | 'High Risk' | 'Severe Anomaly';
}

export interface PredictResponse {
  model_used: string;
  result: ModelEvaluation;
  all_models?: Record<string, ModelEvaluation>;
  feature_contributions?: Record<string, number>;
  summary_message: string;
}

export interface CompareAllResponse {
  results: Record<string, ModelEvaluation>;
  consensus_prediction: number;
  consensus_label: string;
  anomaly_agreement_ratio: number;
  risk_level: string;
  summary: string;
}

export interface PresetSample {
  id: string;
  name: string;
  description: string;
  expected: string;
  values: WaterFeatures;
}

export interface ModelMetricInfo {
  name: string;
  file: string;
  train_accuracy: number;
  test_accuracy: number;
  roc_auc: number;
  description: string;
}

export interface Station {
  location_index: number;
  location_id: number;
  location_group: number;
}

export interface BatchUploadResult {
  filename: string;
  model_used: string;
  total_rows: number;
  normal_samples: number;
  anomaly_samples: number;
  anomaly_percentage: number;
  sample_results: ModelEvaluation[];
}
