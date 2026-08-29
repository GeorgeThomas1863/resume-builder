import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildBaseSchemaPrebuilt,
  buildBaseSchemaUpload,
  buildMessageInput,
  buildSchema,
  buildScreenerMessageInput,
} from "../src/message.js";

describe("message construction", () => {
  it("keeps job descriptions and uploaded resumes in separate prompt tags", async () => {
    const messages = await buildMessageInput("resume text", "job text");
    expect(messages[1].content).toBe("<job_description>job text</job_description>\n\n<default_resume>resume text</default_resume>");
  });

  it("includes prebuilt background information as JSON", async () => {
    const info = { jobArray: [{ jobId: 4 }] };
    const messages = await buildMessageInput(null, "job text", info);
    expect(messages[1].content).toContain(`<background_information>${JSON.stringify(info)}</background_information>`);
  });

  it("rejects a screener request without a builder user message", async () => {
    await expect(buildScreenerMessageInput([{ role: "system", content: "x" }], "{}", "upload")).resolves.toBeNull();
  });

  it("appends the builder draft for the screener", async () => {
    const result = await buildScreenerMessageInput([{ role: "user", content: "source" }], '{"summary":"draft"}', "upload");
    expect(result[1].content).toBe('source\n\n<draft_resume>{"summary":"draft"}</draft_resume>');
  });
});

describe("resume JSON schemas", () => {
  it("requires exactly seven upload experience entries", () => {
    expect(buildBaseSchemaUpload().properties.experience).toMatchObject({ minItems: 7, maxItems: 7 });
  });

  it("keys prebuilt experience entries by jobId", () => {
    expect(buildBaseSchemaPrebuilt().properties.experience.items.required).toContain("jobId");
  });

  it("makes every nested OpenAI object strict", async () => {
    const schema = (await buildSchema("chatgpt", "upload")).schema;
    expect(schema.properties.experience.items).toMatchObject({
      additionalProperties: false,
      required: ["role", "company", "timeframe", "bullets"],
    });
  });

  it("adds an audit field only to screener schemas", async () => {
    const schema = (await buildSchema("local", "prebuilt", true)).json_schema.schema;
    expect(schema.required).toContain("audit");
  });

  it("removes unsupported array length constraints for Claude", async () => {
    const experience = (await buildSchema("claude", "upload")).schema.properties.experience;
    expect(experience).not.toHaveProperty("minItems");
  });

  it("requires targetCompany and targetTitle on both base schemas", () => {
    expect(buildBaseSchemaPrebuilt().required).toEqual(expect.arrayContaining(["targetCompany", "targetTitle"]));
    expect(buildBaseSchemaUpload().required).toEqual(expect.arrayContaining(["targetCompany", "targetTitle"]));
  });

  it("carries targetCompany and targetTitle through to the screener schema", async () => {
    const schema = (await buildSchema("local", "upload", true)).json_schema.schema;
    expect(schema.required).toEqual(expect.arrayContaining(["targetCompany", "targetTitle"]));
    expect(schema.properties).toHaveProperty("targetCompany");
    expect(schema.properties).toHaveProperty("targetTitle");
  });

  // The exact pre-verbose shapes, hardcoded, so a verbose regression is caught even if
  // buildBaseSchemaPrebuilt/buildBaseSchemaUpload's own default-false path breaks.
  const classicPrebuiltSchema = {
    type: "object",
    required: ["summary", "experience", "skills", "certifications", "targetCompany", "targetTitle"],
    properties: {
      summary: { type: "string", description: "Tailored professional summary" },
      experience: {
        type: "array",
        description: "Selected jobs keyed by source jobId",
        items: {
          type: "object",
          required: ["jobId", "bullets"],
          properties: {
            jobId: { type: "integer", description: "jobId from background_information.jobArray" },
            bullets: { type: "array", items: { type: "string" }, description: "Tailored accomplishment bullets" },
          },
        },
      },
      skills: {
        type: "array",
        description: "Categorized skills tailored to the job description",
        items: {
          type: "object",
          required: ["category", "items"],
          properties: {
            category: { type: "string" },
            items: { type: "array", items: { type: "string" } },
          },
        },
      },
      certifications: { type: "array", description: "Selected certification display names", items: { type: "string" } },
      targetCompany: { type: "string", description: "Hiring company name extracted from job_description; use \"Company\" if not determinable" },
      targetTitle: { type: "string", description: "Job title extracted from job_description; use \"Role\" if not determinable" },
    },
  };

  const classicUploadSchema = {
    type: "object",
    required: ["name", "email", "summary", "experience", "education", "skills", "targetCompany", "targetTitle"],
    properties: {
      name: { type: "string", description: "Candidate's full name" },
      email: { type: "string", description: "Candidate's email address" },
      summary: { type: "string", description: "Tailored professional summary" },
      experience: { type: "array", minItems: 7, maxItems: 7, items: { type: "object", required: ["role", "company", "timeframe", "bullets"], properties: { role: { type: "string" }, company: { type: "string" }, timeframe: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } } },
      education: { type: "array", items: { type: "object", required: ["degree", "school", "timeframe"], properties: { degree: { type: "string" }, school: { type: "string" }, timeframe: { type: "string" } } } },
      skills: { type: "array", description: "Categorized skills tailored to the job description", items: { type: "object", required: ["category", "items"], properties: { category: { type: "string" }, items: { type: "array", items: { type: "string" } } } } },
      targetCompany: { type: "string", description: "Hiring company name extracted from job_description; use \"Company\" if not determinable" },
      targetTitle: { type: "string", description: "Job title extracted from job_description; use \"Role\" if not determinable" },
    },
  };

  it("keeps classic (verbose=false / omitted) base schemas byte-identical to the pre-verbose shape", () => {
    expect(buildBaseSchemaPrebuilt()).toEqual(classicPrebuiltSchema);
    expect(buildBaseSchemaPrebuilt(false)).toEqual(classicPrebuiltSchema);
    expect(buildBaseSchemaUpload()).toEqual(classicUploadSchema);
    expect(buildBaseSchemaUpload(false)).toEqual(classicUploadSchema);
  });

  it("adds a required top-level headline and per-job scope when verbose", () => {
    const prebuilt = buildBaseSchemaPrebuilt(true);
    expect(prebuilt.required[0]).toBe("headline");
    expect(prebuilt.properties.headline).toMatchObject({ type: "string" });
    expect(prebuilt.properties.experience.items.required).toContain("scope");
    expect(prebuilt.properties.experience.items.properties).toHaveProperty("scope");

    const upload = buildBaseSchemaUpload(true);
    expect(upload.required[0]).toBe("headline");
    expect(upload.properties.headline).toMatchObject({ type: "string" });
    expect(upload.properties.experience.items.required).toContain("scope");
    expect(upload.properties.experience.items.properties).toHaveProperty("scope");
  });

  it("keeps audit first in verbose screener schemas, ahead of headline", async () => {
    const schema = (await buildSchema("local", "prebuilt", true, true)).json_schema.schema;
    expect(schema.required[0]).toBe("audit");
    expect(schema.required).toContain("headline");
    expect(schema.properties.experience.items.required).toContain("scope");
  });
});

