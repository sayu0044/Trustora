import { Loader2, Search, Trash2 } from "lucide-react";
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

  return (
    <section className="panel analyzer-panel" aria-labelledby="analyzer-title">
      <div className="section-heading">
        <p className="eyebrow">Analisis Pesan</p>
        <h1 id="analyzer-title">Trustora</h1>
        <p>Deteksi awal pesan SMS atau chat berbahasa Indonesia dengan model lokal dan indikator keamanan yang transparan.</p>
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <label htmlFor="message">Isi pesan</label>
        <textarea
          id="message"
          value={message}
          maxLength={5000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tempel SMS atau chat yang ingin dianalisis..."
        />
        <div className="form-meta">
          <span>{message.length}/5000 karakter</span>
          {error ? <strong role="alert">{error}</strong> : null}
        </div>
        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
            Analisis Pesan
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setMessage("");
              setResult(null);
              setError("");
            }}
          >
            <Trash2 aria-hidden="true" />
            Bersihkan
          </button>
        </div>
      </form>

      <div className="examples" aria-label="Contoh pesan">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => setMessage(example)}>
            {example}
          </button>
        ))}
      </div>

      {loading ? <div className="empty-state">Menganalisis pesan...</div> : null}
      {!loading && result ? <ResultCard result={result} /> : null}
      {!loading && !result ? <div className="empty-state">Hasil prediksi akan muncul setelah pesan dianalisis.</div> : null}
    </section>
  );
}

