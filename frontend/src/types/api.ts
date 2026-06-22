export type RiskLevel = "Rendah" | "Sedang" | "Tinggi";
export type Category = "Normal" | "Spam";

export interface PredictResponse {
  raw_label: "ham" | "spam";
  category: Category;
  confidence: number;
  risk_level: RiskLevel;
  spam_indication: string;
  suspicious_keywords: string[];
  advice: string[];
  disclaimer: string;
}

export interface MetricsResponse {
  best_model: string | null;
  metrics: Record<string, unknown>;
  model_comparison: Record<string, ModelMetrics>;
  dataset_summary: DatasetSummary;
  confusion_matrix_url: string | null;
}

export interface ModelMetrics {
  accuracy?: number;
  spam_precision?: number;
  spam_recall?: number;
  spam_f1?: number;
  macro_f1?: number;
  weighted_f1?: number;
  cv_macro_f1_mean?: number;
  training_seconds?: number;
  best_params?: Record<string, unknown>;
}

export interface DatasetSummary {
  rows_before_cleaning?: number;
  rows_after_cleaning?: number;
  duplicate_text_label_rows?: number;
  label_counts?: Record<string, number>;
  label_percentages?: Record<string, number>;
  average_message_length?: number;
  median_message_length?: number;
  columns?: string[];
}

export interface BatchPrediction {
  message: string;
  category: string;
  confidence: number;
  risk_level: string;
  spam_indication: string;
  suspicious_keywords: string[];
}

export interface BatchResponse {
  total: number;
  results: BatchPrediction[];
  summary: Record<string, Record<string, number>>;
}

