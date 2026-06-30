import { Download, FileText, Inbox, Loader2, UploadCloud } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";
import { predictBatch } from "../services/api";
import type { BatchResponse } from "../types/api";

const MAX_VISIBLE_ROWS = 20;

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

  const counts = useMemo(() => {
    if (!result) return { spam: 0, normal: 0 };
    return result.results.reduce(
      (acc, item) => {
        if (item.category === "Spam") acc.spam += 1;
        else acc.normal += 1;
        return acc;
      },
      { spam: 0, normal: 0 }
    );
  }, [result]);

  const csvBlobUrl = useMemo(() => {
    if (!result) return "";
    const header = "Pesan,Kategori,Confidence,Risiko,Indikator\n";
    const rows = result.results.map((item) =>
      [item.message, item.category, String(item.confidence), item.risk_level, item.spam_indication]
        .map((value) => `"${value.replace(/"/g, '""')}"`)
        .join(",")
    );
    return URL.createObjectURL(
      new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8" })
    );
  }, [result]);

  return (
    <section className="panel" aria-labelledby="batch-title">
      <div className="section-heading">
        <p className="eyebrow">Analisis CSV</p>
        <h2 id="batch-title">Prediksi banyak pesan</h2>
        <p>
          Unggah file CSV dengan kolom <strong>Pesan</strong> untuk menganalisis banyak baris
          sekaligus.
        </p>
      </div>

      <label className={`upload-box${file ? " has-file" : ""}`}>
        <UploadCloud aria-hidden="true" />
        <span>{file ? file.name : "Klik untuk memilih file CSV"}</span>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
      </label>

      {preview ? (
        <pre className="preview" aria-label="Pratinjau isi file">
          {preview}
        </pre>
      ) : (
        <div className="empty-state">
          <FileText aria-hidden="true" />
          Pratinjau enam baris pertama akan muncul setelah file dipilih.
        </div>
      )}
      {error ? (
        <p className="error-text" role="alert" style={{ marginTop: 16 }}>
          {error}
        </p>
      ) : null}

      <div className="actions" style={{ marginTop: 16 }}>
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
        <div className="batch-result reveal">
          <div className="batch-summary">
            <div className="summary-card">
              <span>Total pesan</span>
              <strong>{result.total}</strong>
            </div>
            <div className="summary-card">
              <span>Terdeteksi spam</span>
              <strong style={{ color: "var(--danger)" }}>{counts.spam}</strong>
            </div>
            <div className="summary-card">
              <span>Normal</span>
              <strong style={{ color: "var(--ok)" }}>{counts.normal}</strong>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Pesan</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Confidence</th>
                  <th scope="col">Risiko</th>
                  <th scope="col">Indikator</th>
                </tr>
              </thead>
              <tbody>
                {result.results.slice(0, MAX_VISIBLE_ROWS).map((item, index) => (
                  <tr key={`${item.message}-${index}`}>
                    <td className="cell-msg">{item.message}</td>
                    <td>
                      <span className={`tag ${item.category === "Spam" ? "spam" : "normal"}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="num">{Math.round(item.confidence * 100)}%</td>
                    <td>{item.risk_level}</td>
                    <td>{item.spam_indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.total > MAX_VISIBLE_ROWS ? (
            <p className="table-note">
              Menampilkan {MAX_VISIBLE_ROWS} dari {result.total} baris. Unduh CSV untuk hasil lengkap.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="empty-state">
          <Inbox aria-hidden="true" />
          Hasil analisis batch akan muncul di sini.
        </div>
      )}
    </section>
  );
}
