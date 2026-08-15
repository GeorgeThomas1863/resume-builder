import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { Document, Packer, Paragraph } from "docx";
import fs from "fs/promises";
import path, { join } from "path";
import { tmpdir } from "os";
import {
  applyDocxMetadata,
  buildResumeFileName,
  resolveDefaultSaveDir,
  resolveEditingMinutes,
  resolveSaveDir,
  writeResumeFile,
} from "../src/save-resume.js";

const WORD_APP_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Template>Normal.dotm</Template><TotalTime>7</TotalTime><Application>Microsoft Office Word</Application></Properties>';

const tempFiles = [];
const tempDirs = [];

const buildGeneratedBuffer = () => Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph("x")] }] }));

const writeTemplate = async (name, appXml = null) => {
  const zip = await JSZip.loadAsync(await buildGeneratedBuffer());
  if (appXml) zip.file("docProps/app.xml", appXml);
  const filePath = join(tmpdir(), `resume-builder-save-test-${name}-${Date.now()}-${Math.random().toString(36).slice(2)}.docx`);
  await fs.writeFile(filePath, await zip.generateAsync({ type: "nodebuffer" }));
  tempFiles.push(filePath);
  return filePath;
};

const readAppXml = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("docProps/app.xml").async("string");
};

const readCoreXml = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("docProps/core.xml").async("string");
};

const readTotalTime = async (buffer) => (await readAppXml(buffer)).match(/<TotalTime>(\d*)<\/TotalTime>/)?.[1] ?? null;

const readCoreDates = (coreXml) => ({
  created: Date.parse(coreXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)?.[1] ?? ""),
  modified: Date.parse(coreXml.match(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/)?.[1] ?? ""),
});

// applyDocxMetadata derives its jitter offset from `Math.floor(Math.random() * 20) + 10` (10..29
// minutes). Pin Math.random to the midpoint of the bucket for a given target offset so tests that
// care about the exact offset/gap are deterministic instead of depending on the live random draw.
const mockOffsetMinutes = (minutes) => {
  const bucket = minutes - 10;
  vi.spyOn(Math, "random").mockReturnValue((bucket + 0.5) / 20);
};

