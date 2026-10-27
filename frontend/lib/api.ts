import {
  WaterFeatures,
  ModelType,
  PredictResponse,
  CompareAllResponse,
  PresetSample,
  ModelMetricInfo,
  Station,
  BatchUploadResult
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{
  status: string;
  models_loaded: string[];
  scaler_loaded: boolean;
  stations_loaded: number;
}> {
  const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function getPresetSamples(): Promise<PresetSample[]> {
  const res = await fetch(`${API_BASE_URL}/api/samples`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch sample presets');
  const data = await res.json();
  return data.samples;
}

export async function getModelsInfo(): Promise<{
  models: Record<string, ModelMetricInfo>;
  ensemble: Record<string, unknown>;
}> {
  const res = await fetch(`${API_BASE_URL}/api/models`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch models info');
  return res.json();
}

export async function getStations(): Promise<Station[]> {
  const res = await fetch(`${API_BASE_URL}/api/locations`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stations');
  const data = await res.json();
  return data.stations;
}

export async function predictWaterQuality(
  features: WaterFeatures,
  model: ModelType
): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features, model }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Prediction failed (${res.status})`);
  }
  return res.json();
}

export async function compareAllModels(features: WaterFeatures): Promise<CompareAllResponse> {
  const res = await fetch(`${API_BASE_URL}/api/predict/all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Comparison failed (${res.status})`);
  }
  return res.json();
}

export async function uploadCSVDataset(file: File, model: ModelType): Promise<BatchUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/predict/upload-csv?model=${encodeURIComponent(model)}`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `CSV batch analysis failed (${res.status})`);
  }
  return res.json();
}
