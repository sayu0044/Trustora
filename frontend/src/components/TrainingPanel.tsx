import { AlertTriangle, CheckCircle2, CircleSlash, Cpu, Loader2, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getTrainingStatus, startTraining } from "../services/api";
import type { TrainingStatus } from "../types/api";

const POLL_INTERVAL_MS = 3000;

function formatDuration(seconds: number | null): string | null {
  if (typeof seconds !== "number") return null;
  if (seconds < 60) return `${seconds.toFixed(1)} detik`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return `${minutes} menit ${rest} detik`;
}

export function TrainingPanel() {
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await getTrainingStatus());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status training belum dapat dimuat.");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll only while training is running; clean up on stop/unmount.
  useEffect(() => {
    const running = status?.state === "running";
    if (running && timerRef.current === null) {
      timerRef.current = setInterval(() => void refresh(), POLL_INTERVAL_MS);
    }
    if (!running && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status?.state, refresh]);

  async function handleTrain() {
    setStarting(true);
    setError("");
    try {
      setStatus(await startTraining());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Training gagal dimulai.");
    } finally {
      setStarting(false);
    }
  }

  const running = status?.state === "running";
  const ready = status?.model_ready ?? false;
  const duration = formatDuration(status?.duration_seconds ?? null);

  return (
    <section className="panel" aria-labelledby="training-title">
      <div className="section-heading row-heading">
        <div>
          <p className="eyebrow">Manajemen Model</p>
          <h2 id="training-title">Latih ulang model</h2>
          <p>
            Jalankan training untuk membangun ulang model dari dataset. Proses berjalan di latar dan
            status diperbarui otomatis.
          </p>
        </div>
        <button type="button" onClick={handleTrain} disabled={running || starting}>
          {running || starting ? (
            <Loader2 className="spin" aria-hidden="true" />
          ) : (
            <Play aria-hidden="true" />
          )}
          {running ? "Sedang melatih..." : "Mulai Training"}
        </button>
      </div>

      <div
        className={`status-banner ${ready ? "is-ready" : "is-pending"}`}
        role="status"
        aria-live="polite"
      >
        <span className="status-dot" aria-hidden="true" />
        <Cpu aria-hidden="true" />
        <div>
          <strong>{ready ? "Model siap digunakan" : "Model belum tersedia"}</strong>
          <span className="status-sub">
            {ready
              ? status?.best_model
                ? `Model aktif: ${status.best_model}`
                : "Model terlatih ditemukan."
              : "Belum ada model terlatih. Jalankan training terlebih dahulu."}
          </span>
        </div>
      </div>

      <ul className="train-progress" aria-label="Detail status training">
        <li>
          <span className="label">Status proses</span>
          <span className={`train-state state-${status?.state ?? "idle"}`}>
            {running ? <Loader2 className="spin" aria-hidden="true" /> : null}
            {status?.state === "success" ? <CheckCircle2 aria-hidden="true" /> : null}
            {status?.state === "error" ? <AlertTriangle aria-hidden="true" /> : null}
            {status?.state === "idle" ? <CircleSlash aria-hidden="true" /> : null}
            {labelForState(status?.state)}
          </span>
        </li>
        {duration ? (
          <li>
            <span className="label">Durasi terakhir</span>
            <strong>{duration}</strong>
          </li>
        ) : null}
        {status?.message ? (
          <li>
            <span className="label">Pesan</span>
            <span>{status.message}</span>
          </li>
        ) : null}
      </ul>

      {status?.state === "error" ? (
        <p className="error-text" role="alert">
          {status.message ?? "Training gagal dijalankan."}
        </p>
      ) : null}
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function labelForState(state: TrainingStatus["state"] | undefined): string {
  switch (state) {
    case "running":
      return "Sedang berjalan";
    case "success":
      return "Selesai";
    case "error":
      return "Gagal";
    default:
      return "Belum dijalankan";
  }
}
