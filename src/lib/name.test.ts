import { describe, expect, it } from "vitest";
import { normalizeName } from "./name";

describe("normalizeName", () => {
  it("normalizes casing, spacing, punctuation, and accents", () => {
    expect(normalizeName("  Rachél & Yi-Jia  ")).toBe("rachel yi jia");
  });
});
