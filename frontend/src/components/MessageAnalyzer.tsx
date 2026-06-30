import { Inbox, Loader2, Search, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { predictMessage } from "../services/api";
import type { PredictResponse } from "../types/api";
import { ResultCard } from "./ResultCard";

const examples = [
  "Selamat Anda mendapatkan hadiah, klik link berikut untuk klaim.",
  "Besok rapat jam 10 ya, jangan lupa bawa laporan.",
  "Promo khusus hari ini, diskon besar untuk pembelian pulsa.",
  "Kode OTP Anda 123456. Jangan berikan kepada siapa pun."
];

const MAX_CHARS = 5000;

export function MessageAnalyzer() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!message.trim()) {
      setError("Pesan tidak boleh kosong.");
      return;
    }
    setLoading(true);
    try {
      setResult(await predictMessage(message));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analisis gagal dijalankan.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setMessage("");
    setResult(null);
    setError("");
  }

  return (
    <section className="panel analyzer-panel" aria-labelledby="analyzer-title">
      <div className="section-heading">
        <p className="eyebrow">Analisis Pesan</p>
        <h1 id="analyzer-title">Analisis satu pesan</h1>
        <p>Tempel isi SMS atau chat yang ingin diperiksa, lalu jalankan deteksi.</p>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <label htmlFor="message">Isi pesan</label>
        <textarea
          id="message"
          value={message}
          maxLength={MAX_CHARS}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tempel SMS atau chat yang ingin dianalisis..."
        />
        <div className="form-meta">
          <span>
            {message.length}/{MAX_CHARS} karakter
          </span>
          {error ? (
            <strong className="error-text" role="alert">
              {error}
            </strong>
          ) : null}
        </div>
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
            Analisis Pesan
          </button>
          <button type="button" className="secondary" onClick={handleClear} disabled={loading}>
            <Trash2 aria-hidden="true" />
            Bersihkan
          </button>
        </div>
      </form>

      <p className="label examples-label">Contoh pesan</p>
      <div className="examples" aria-label="Contoh pesan">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => setMessage(example)}>
            {example}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton" aria-hidden="true">
          <div className="empty-state" style={{ marginTop: 0 }}>
            <Loader2 className="spin" aria-hidden="true" />
            Menganalisis pesan...
          </div>
          <div className="skeleton-row tall" style={{ marginTop: 16 }} />
          <div className="skeleton-row w-60" />
          <div className="skeleton-row w-40" />
        </div>
      ) : null}
      {!loading && result ? <ResultCard result={result} /> : null}
      {!loading && !result && !error ? (
        <div className="empty-state">
          <Inbox aria-hidden="true" />
          Hasil prediksi akan muncul setelah pesan dianalisis.
        </div>
      ) : null}
    </section>
  );
}
