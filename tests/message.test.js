import { describe, expect, it } from "vitest";
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
});
