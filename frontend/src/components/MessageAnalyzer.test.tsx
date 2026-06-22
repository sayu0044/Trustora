import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageAnalyzer } from "./MessageAnalyzer";
import { predictMessage } from "../services/api";
import type { PredictResponse } from "../types/api";

vi.mock("../services/api", () => ({
  predictMessage: vi.fn()
}));

const mockedPredict = vi.mocked(predictMessage);

afterEach(() => {
  vi.clearAllMocks();
});

describe("MessageAnalyzer", () => {
  it("validates empty message", async () => {
    render(<MessageAnalyzer />);
    await userEvent.click(screen.getByRole("button", { name: /analisis pesan/i }));
    expect(screen.getByRole("alert")).toHaveTextContent("Pesan tidak boleh kosong.");
  });

  it("renders loading and prediction result", async () => {
    let resolvePrediction: (value: Awaited<ReturnType<typeof predictMessage>>) => void = () => undefined;
    mockedPredict.mockReturnValueOnce(new Promise((resolve) => {
      resolvePrediction = resolve;
    }));

    const prediction: PredictResponse = {
      raw_label: "spam",
      category: "Spam",
      confidence: 0.96,
      risk_level: "Tinggi",
      spam_indication: "Indikasi Penipuan",
      suspicious_keywords: ["hadiah"],
      advice: ["Jangan klik tautan yang tidak dikenal."],
      disclaimer: "Hasil ini merupakan prediksi awal dan bukan keputusan mutlak."
    };

    render(<MessageAnalyzer />);
    await userEvent.type(screen.getByLabelText(/isi pesan/i), "klaim hadiah sekarang");
    await userEvent.click(screen.getByRole("button", { name: /analisis pesan/i }));

    expect(screen.getByText(/menganalisis pesan/i)).toBeInTheDocument();
    resolvePrediction(prediction);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Spam" })).toBeInTheDocument());
    expect(screen.getByText("96%")).toBeInTheDocument();
  });

  it("shows API error", async () => {
    mockedPredict.mockRejectedValueOnce(new Error("Model belum tersedia."));

    render(<MessageAnalyzer />);
    await userEvent.type(screen.getByLabelText(/isi pesan/i), "halo");
    await userEvent.click(screen.getByRole("button", { name: /analisis pesan/i }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Model belum tersedia."));
  });
});
