import { describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { buildDefaultParagraphArray, buildNewResume, buildPrebuiltParagraphArray, extractResumeText } from "../src/resume.js";

describe("resume parsing and document creation", () => {
  it("returns null when no resume path is supplied", async () => {
    await expect(extractResumeText(null)).resolves.toBeNull();
  });

  it("returns null for malformed AI JSON", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(buildNewResume("not json")).resolves.toBeNull();
  });

  it("builds a valid DOCX buffer from a minimal valid upload response", async () => {
    const input = { name: "A", email: "a@example.com", summary: "S", experience: [], education: [], skills: [] };
    const buffer = await buildNewResume(JSON.stringify(input));
    const zip = await JSZip.loadAsync(buffer);
    expect(zip.file("word/document.xml")).not.toBeNull();
  });

  it("does not throw when optional arrays are absent", async () => {
    await expect(buildDefaultParagraphArray({ name: "A", email: "E", summary: "S" })).resolves.toBeInstanceOf(Array);
  });

  it("skips prebuilt experience entries with unknown jobIds", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = { jobArray: [], education: [], certifications: [] };
    const baseline = await buildPrebuiltParagraphArray({ summary: "S", skills: [], experience: [] }, info);
    const paragraphs = await buildPrebuiltParagraphArray({ summary: "S", skills: [], experience: [{ jobId: 99, bullets: ["x"] }] }, info);
    expect(paragraphs).toHaveLength(baseline.length);
  });
});
