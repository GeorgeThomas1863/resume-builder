import { beforeEach, describe, expect, it, vi } from "vitest";

let mockTwoPassResult = null;
let mockBuffer = Buffer.from("docx");

vi.mock("../src/resume.js", () => ({
  extractResumeText: vi.fn(async () => "resume text"),
  buildNewResume: vi.fn(async () => mockBuffer),
  resumeDetails: { lastName: "Remedio" },
}));

vi.mock("../src/ai.js", () => ({
  runTwoPassAI: vi.fn(async () => mockTwoPassResult),
}));

vi.mock("../src/message.js", () => ({
  buildMessageInput: vi.fn(async () => [{ role: "user", content: "x" }]),
  buildSchema: vi.fn(async () => ({ schema: {} })),
  buildInfoObj: vi.fn(async () => ({ jobArray: [] })),
}));

const { runResumeUnfucker } = await import("../src/src.js");
const { buildNewResume } = await import("../src/resume.js");
const { buildMessageInput, buildSchema } = await import("../src/message.js");

beforeEach(() => {
  mockBuffer = Buffer.from("docx");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.clearAllMocks();
});

describe("runResumeUnfucker", () => {
  it("returns null when called without params", async () => {
    await expect(runResumeUnfucker(null)).resolves.toBeNull();
  });

  it("returns null when the AI pipeline yields no text", async () => {
    mockTwoPassResult = null;
    await expect(runResumeUnfucker({ jobInput: "job" })).resolves.toBeNull();
  });

  it("returns null when the AI text is not valid JSON", async () => {
    mockTwoPassResult = "not json";
    await expect(runResumeUnfucker({ jobInput: "job" })).resolves.toBeNull();
  });

  it("returns null when buildNewResume fails", async () => {
    mockTwoPassResult = JSON.stringify({ name: "Jane Doe", targetCompany: "Acme", targetTitle: "Engineer" });
    buildNewResume.mockResolvedValueOnce(null);
    await expect(runResumeUnfucker({ jobInput: "job" })).resolves.toBeNull();
  });

  it("resolves lastName from the AI name in upload mode", async () => {
    mockTwoPassResult = JSON.stringify({ name: "Jane Q. Doe", targetCompany: "Acme", targetTitle: "Engineer" });
    const result = await runResumeUnfucker({ jobInput: "job", useSpecialInfo: false });
    expect(result).toEqual({ buffer: mockBuffer, targetCompany: "Acme", targetTitle: "Engineer", lastName: "Doe" });
    expect(buildNewResume).toHaveBeenCalledWith(expect.objectContaining({ name: "Jane Q. Doe" }), null, undefined, undefined);
  });

  it("falls back to User when upload-mode name is missing or blank", async () => {
    mockTwoPassResult = JSON.stringify({ name: "   ", targetCompany: "Acme", targetTitle: "Engineer" });
    const result = await runResumeUnfucker({ jobInput: "job", useSpecialInfo: false });
    expect(result.lastName).toBe("User");
  });

  it("resolves lastName from resumeDetails in prebuilt mode", async () => {
    mockTwoPassResult = JSON.stringify({ targetCompany: "Acme", targetTitle: "Engineer" });
    const result = await runResumeUnfucker({ jobInput: "job", useSpecialInfo: true });
    expect(result.lastName).toBe("Remedio");
  });

  it("threads verbose=true through buildMessageInput, buildSchema, and buildNewResume", async () => {
    mockTwoPassResult = JSON.stringify({ name: "Jane Doe", targetCompany: "Acme", targetTitle: "Engineer" });
    const aiObj = JSON.parse(mockTwoPassResult);
    await runResumeUnfucker({ jobInput: "job", useSpecialInfo: false, verbose: true });
    expect(buildMessageInput).toHaveBeenCalledWith("resume text", "job", null, true);
    expect(buildSchema).toHaveBeenCalledWith(undefined, "upload", false, true);
    expect(buildNewResume).toHaveBeenCalledWith(aiObj, null, undefined, true);
  });

  it("threads verbose through as undefined when absent from inputParams", async () => {
    mockTwoPassResult = JSON.stringify({ name: "Jane Doe", targetCompany: "Acme", targetTitle: "Engineer" });
    await runResumeUnfucker({ jobInput: "job", useSpecialInfo: false });
    expect(buildMessageInput).toHaveBeenCalledWith("resume text", "job", null, undefined);
    expect(buildSchema).toHaveBeenCalledWith(undefined, "upload", false, undefined);
    expect(buildNewResume).toHaveBeenCalledWith(expect.any(Object), null, undefined, undefined);
  });

  it("threads verbose through in prebuilt mode alongside infoObj", async () => {
    mockTwoPassResult = JSON.stringify({ targetCompany: "Acme", targetTitle: "Engineer" });
    await runResumeUnfucker({ jobInput: "job", useSpecialInfo: true, verbose: true });
    expect(buildMessageInput).toHaveBeenCalledWith("resume text", "job", { jobArray: [] }, true);
    expect(buildSchema).toHaveBeenCalledWith(undefined, "prebuilt", false, true);
    expect(buildNewResume).toHaveBeenCalledWith(expect.any(Object), { jobArray: [] }, undefined, true);
  });
});
