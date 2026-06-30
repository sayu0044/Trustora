import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";
import type { PredictResponse } from "../types/api";

interface ResultCardProps {
  result: PredictResponse;
}

const riskClass: Record<PredictResponse["risk_level"], string> = {
  Rendah: "risk-low",
  Sedang: "risk-medium",
  Tinggi: "risk-high"
};

export function ResultCard({ result }: ResultCardProps) {
  const confidence = Math.round(result.confidence * 100);
  const isSpam = result.category === "Spam";
  const Icon = isSpam ? ShieldAlert : ShieldCheck;
  const RiskIcon = result.risk_level === "Rendah" ? CheckCircle2 : AlertTriangle;

  return (
    <section className={`result-card reveal ${isSpam ? "spam" : "normal"}`} aria-live="polite">
      <div className="result-card-head">
        <span className="result-status-icon">
          <Icon aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow" style={{ marginBottom: 2 }}>
            Hasil Prediksi
          </p>
          <h2>{result.category}</h2>
        </div>
      </div>

      <div className="result-card-body">
        <div className="result-grid">
          <div className="metric-tile">
            <span className="label">Tingkat Risiko</span>
            <strong className={`risk-pill ${riskClass[result.risk_level]}`}>
              <RiskIcon aria-hidden="true" />
              {result.risk_level}
            </strong>
          </div>
          <div className="metric-tile">
            <span className="label">Confidence</span>
            <strong className="value">{confidence}%</strong>
            <div className="progress" role="img" aria-label={`Confidence ${confidence} persen`}>
              <span style={{ width: `${confidence}%` }} />
            </div>
          </div>
          <div className="metric-tile">
            <span className="label">Indikasi</span>
            <strong className="value">{result.spam_indication}</strong>
          </div>
        </div>

        <div className="keyword-section">
          <span className="label">Kata atau frasa mencurigakan</span>
          {result.suspicious_keywords.length > 0 ? (
            <div className="chips">
              {result.suspicious_keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>
          ) : (
            <p className="muted">Tidak ada kata kunci mencurigakan yang terdeteksi.</p>
          )}
        </div>

        <div className="advice-section">
          <span className="label">Saran</span>
          <ul className="advice-list">
            {result.advice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="disclaimer">{result.disclaimer}</p>
      </div>
    </section>
  );
}
