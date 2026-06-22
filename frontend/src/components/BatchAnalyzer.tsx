import { Download, FileText, Loader2 } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { predictBatch } from "../services/api";
import type { BatchResponse } from "../types/api";

export function BatchAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<BatchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setError("");
    if (selected) {
      setPreview((await selected.text()).split(/\r?\n/).slice(0, 6).join("\n"));
    } else {
      setPreview("");
    }
  }

  async function runBatch() {
    if (!file) {
      setError("Pilih file CSV terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setResult(await predictBatch(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediksi batch gagal.");
    } finally {
      setLoading(false);
    }
  }

  const csvBlobUrl = useMemo(() => {
    if (!result) return "";
    const header = "Pesan,Kategori,Confidence,Risiko,Indikator\n";
    const rows = result.results.map((item) => [
      item.message,
      item.category,
      String(item.confidence),
      item.risk_level,
      item.spam_indication
    ].map((value) => `"${value.replace(/"/g, '""')}"`).join(","));
    return URL.createObjectURL(new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" }));
  }, [result]);

  return (
    <section className="panel" aria-labelledby="batch-title">
      <div className="section-heading">
        <p className="eyebrow">Analisis CSV</p>
        <h2 id="batch-title">Prediksi Banyak Pesan</h2>
        <p>Unggah CSV dengan kolom <strong>Pesan</strong> untuk analisis batch.</p>
      </div>

      <label className="upload-box">
        <FileText aria-hidden="true" />
        <span>{file ? file.name : "Pilih file CSV"}</span>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
      </label>

      {preview ? <pre className="preview">{preview}</pre> : <div className="empty-state">Preview file akan muncul di sini.</div>}
      {error ? <p className="error-text" role="alert">{error}</p> : null}

      <div className="actions">
        <button type="button" onClick={runBatch} disabled={loading || !file}>
          {loading ? <Loader2 className="spin" aria-hidden="true" /> : <FileText aria-hidden="true" />}
          Jalankan Batch
        </button>
        {result && csvBlobUrl ? (
          <a className="button-link secondary" href={csvBlobUrl} download="trustora_hasil_prediksi.csv">
            <Download aria-hidden="true" />
            Unduh CSV
          </a>
        ) : null}
      </div>

      {result ? (
        <div className="batch-result">
          <strong>{result.total} pesan berhasil dianalisis.</strong>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pesan</th>
                  <th>Kategori</th>
                  <th>Confidence</th>
                  <th>Risiko</th>
                  <th>Indikator</th>
                </tr>
              </thead>
              <tbody>
                {result.results.slice(0, 20).map((item, index) => (
                  <tr key={`${item.message}-${index}`}>
                    <td>{item.message}</td>
                    <td>{item.category}</td>
                    <td>{Math.round(item.confidence * 100)}%</td>
                    <td>{item.risk_level}</td>
                    <td>{item.spam_indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
