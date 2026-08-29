import { describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import {
  buildDefaultParagraphArray,
  buildNewResume,
  buildParagraphArray,
  buildPrebuiltParagraphArray,
  buildVerboseDefaultParagraphArray,
  buildVerbosePrebuiltParagraphArray,
  extractResumeText,
} from "../src/resume.js";

// docx components stringify into a walkable { rootKey, root: [...] } tree; these
// helpers read rendered text and run formatting back out of that tree for assertions
const toPlain = (node) => JSON.parse(JSON.stringify(node));

const collectText = (node) => {
  if (!node || typeof node !== "object") return "";
  if (node.rootKey === "w:t") {
    let text = "";
    for (const child of node.root) if (typeof child === "string") text += child;
    return text;
  }
  let text = "";
  if (Array.isArray(node.root)) {
    for (const child of node.root) text += collectText(child);
  }
  return text;
};

const paragraphText = (paragraph) => collectText(toPlain(paragraph));

const collectRuns = (node, runs = []) => {
  if (!node || typeof node !== "object") return runs;
  if (node.rootKey === "w:r") {
    runs.push(node);
    return runs;
  }
  if (Array.isArray(node.root)) for (const child of node.root) collectRuns(child, runs);
  return runs;
};

const paragraphRuns = (paragraph) => collectRuns(toPlain(paragraph));

const runIsItalic = (run) => (run.properties?.root ?? []).some((p) => p.rootKey === "w:i");

describe("resume parsing and document creation", () => {
  it("returns null when no resume path is supplied", async () => {
    await expect(extractResumeText(null)).resolves.toBeNull();
  });

  it("returns null for a non-object input", async () => {
    await expect(buildNewResume("not json")).resolves.toBeNull();
    await expect(buildNewResume(null)).resolves.toBeNull();
  });

  it("builds a valid DOCX buffer from a minimal valid upload response", async () => {
    const input = { name: "A", email: "a@example.com", summary: "S", experience: [], education: [], skills: [] };
    const buffer = await buildNewResume(input);
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

describe("verbose prebuilt rendering", () => {
  const infoObj = {
    jobArray: [{ jobId: 1, role: "Engineer", company: "Acme", timeframe: "2020-2023" }],
    education: [
      { school: "Old U", degrees: ["BA"], graduation: "2010" },
      { school: "New U", degrees: ["MA"], graduation: "2020" },
    ],
    certifications: [{ certification: "AWS Certified" }, { certification: "PMP" }],
  };

  it("renders scope as an italic paragraph after the job line", async () => {
    const aiObj = { summary: "S", skills: [], experience: [{ jobId: 1, scope: "Led a team of five", bullets: ["did stuff"] }] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    const scopeParagraph = paragraphs.find((p) => paragraphText(p) === "Led a team of five");
    expect(scopeParagraph).toBeDefined();
    expect(paragraphRuns(scopeParagraph).some(runIsItalic)).toBe(true);
  });

  it("skips the scope paragraph when scope is empty or whitespace", async () => {
    const withScope = await buildVerbosePrebuiltParagraphArray(
      { summary: "S", skills: [], experience: [{ jobId: 1, scope: "Text", bullets: ["b"] }] },
      infoObj
    );
    const withoutScope = await buildVerbosePrebuiltParagraphArray(
      { summary: "S", skills: [], experience: [{ jobId: 1, scope: "   ", bullets: ["b"] }] },
      infoObj
    );
    expect(withoutScope).toHaveLength(withScope.length - 1);
  });

  it("never renders headline text anywhere in the document", async () => {
    const aiObj = { summary: "S", skills: [], headline: "TOP_SECRET_HEADLINE", experience: [{ jobId: 1, bullets: ["b"] }] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    expect(paragraphs.map(paragraphText).join(" ")).not.toContain("TOP_SECRET_HEADLINE");
  });

  it("renders Certifications as its own section heading, not an inline label", async () => {
    const aiObj = { summary: "S", skills: [], experience: [] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    const heading = paragraphs.find((p) => paragraphText(p) === "Certifications");
    expect(heading).toBeDefined();
    expect(paragraphRuns(heading)).toHaveLength(1);
  });

  it("sorts education newest first", async () => {
    const aiObj = { summary: "S", skills: [], experience: [] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    const texts = paragraphs.map(paragraphText);
    const newIndex = texts.findIndex((t) => t.includes("New U"));
    const oldIndex = texts.findIndex((t) => t.includes("Old U"));
    expect(newIndex).toBeGreaterThanOrEqual(0);
    expect(oldIndex).toBeGreaterThan(newIndex);
  });

  it("drops an AI-selected certification not present in config and falls back to the full list", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const aiObj = { summary: "S", skills: [], experience: [], certifications: ["Not Real Cert"] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    const certLine = paragraphs.map(paragraphText).find((t) => t.includes("Certified"));
    expect(certLine).toBe("AWS Certified, PMP");
    expect(certLine).not.toContain("Not Real Cert");
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Not Real Cert"));
  });

  it("prints only the AI-selected certification when it matches config, case-insensitively", async () => {
    const aiObj = { summary: "S", skills: [], experience: [], certifications: ["aws certified"] };
    const paragraphs = await buildVerbosePrebuiltParagraphArray(aiObj, infoObj);
    const certLine = paragraphs.map(paragraphText).find((t) => t.includes("Certified"));
    expect(certLine).toBe("AWS Certified");
  });
});

describe("verbose upload rendering", () => {
  it("renders scope as an italic paragraph after the job line", async () => {
    const paragraphs = await buildVerboseDefaultParagraphArray({
      name: "A",
      email: "a@example.com",
      summary: "S",
      skills: [],
      experience: [{ role: "Engineer", timeframe: "2020-2023", scope: "Owned the pipeline", bullets: ["b"] }],
      education: [],
    });
    const scopeParagraph = paragraphs.find((p) => paragraphText(p) === "Owned the pipeline");
    expect(scopeParagraph).toBeDefined();
    expect(paragraphRuns(scopeParagraph).some(runIsItalic)).toBe(true);
  });

  it("skips the scope line when scope is empty", async () => {
    const base = { name: "A", email: "a@example.com", summary: "S", skills: [], education: [] };
    const withScope = await buildVerboseDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", timeframe: "2020-2023", scope: "Text", bullets: ["b"] }],
    });
    const withoutScope = await buildVerboseDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", timeframe: "2020-2023", scope: "", bullets: ["b"] }],
    });
    expect(withoutScope).toHaveLength(withScope.length - 1);
  });

  it("matches the classic upload layout exactly when no scope is present", async () => {
    const aiObj = {
      name: "A",
      email: "a@example.com",
      summary: "S",
      skills: [{ category: "Tools", items: ["Git"] }],
      experience: [{ role: "Engineer", company: "Acme", timeframe: "2020-2023", bullets: ["Did things"] }],
      education: [{ school: "U", degree: "BA", timeframe: "2016-2020" }],
    };
    const classic = await buildDefaultParagraphArray(aiObj);
    const verbose = await buildVerboseDefaultParagraphArray(aiObj);
    expect(toPlain(verbose)).toEqual(toPlain(classic));
  });

  it("renders the company after the role in the job line, omitting it when absent", async () => {
    const base = { name: "A", email: "a@example.com", summary: "S", skills: [], education: [] };
    const withCompany = await buildVerboseDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", company: "Acme", timeframe: "2020-2023", bullets: ["b"] }],
    });
    const withoutCompany = await buildVerboseDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", company: "", timeframe: "2020-2023", bullets: ["b"] }],
    });
    expect(withCompany.map(paragraphText).some((t) => t.includes("- Engineer, Acme\t2020-2023"))).toBe(true);
    expect(withoutCompany.map(paragraphText).some((t) => t.includes("- Engineer\t2020-2023"))).toBe(true);
  });

  it("omits the company from the classic upload job line when absent", async () => {
    const base = { name: "A", email: "a@example.com", summary: "S", skills: [], education: [] };
    const withCompany = await buildDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", company: "Acme", timeframe: "2020-2023", bullets: ["b"] }],
    });
    const withoutCompany = await buildDefaultParagraphArray({
      ...base,
      experience: [{ role: "Engineer", company: "", timeframe: "2020-2023", bullets: ["b"] }],
    });
    expect(withCompany.map(paragraphText).some((t) => t === " - Engineer, Acme\t2020-2023")).toBe(true);
    expect(withoutCompany.map(paragraphText).some((t) => t === " - Engineer\t2020-2023")).toBe(true);
  });

  it("never renders headline text anywhere in the document", async () => {
    const aiObj = {
      name: "A",
      email: "a@example.com",
      summary: "S",
      skills: [],
      headline: "TOP_SECRET_HEADLINE",
      experience: [{ role: "Engineer", timeframe: "2020-2023", bullets: ["b"] }],
      education: [],
    };
    const paragraphs = await buildVerboseDefaultParagraphArray(aiObj);
    expect(paragraphs.map(paragraphText).join(" ")).not.toContain("TOP_SECRET_HEADLINE");
  });
});

