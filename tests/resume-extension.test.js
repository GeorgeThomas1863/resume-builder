import { expect, it, vi } from "vitest";

const extractRawText = vi.fn(async () => ({ value: "misparsed content" }));

vi.mock("mammoth", () => ({
  default: { extractRawText },
}));

const { extractResumeText } = await import("../src/resume.js");

it("rejects unsupported resume extensions without invoking a DOCX parser", async () => {
  await expect(extractResumeText("resume.txt")).resolves.toBeNull();
  expect(extractRawText).not.toHaveBeenCalled();
});