afterAll(async () => {
  for (const filePath of tempFiles) await fs.unlink(filePath).catch(() => {});
  for (const dirPath of tempDirs) await fs.rm(dirPath, { recursive: true, force: true }).catch(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("applyDocxMetadata", () => {
  it("rewrites created/modified with second precision and no milliseconds", async () => {
    const stamped = await applyDocxMetadata(await buildGeneratedBuffer(), { templatePath: null, editingMinutes: null });
    const coreXml = await readCoreXml(stamped);
    expect(coreXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)?.[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(coreXml.match(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/)?.[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("puts created 10-29 minutes before modified", async () => {
    const stamped = await applyDocxMetadata(await buildGeneratedBuffer(), { templatePath: null, editingMinutes: null });
    const { created, modified } = readCoreDates(await readCoreXml(stamped));
    const gapMinutes = Math.round((modified - created) / 60000);
    expect(gapMinutes).toBeGreaterThanOrEqual(10);
    expect(gapMinutes).toBeLessThanOrEqual(29);
  });

  it("sets auto TotalTime equal to the created-to-modified gap", async () => {
    const buffer = await buildGeneratedBuffer();
    mockOffsetMinutes(17);
    const stamped = await applyDocxMetadata(buffer, { templatePath: null, editingMinutes: null });
    const { created, modified } = readCoreDates(await readCoreXml(stamped));
    expect(Math.floor((modified - created) / 60000)).toBe(17);
    await expect(readTotalTime(stamped)).resolves.toBe("17");
  });

  it("respects an override TotalTime when it is at or below the gap", async () => {
    const buffer = await buildGeneratedBuffer();
    mockOffsetMinutes(10); // minimum possible gap
    const stamped = await applyDocxMetadata(buffer, { templatePath: null, editingMinutes: 5 });
    await expect(readTotalTime(stamped)).resolves.toBe("5");
  });

  it("clamps an override TotalTime above the gap", async () => {
    const buffer = await buildGeneratedBuffer();
    mockOffsetMinutes(29); // maximum possible gap
    const stamped = await applyDocxMetadata(buffer, { templatePath: null, editingMinutes: 999999 });
    const { created, modified } = readCoreDates(await readCoreXml(stamped));
    expect(Math.floor((modified - created) / 60000)).toBe(29);
    await expect(readTotalTime(stamped)).resolves.toBe("29");
  });

  it("copies template core/app xml when a templatePath is given", async () => {
    const templatePath = await writeTemplate("word", WORD_APP_XML);
    const stamped = await applyDocxMetadata(await buildGeneratedBuffer(), { templatePath, editingMinutes: 5 });
    expect(await readAppXml(stamped)).toContain("Microsoft Office Word");
    await expect(readTotalTime(stamped)).resolves.toBe("5");
  });

  it("works with no templatePath", async () => {
    const stamped = await applyDocxMetadata(await buildGeneratedBuffer(), { templatePath: null, editingMinutes: 5 });
    await expect(readTotalTime(stamped)).resolves.toBe("5");
  });

  it("still stamps dates on the generated buffer when the template is unreadable", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const stamped = await applyDocxMetadata(await buildGeneratedBuffer(), {
      templatePath: join(tmpdir(), "resume-builder-save-test-does-not-exist.docx"),
      editingMinutes: 5,
    });
    await expect(readTotalTime(stamped)).resolves.toBe("5");
    const coreXml = await readCoreXml(stamped);
    expect(coreXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)?.[1]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  it("inserts TotalTime when app.xml lacks the tag", async () => {
    const templatePath = await writeTemplate("bare");
    const buffer = await buildGeneratedBuffer();
    mockOffsetMinutes(20); // gap of 20 min — comfortably above the 12-minute override below
    const stamped = await applyDocxMetadata(buffer, { templatePath, editingMinutes: 12 });
    await expect(readTotalTime(stamped)).resolves.toBe("12");
  });

  it("returns a non-zip buffer unchanged", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const notAZip = Buffer.from("not a zip");
    const result = await applyDocxMetadata(notAZip, { templatePath: null, editingMinutes: 5 });
    expect(result).toBe(notAZip);
  });
});

describe("buildResumeFileName", () => {
  const suffix = () => {
    const now = new Date();
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${MONTHS[now.getMonth()]}${now.getFullYear()}`;
  };

  it("builds the expected pattern", () => {
    expect(buildResumeFileName("Acme Corp", "Senior Software Engineer II", "Smith")).toBe(
      `Acme_Corp_Senior_Software_Engineer_Resume_Smith_${suffix()}.docx`
    );
  });

  it("falls back to Company/Role/User when values are blank", () => {
    expect(buildResumeFileName("", "", "")).toBe(`Company_Role_Resume_User_${suffix()}.docx`);
  });

  it("falls back to Company/Role/User when values are missing", () => {
    expect(buildResumeFileName(undefined, undefined, undefined)).toBe(`Company_Role_Resume_User_${suffix()}.docx`);
  });

  it("sanitizes disallowed characters and collapses underscores", () => {
    expect(buildResumeFileName("Acme & Sons!!", "VP,   Sales", "O'Brien")).toBe(
      `Acme_Sons_VP_Sales_Resume_O_Brien_${suffix()}.docx`
    );
  });

  it("keeps only the first three words of the title", () => {
    const result = buildResumeFileName("Acme", "Senior Staff Backend Software Engineer", "Doe");
    expect(result).toBe(`Acme_Senior_Staff_Backend_Resume_Doe_${suffix()}.docx`);
  });

  it("falls back to Company/Role/User when values are non-strings", () => {
    expect(buildResumeFileName(42, { a: 1 }, ["x"])).toBe(`Company_Role_Resume_User_${suffix()}.docx`);
  });
});

describe("resolveSaveDir / resolveDefaultSaveDir", () => {
  const originalEnv = process.env.RESUME_SAVE_DIR;

  afterEach(() => {
    if (originalEnv === undefined) delete process.env.RESUME_SAVE_DIR;
    else process.env.RESUME_SAVE_DIR = originalEnv;
  });

  it("resolves a blank saveDir to the default", () => {
    delete process.env.RESUME_SAVE_DIR;
    expect(resolveSaveDir("")).toBe(resolveDefaultSaveDir());
    expect(resolveSaveDir("   ")).toBe(resolveDefaultSaveDir());
  });

  it("resolves a provided saveDir to an absolute path", () => {
    expect(resolveSaveDir("some/relative/dir")).toBe(path.resolve("some/relative/dir"));
  });

  it("prefers RESUME_SAVE_DIR over the project default when saveDir is blank", () => {
    const envDir = join(tmpdir(), "resume-save-dir-env-test");
    process.env.RESUME_SAVE_DIR = envDir;
    expect(resolveDefaultSaveDir()).toBe(path.resolve(envDir));
    expect(resolveSaveDir(undefined)).toBe(path.resolve(envDir));
  });
});

describe("writeResumeFile", () => {
  it("writes name.docx, then name_1.docx when it already exists", async () => {
    const dir = join(tmpdir(), `resume-builder-write-test-${Date.now()}`);
    await fs.mkdir(dir, { recursive: true });
    tempDirs.push(dir);

    const first = await writeResumeFile(dir, "name.docx", Buffer.from("a"));
    expect(first).toEqual({ fileName: "name.docx", filePath: join(dir, "name.docx") });

    const second = await writeResumeFile(dir, "name.docx", Buffer.from("b"));
    expect(second).toEqual({ fileName: "name_1.docx", filePath: join(dir, "name_1.docx") });
  });

  it("advances to the next suffix on a lock error", async () => {
    const dir = join(tmpdir(), `resume-builder-write-lock-test-${Date.now()}`);
    await fs.mkdir(dir, { recursive: true });
    tempDirs.push(dir);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const originalWriteFile = fs.writeFile.bind(fs);
    let callCount = 0;
    vi.spyOn(fs, "writeFile").mockImplementation(async (target, buffer, options) => {
      callCount++;
      if (callCount === 1) throw Object.assign(new Error("busy"), { code: "EBUSY" });
      return originalWriteFile(target, buffer, options);
    });

    const result = await writeResumeFile(dir, "locked.docx", Buffer.from("a"));
    expect(result.fileName).toBe("locked_1.docx");
  });

  it("rethrows non-lock errors", async () => {
    const dir = join(tmpdir(), `resume-builder-write-throw-test-${Date.now()}`);
    await fs.mkdir(dir, { recursive: true });
    tempDirs.push(dir);

    vi.spyOn(fs, "writeFile").mockRejectedValueOnce(Object.assign(new Error("nope"), { code: "ENOSPC" }));
    await expect(writeResumeFile(dir, "fail.docx", Buffer.from("a"))).rejects.toThrow("nope");
  });

  it("creates a missing save directory", async () => {
    const parentDir = join(tmpdir(), `resume-builder-write-mkdir-test-${Date.now()}`);
    const dir = join(parentDir, "nested");
    tempDirs.push(parentDir);

    const result = await writeResumeFile(dir, "new.docx", Buffer.from("a"));
    expect(result.filePath).toBe(join(dir, "new.docx"));
    await expect(fs.readFile(result.filePath, "utf-8")).resolves.toBe("a");
  });
});

describe("resolveEditingMinutes", () => {
  it("treats undefined as auto", () => {
    expect(resolveEditingMinutes(undefined)).toEqual({ success: true, value: null });
  });

  it("treats an empty string as auto", () => {
    expect(resolveEditingMinutes("")).toEqual({ success: true, value: null });
  });

  it("treats 'auto' case-insensitively as auto", () => {
    expect(resolveEditingMinutes("AUTO")).toEqual({ success: true, value: null });
    expect(resolveEditingMinutes(" auto ")).toEqual({ success: true, value: null });
  });

  it("accepts a non-negative integer string as an override", () => {
    expect(resolveEditingMinutes("45")).toEqual({ success: true, value: 45 });
    expect(resolveEditingMinutes("0")).toEqual({ success: true, value: 0 });
  });

  it("rejects a negative number", () => {
    expect(resolveEditingMinutes("-1").success).toBe(false);
  });

  it("rejects a non-numeric string", () => {
    expect(resolveEditingMinutes("banana").success).toBe(false);
  });

  it("rejects an integer beyond the safe range", () => {
    expect(resolveEditingMinutes("1000000000000000000000").success).toBe(false); // 22 digits
    expect(resolveEditingMinutes("9".repeat(309)).success).toBe(false);
    expect(resolveEditingMinutes("9007199254740991")).toEqual({ success: true, value: 9007199254740991 });
  });
});