describe("buildParagraphArray dispatch", () => {
  const infoObj = { jobArray: [{ jobId: 1, role: "Engineer", company: "Acme", timeframe: "2020-2023" }], education: [], certifications: [] };
  const prebuiltAI = { summary: "S", skills: [], experience: [{ jobId: 1, scope: "Scope text", bullets: ["b"] }] };
  const uploadAI = {
    name: "A",
    email: "a@example.com",
    summary: "S",
    skills: [],
    experience: [{ role: "Engineer", timeframe: "2020-2023", scope: "Scope text", bullets: ["b"] }],
    education: [],
  };

  it("routes prebuilt+verbose to the verbose prebuilt renderer", async () => {
    const paragraphs = await buildParagraphArray(prebuiltAI, infoObj, false, true);
    expect(paragraphs.some((p) => paragraphText(p) === "Scope text")).toBe(true);
  });

  it("routes prebuilt+classic to the classic prebuilt renderer, which ignores scope", async () => {
    const paragraphs = await buildParagraphArray(prebuiltAI, infoObj, false, false);
    expect(paragraphs.some((p) => paragraphText(p) === "Scope text")).toBe(false);
  });

  it("routes upload+verbose to the verbose default renderer", async () => {
    const paragraphs = await buildParagraphArray(uploadAI, null, false, true);
    expect(paragraphs.some((p) => paragraphText(p) === "Scope text")).toBe(true);
  });

  it("routes upload+classic to the classic default renderer, which ignores scope", async () => {
    const paragraphs = await buildParagraphArray(uploadAI, null, false, false);
    expect(paragraphs.some((p) => paragraphText(p) === "Scope text")).toBe(false);
  });
});
