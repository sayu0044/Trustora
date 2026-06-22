import { Shield } from "lucide-react";
import { BatchAnalyzer } from "./components/BatchAnalyzer";
import { MessageAnalyzer } from "./components/MessageAnalyzer";
import { MetricsDashboard } from "./components/MetricsDashboard";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#analisis" aria-label="Trustora beranda">
          <Shield aria-hidden="true" />
          <span>Trustora</span>
        </a>
        <nav aria-label="Navigasi utama">
          <a href="#analisis">Analisis</a>
          <a href="#evaluasi">Evaluasi</a>
          <a href="#csv">CSV</a>
        </nav>
      </header>

      <main>
        <section id="analisis">
          <MessageAnalyzer />
        </section>
        <section id="evaluasi">
          <MetricsDashboard />
        </section>
        <section id="csv">
          <BatchAnalyzer />
        </section>
      </main>
    </div>
  );
}