describe("verbose prompt file selection", () => {
  afterEach(() => {
    vi.doUnmock("fs/promises");
    vi.resetModules();
  });

  // Fresh module instance per test (via resetModules + dynamic import) so each test's
  // fs mock and the module's internal prompt/config caches never bleed into another test.
  const loadMessageModule = async (fileContents) => {
    vi.resetModules();
    vi.doMock("fs/promises", () => ({
      default: {
        readFile: vi.fn(async (url) => {
          const name = url.toString().split("/").pop();
          if (!Object.prototype.hasOwnProperty.call(fileContents, name)) {
            throw Object.assign(new Error(`unexpected read: ${name}`), { code: "ENOENT" });
          }
          const value = fileContents[name];
          if (value === null) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
          return value;
        }),
      },
    }));
    return import("../src/message.js");
  };

  it("loads builder-prebuilt-verbose.md when verbose=true", async () => {
    const mod = await loadMessageModule({ "builder-prebuilt-verbose.md": "VERBOSE SYSTEM" });
    const messages = await mod.buildMessageInput(null, "job", { jobArray: [] }, true);
    expect(messages[0].content).toBe("VERBOSE SYSTEM");
  });

  it("loads builder-prebuilt.md when verbose=false", async () => {
    const mod = await loadMessageModule({ "builder-prebuilt.md": "CLASSIC SYSTEM" });
    const messages = await mod.buildMessageInput(null, "job", { jobArray: [] }, false);
    expect(messages[0].content).toBe("CLASSIC SYSTEM");
  });

  it("loads builder-upload-verbose.md when verbose=true and infoObj is absent", async () => {
    const mod = await loadMessageModule({ "builder-upload-verbose.md": "UPLOAD VERBOSE" });
    const messages = await mod.buildMessageInput("resume text", "job", null, true);
    expect(messages[0].content).toBe("UPLOAD VERBOSE");
  });

  it("loads builder-upload.md when verbose is omitted", async () => {
    const mod = await loadMessageModule({ "builder-upload.md": "UPLOAD CLASSIC" });
    const messages = await mod.buildMessageInput("resume text", "job", null);
    expect(messages[0].content).toBe("UPLOAD CLASSIC");
  });

  it("loads screener-prebuilt-verbose.md when verbose=true", async () => {
    const mod = await loadMessageModule({ "screener-prebuilt-verbose.md": "SCREENER VERBOSE" });
    const result = await mod.buildScreenerMessageInput([{ role: "user", content: "source" }], "{}", "prebuilt", true);
    expect(result[0].content).toBe("SCREENER VERBOSE");
  });

  it("loads screener-upload.md when verbose=false", async () => {
    const mod = await loadMessageModule({ "screener-upload.md": "SCREENER CLASSIC" });
    const result = await mod.buildScreenerMessageInput([{ role: "user", content: "source" }], "{}", "upload", false);
    expect(result[0].content).toBe("SCREENER CLASSIC");
  });
});

