import { Moon, Shield, Sun } from "lucide-react";
import { BatchAnalyzer } from "./components/BatchAnalyzer";
import { MessageAnalyzer } from "./components/MessageAnalyzer";
import { MetricsDashboard } from "./components/MetricsDashboard";
import { TrainingPanel } from "./components/TrainingPanel";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#analisis" aria-label="Trustora beranda">
            <Shield aria-hidden="true" />
            <span>Trustora</span>
          </a>
          <nav aria-label="Navigasi utama">
            <a href="#analisis">Analisis</a>
            <a href="#model">Model</a>
            <a href="#evaluasi">Evaluasi</a>
            <a href="#csv">CSV</a>
          </nav>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
          >
            {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main>
        <div className="intro">
          <p className="kicker">Deteksi spam berbahasa Indonesia</p>
          <h1>Periksa pesan mencurigakan sebelum Anda menanggapinya.</h1>
          <p>
            Trustora menganalisis SMS dan chat berbahasa Indonesia dengan model lokal, lalu
            menampilkan kategori, tingkat keyakinan, risiko, dan kata kunci yang memicu deteksi
            secara transparan.
          </p>
          <div className="intro-stats">
            <div>
              <strong>2 kategori</strong>
              <span>Normal dan Spam</span>
            </div>
            <div>
              <strong>Per pesan</strong>
              <span>Confidence dan tingkat risiko</span>
            </div>
            <div>
              <strong>Batch CSV</strong>
              <span>Analisis banyak pesan sekaligus</span>
            </div>
          </div>
        </div>

        <div className="sections">
          <section id="analisis">
            <MessageAnalyzer />
          </section>
          <section id="model">
            <TrainingPanel />
          </section>
          <section id="evaluasi">
            <MetricsDashboard />
          </section>
          <section id="csv">
            <BatchAnalyzer />
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <span>
            <strong>Trustora</strong> - alat bantu deteksi spam, bukan keputusan akhir.
          </span>
          <span>Model dijalankan secara lokal pada data berbahasa Indonesia.</span>
        </div>
      </footer>
    </div>
  );
}
