import { Menu, Moon, Search, Shield, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BatchAnalyzer } from "./components/BatchAnalyzer";
import { MessageAnalyzer } from "./components/MessageAnalyzer";
import { MetricsDashboard } from "./components/MetricsDashboard";
import { TrainingPanel } from "./components/TrainingPanel";
import { useNav } from "./hooks/useNav";
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useTheme } from "./hooks/useTheme";

const NAV_LINKS = [
  { id: "analisis", label: "Analisis" },
  { id: "model", label: "Model" },
  { id: "evaluasi", label: "Evaluasi" },
  { id: "csv", label: "CSV" }
];

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { sentinelRef, scrolled, activeId } = useNav(NAV_LINKS.map((link) => link.id));
  const [menuOpen, setMenuOpen] = useState(false);
  useSmoothScroll();

  // Close the mobile drawer on Escape for keyboard users.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />

      <header className={`topbar${scrolled ? " is-scrolled" : ""}`}>
        <div className="topbar-inner">
          <a className="brand" href="#analisis" aria-label="Trustora beranda">
            <Shield aria-hidden="true" />
            <span>Trustora</span>
          </a>

          <nav className="nav-links" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={activeId === link.id ? "is-active" : undefined}
                aria-current={activeId === link.id ? "true" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
            <a className="button-link nav-cta" href="#analisis">
              <Search aria-hidden="true" />
              Analisis Pesan
            </a>
            <button
              type="button"
              className="theme-toggle nav-burger"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="mobile-menu" id="mobile-menu">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={activeId === link.id ? "is-active" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a className="button-link" href="#analisis" onClick={() => setMenuOpen(false)}>
              <Search aria-hidden="true" />
              Analisis Pesan
            </a>
          </div>
        ) : null}
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
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#analisis" aria-label="Trustora beranda">
              <Shield aria-hidden="true" />
              <span>Trustora</span>
            </a>
            <p>
              Alat bantu deteksi spam untuk SMS dan chat berbahasa Indonesia. Model dijalankan
              secara lokal dengan indikator yang transparan.
            </p>
          </div>

          <nav className="footer-group" aria-label="Fitur">
            <h2>Fitur</h2>
            <a href="#analisis">Analisis pesan</a>
            <a href="#model">Latih model</a>
            <a href="#evaluasi">Evaluasi kinerja</a>
            <a href="#csv">Analisis CSV</a>
          </nav>

          <div className="footer-group">
            <h2>Tentang</h2>
            <p>Dataset berbahasa Indonesia.</p>
            <p>Dua kategori: Normal dan Spam.</p>
            <p>Confidence dan tingkat risiko per pesan.</p>
          </div>
        </div>

        <div className="footer-bar">
          <span>&copy; 2026 Trustora</span>
          <span>Alat bantu deteksi, bukan keputusan akhir.</span>
        </div>
      </footer>
    </div>
  );
}
