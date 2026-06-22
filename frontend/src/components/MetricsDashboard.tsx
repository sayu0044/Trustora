import { BarChart3, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { artifactUrl, getMetrics } from "../services/api";
import type { MetricsResponse } from "../types/api";

function percent(value?: number) {
  if (typeof value !== "number") return "-";
  return `${(value * 100).toFixed(2)}%`;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadMetrics() {
    setLoading(true);
    setError("");
    try {
      setMetrics(await getMetrics());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Metrik belum dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMetrics();
  }, []);

  const bestMetrics = metrics?.best_model ? metrics.model_comparison[metrics.best_model] : undefined;

  return (
    <section className="panel" aria-labelledby="dashboard-title">
      <div className="section-heading row-heading">
        <div>
          <p className="eyebrow">Dashboard Evaluasi</p>
          <h2 id="dashboard-title">Kinerja Model</h2>
        </div>
        <button type="button" className="icon-button" onClick={loadMetrics} aria-label="Muat ulang metrik">
          <RefreshCcw aria-hidden="true" />
        </button>
      </div>

      {loading ? <div className="empty-state">Memuat metrik aktual...</div> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {metrics ? (
        <>
          <div className="metric-cards">
            <div>
              <span>Model terbaik</span>
              <strong>{metrics.best_model ?? "Belum tersedia"}</strong>
            </div>
            <div>
              <span>Accuracy</span>
              <strong>{percent(bestMetrics?.accuracy)}</strong>
            </div>
            <div>
              <span>Precision Spam</span>
              <strong>{percent(bestMetrics?.spam_precision)}</strong>
            </div>
            <div>
              <span>Recall Spam</span>
              <strong>{percent(bestMetrics?.spam_recall)}</strong>
            </div>
            <div>
              <span>F1 Spam</span>
              <strong>{percent(bestMetrics?.spam_f1)}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Precision Spam</th>
                  <th>Recall Spam</th>
                  <th>F1 Spam</th>
                  <th>Macro F1 CV</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.model_comparison).map(([name, item]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{percent(item.accuracy)}</td>
                    <td>{percent(item.spam_precision)}</td>
                    <td>{percent(item.spam_recall)}</td>
                    <td>{percent(item.spam_f1)}</td>
                    <td>{percent(item.cv_macro_f1_mean)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-grid">
            <div className="subpanel">
              <h3>Ringkasan Dataset</h3>
              <dl>
                <dt>Data awal</dt>
                <dd>{metrics.dataset_summary.rows_before_cleaning ?? "-"}</dd>
                <dt>Setelah cleaning</dt>
                <dd>{metrics.dataset_summary.rows_after_cleaning ?? "-"}</dd>
                <dt>Duplikat</dt>
                <dd>{metrics.dataset_summary.duplicate_text_label_rows ?? "-"}</dd>
                <dt>Rata-rata panjang pesan</dt>
                <dd>{metrics.dataset_summary.average_message_length ?? "-"}</dd>
              </dl>
              <div className="class-bars">
                {Object.entries(metrics.dataset_summary.label_counts ?? {}).map(([label, count]) => (
                  <div key={label}>
                    <span>{label}: {count}</span>
                    <meter min={0} max={metrics.dataset_summary.rows_after_cleaning ?? 1} value={count} />
                  </div>
                ))}
              </div>
            </div>
            <div className="subpanel">
              <h3><BarChart3 aria-hidden="true" /> Confusion Matrix</h3>
              {metrics.confusion_matrix_url ? (
                <img src={artifactUrl(metrics.confusion_matrix_url)} alt="Confusion matrix model terbaik" />
              ) : (
                <p className="muted">Confusion matrix belum tersedia. Jalankan training terlebih dahulu.</p>
              )}
            </div>
          </div>

          <p className="metric-note">
            Accuracy mengukur prediksi benar keseluruhan. Precision Spam mengukur ketepatan saat model menyebut spam.
            Recall Spam mengukur kemampuan menangkap pesan spam. F1 menyeimbangkan precision dan recall.
          </p>
        </>
      ) : null}
    </section>
  );
}

