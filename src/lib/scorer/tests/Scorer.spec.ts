import { describe, it, expect, vi, beforeEach } from "vitest";
import Scorer, { ScoreData } from "../Scorer"; // adjust path
import Logger from "@log/Logger";
import { Libraries } from "@/Libraries";

// ----------------------------
// Mock Logger
// ----------------------------
const mockLogger = {
  groupCollapsed: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  groupEnd: vi.fn(),
};

vi.mock("@log/Logger", () => ({
  default: {
    createLogger: vi.fn(() => mockLogger),
  },
}));

// ----------------------------
// Mock localStorage
// ----------------------------
const mockLocalStorage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem: (key: string) => mockLocalStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockLocalStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockLocalStorage[key];
  },
  clear: () => {
    for (const key in mockLocalStorage) delete mockLocalStorage[key];
  },
});

// ----------------------------
// Mock Libraries.getZOD
// ----------------------------
const mockZodObject = {
  optional: vi.fn().mockReturnThis(),
  safeParseAsync: vi.fn(async (data) => {
    try {
      const parsed = JSON.parse(data);
      return { data: parsed };
    } catch {
      return { error: true };
    }
  }),
};

vi.mock("@/Libraries", () => ({
  Libraries: {
    getZOD: vi.fn(() => ({
      object: vi.fn(() => mockZodObject),
      number: vi.fn(() => ({})),
    })),
  },
}));

// ----------------------------
// Tests
// ----------------------------
describe("Scorer", () => {
  let scorer: Scorer;

  beforeEach(() => {
    for (const key in mockLocalStorage) delete mockLocalStorage[key];
    vi.clearAllMocks();
    (Scorer as any).instance = undefined; // reset singleton
    scorer = Scorer.getInstance();
  });

  it("initializes with default ScoreData if no saved score", async () => {
    await scorer.initialize();

    expect(scorer.getSavedScore()).toBeUndefined();
    expect(scorer.getScoreData()).toBeInstanceOf(ScoreData);
    expect(scorer.getScoreData().getLevel()).toBe(1);
    expect(scorer.getScoreData().getScore()).toBe(0);

    expect(mockLogger.groupCollapsed).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  it("loads valid saved score from localStorage", async () => {
    const saved = JSON.stringify({ level: 5, score: 12345 });
    localStorage.setItem(Scorer.SAVED_SCORE_KEY, saved);

    // override safeParseAsync to simulate valid parse
    mockZodObject.safeParseAsync.mockResolvedValueOnce({
      data: JSON.parse(saved),
    });

    await scorer.initialize();

    const savedScore = scorer.getSavedScore();
    expect(savedScore).toBeInstanceOf(ScoreData);
    expect(savedScore!.getLevel()).toBe(5);
    expect(savedScore!.getScore()).toBe(12345);

    expect(mockLogger.info).toHaveBeenCalledWith("Saved score is valid.");
  });

  it("removes invalid saved score from localStorage", async () => {
    localStorage.setItem(Scorer.SAVED_SCORE_KEY, "invalid-json");

    // simulate invalid parse
    mockZodObject.safeParseAsync.mockResolvedValueOnce({ error: true });

    await scorer.initialize();

    expect(scorer.getSavedScore()).toBeUndefined();
    expect(localStorage.getItem(Scorer.SAVED_SCORE_KEY)).toBeNull();
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Invalid saved score... Deleting"
    );
  });

  it("returns the same singleton instance", () => {
    const instance1 = Scorer.getInstance();
    const instance2 = Scorer.getInstance();
    expect(instance1).toBe(instance2);
  });
});
