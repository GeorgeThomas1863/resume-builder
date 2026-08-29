import { beforeEach, describe, expect, it, vi } from "vitest";

const openAIRequests = [];
const anthropicRequests = [];
let openAIResponses = [];
let anthropicResponse = { content: [] };

vi.mock("openai", () => ({
  OpenAI: class {
    constructor(options) {
      this.options = options;
      this.responses = { create: vi.fn(async (request) => { openAIRequests.push(request); return { output_text: openAIResponses.shift() }; }) };
      this.chat = { completions: { create: vi.fn(async (request) => { openAIRequests.push(request); return { choices: [{ message: { content: openAIResponses.shift() } }] }; }) } };
    }
  },
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    constructor() {
      this.messages = { create: vi.fn(async (request) => { anthropicRequests.push(request); return anthropicResponse; }) };
    }
  },
}));

// Mocked so the screener-pass tests below don't depend on real prompt files on disk (verbose
// prompt selection and schema shaping are covered directly in message.test.js) — every existing
// test here only asserts on requests reaching the OpenAI/Anthropic mocks, never on message.js output.
vi.mock("../src/message.js", () => ({
  buildScreenerMessageInput: vi.fn(async () => [{ role: "user", content: "screener" }]),
  buildSchema: vi.fn(async () => ({ schema: { type: "object" }, name: "resume_enhancement" })),
}));

const { runChatGPT, runClaude, runTwoPassAI } = await import("../src/ai.js");
const { buildScreenerMessageInput, buildSchema } = await import("../src/message.js");

const validDraft = JSON.stringify({ summary: "draft", experience: [], skills: [] });
const base = {
  aiType: "local", modelType: "builder", screenerAiType: "local", screenerModelType: "screen",
  messageInput: [{ role: "user", content: "job" }], schema: { type: "json_schema" }, mode: "upload",
  maxTokens: 100, temperature: 0.2,
};

beforeEach(() => {
  openAIRequests.length = 0;
  anthropicRequests.length = 0;
  openAIResponses = [];
  anthropicResponse = { content: [] };
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.clearAllMocks();
});

describe("two-pass AI", () => {
  it("returns the builder draft when screener JSON is malformed", async () => {
    openAIResponses = [validDraft, "not json"];
    await expect(runTwoPassAI(base)).resolves.toBe(validDraft);
  });

  it("skips the screener when builder JSON is malformed", async () => {
    openAIResponses = ["not json"];
    await expect(runTwoPassAI(base)).resolves.toBe("not json");
    expect(openAIRequests).toHaveLength(1);
  });

  it("returns screened JSON when it has a string audit", async () => {
    const screened = JSON.stringify({ audit: "ok", summary: "final", experience: [], skills: [] });
    openAIResponses = [validDraft, screened];
    await expect(runTwoPassAI(base)).resolves.toBe(screened);
  });

  it("raises screener token budget to its safety minimum", async () => {
    openAIResponses = [validDraft, JSON.stringify({ audit: "ok", summary: "x", experience: [], skills: [] })];
    await runTwoPassAI(base);
    expect(openAIRequests[1].max_tokens).toBe(16000);
  });
});

describe("screener verbose threading", () => {
  it("passes verbose through to buildScreenerMessageInput and buildSchema", async () => {
    openAIResponses = [validDraft, JSON.stringify({ audit: "ok", summary: "x", experience: [], skills: [] })];
    await runTwoPassAI({ ...base, verbose: true });
    expect(buildScreenerMessageInput).toHaveBeenCalledWith(base.messageInput, validDraft, base.mode, true);
    expect(buildSchema).toHaveBeenCalledWith(base.screenerAiType, base.mode, true, true);
  });

  it("passes verbose through as-is (undefined) when absent from inputParams", async () => {
    openAIResponses = [validDraft, JSON.stringify({ audit: "ok", summary: "x", experience: [], skills: [] })];
    await runTwoPassAI(base);
    expect(buildScreenerMessageInput).toHaveBeenCalledWith(base.messageInput, validDraft, base.mode, undefined);
    expect(buildSchema).toHaveBeenCalledWith(base.screenerAiType, base.mode, true, undefined);
  });
});

describe("provider request shaping", () => {
  it("sends OpenAI Responses API structured output in text.format", async () => {
    openAIResponses = [validDraft];
    await runChatGPT({ ...base, schema: { name: "resume", schema: { type: "object" } } });
    expect(openAIRequests[0].text.format).toMatchObject({ type: "json_schema", name: "resume", strict: true });
  });

  it("omits temperature for Claude models that reject it", async () => {
    anthropicResponse = { content: [{ type: "text", text: validDraft }] };
    await runClaude({ ...base, modelType: "claude-sonnet-4-7", schema: { schema: { type: "object" } } });
    expect(anthropicRequests[0]).not.toHaveProperty("temperature");
  });
});
