import { afterEach, describe, expect, it, vi } from "vitest";
import { getTrainingStatus, startTraining } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("training API errors", () => {
  it("explains status network failures with local server guidance", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(getTrainingStatus()).rejects.toThrow(
      "Status training belum dapat dimuat. Pastikan backend berjalan di http://localhost:8000 lewat trustora serve, frontend berjalan di http://localhost:5173, dan tidak ada port lama yang masih aktif."
    );
  });

  it("explains start network failures with local server guidance", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(startTraining()).rejects.toThrow(
      "Training gagal dimulai. Pastikan backend berjalan di http://localhost:8000 lewat trustora serve, frontend berjalan di http://localhost:5173, dan tidak ada port lama yang masih aktif."
    );
  });
});
