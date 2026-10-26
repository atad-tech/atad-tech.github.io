import { expect, test } from "@playwright/test";
import { safeId, safeSource, safeText } from "../../src/lib/sanitize";

test.describe("safeSource", () => {
  test("accepts normal sources", () => {
    expect(safeSource("facebook")).toBe("facebook");
    expect(safeSource("google-maps")).toBe("google-maps");
    expect(safeSource("فيسبوك")).toBe("فيسبوك");
    expect(safeSource("facebook / ad-1")).toBe("facebook / ad-1");
  });
  test("rejects injection and abuse", () => {
    expect(safeSource("<script>alert(1)</script>")).toBe("");
    expect(safeSource('"><img src=x onerror=alert(1)>')).toBe("");
    expect(safeSource("x".repeat(41))).toBe("");
    expect(safeSource("line1\nline2")).toBe("");
    expect(safeSource("حوّل الفلوس على 0100 قبل ما الطلب يتلغي!!")).toBe("");
    expect(safeSource("https://evil.example")).toBe("");
    expect(safeSource(null)).toBe("");
  });
});

test.describe("safeId", () => {
  test("accepts tracking ids", () => {
    expect(safeId("AW-123456789")).toBe("AW-123456789");
    expect(safeId("123456789012345")).toBe("123456789012345");
  });
  test("rejects anything that could break a URL", () => {
    expect(safeId("AW-1&callback=x")).toBe("");
    expect(safeId("../../x")).toBe("");
    expect(safeId("")).toBe("");
  });
});

test.describe("safeText", () => {
  test("strips control and bidi-override characters", () => {
    expect(safeText("أحمد‮evil\u0000")).toBe("أحمدevil");
  });
  test("caps length", () => {
    expect(safeText("a".repeat(1000), 80)).toHaveLength(80);
  });
  test("keeps normal multi-line text", () => {
    expect(safeText("سطر\nسطر تاني")).toBe("سطر\nسطر تاني");
  });
});