describe("resume_v1 / resume_v2 reference blocks (prebuilt verbose only)", () => {
  afterEach(() => {
    vi.doUnmock("fs/promises");
    vi.resetModules();
  });

  const loadMessageModule = async (fileContents) => {
    vi.resetModules();
    vi.doMock("fs/promises", () => ({
      default: {
        readFile: vi.fn(async (url) => {
          const name = url.toString().split("/").pop();
          if (!Object.prototype.hasOwnProperty.call(fileContents, name)) {
            throw Object.assign(new Error(`unexpected read: ${name}`), { code: "ENOENT" });
          }
          const value = fileContents[name];
          if (value === null) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
          return value;
        }),
      },
    }));
    return import("../src/message.js");
  };

  it("inserts resume_v1 then resume_v2 after background_information and before default_resume", async () => {
    const mod = await loadMessageModule({
      "builder-prebuilt-verbose.md": "SYS",
      "resume-config1.md": "RESUME ONE",
      "resume-config2.md": "RESUME TWO",
    });
    const info = { jobArray: [] };
    const messages = await mod.buildMessageInput("default text", "job", info, true);
    const expected =
      "<job_description>job</job_description>" +
      `\n\n<background_information>${JSON.stringify(info)}</background_information>` +
      "\n\n<resume_v1>RESUME ONE</resume_v1>" +
      "\n\n<resume_v2>RESUME TWO</resume_v2>" +
      "\n\n<default_resume>default text</default_resume>";
    expect(messages[1].content).toBe(expected);
  });

  it("omits resume_v1/v2 for upload verbose", async () => {
    const mod = await loadMessageModule({ "builder-upload-verbose.md": "SYS" });
    const messages = await mod.buildMessageInput("resume text", "job", null, true);
    expect(messages[1].content).not.toContain("<resume_v1>");
    expect(messages[1].content).not.toContain("<resume_v2>");
  });

  it("omits resume_v1/v2 for prebuilt classic", async () => {
    const mod = await loadMessageModule({ "builder-prebuilt.md": "SYS" });
    const info = { jobArray: [] };
    const messages = await mod.buildMessageInput(null, "job", info, false);
    expect(messages[1].content).not.toContain("<resume_v1>");
    expect(messages[1].content).not.toContain("<resume_v2>");
  });

  it("omits the block and does not throw when resume-config files are missing (no config/ directory)", async () => {
    const mod = await loadMessageModule({
      "builder-prebuilt-verbose.md": "SYS",
      "resume-config1.md": null,
      "resume-config2.md": null,
    });
    const info = { jobArray: [] };
    const messages = await mod.buildMessageInput(null, "job", info, true);
    expect(messages).not.toBeNull();
    expect(messages[1].content).not.toContain("<resume_v1>");
    expect(messages[1].content).not.toContain("<resume_v2>");
    expect(messages[1].content).toBe(
      "<job_description>job</job_description>" +
        `\n\n<background_information>${JSON.stringify(info)}</background_information>`
    );
  });

  it("includes resume_v1 alone when only resume-config2.md is missing", async () => {
    const mod = await loadMessageModule({
      "builder-prebuilt-verbose.md": "SYS",
      "resume-config1.md": "RESUME ONE",
      "resume-config2.md": null,
    });
    const info = { jobArray: [] };
    const messages = await mod.buildMessageInput(null, "job", info, true);
    expect(messages[1].content).toContain("<resume_v1>RESUME ONE</resume_v1>");
    expect(messages[1].content).not.toContain("<resume_v2>");
  });
});
