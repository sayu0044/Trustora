import type { BatchResponse, MetricsResponse, PredictResponse, TrainingStatus } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const LOCAL_SERVER_GUIDANCE =
  "Pastikan backend berjalan di http://localhost:8000 lewat trustora serve, frontend berjalan di http://localhost:5173, dan tidak ada port lama yang masih aktif.";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Terjadi kesalahan saat menghubungi server.";
    try {
      const body = await response.json();
      message = typeof body.detail === "string" ? body.detail : message;
    } catch {
      // Keep the generic user-friendly message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function predictMessage(message: string): Promise<PredictResponse> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  return parseResponse<PredictResponse>(response);
}

export async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  return parseResponse<MetricsResponse>(response);
}

export async function predictBatch(file: File): Promise<BatchResponse> {
  const data = new FormData();
  data.append("file", file);
  const response = await fetch(`${API_BASE_URL}/api/predict-batch`, {
    method: "POST",
    body: data
  });
  return parseResponse<BatchResponse>(response);
}

export async function getTrainingStatus(): Promise<TrainingStatus> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/train/status`);
  } catch {
    throw new Error(`Status training belum dapat dimuat. ${LOCAL_SERVER_GUIDANCE}`);
  }
  return parseResponse<TrainingStatus>(response);
}

export async function startTraining(): Promise<TrainingStatus> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/train`, { method: "POST" });
  } catch {
    throw new Error(`Training gagal dimulai. ${LOCAL_SERVER_GUIDANCE}`);
  }
  return parseResponse<TrainingStatus>(response);
}

export function artifactUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

