import { afterAll, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { Document, Packer, Paragraph } from "docx";
import fs from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { applyEditingTime, mergeDocxMetadata } from "../controllers/data-control.js";

const WORD_APP_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
  '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Template>Normal.dotm</Template><TotalTime>7</TotalTime><Application>Microsoft Office Word</Application></Properties>';

const tempFiles = [];

const buildGeneratedBuffer = () =>
  Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph("x")] }] }));

const writeTemplate = async (name, appXml = null) => {
  const zip = await JSZip.loadAsync(await buildGeneratedBuffer());
  if (appXml) zip.file("docProps/app.xml", appXml);
  const filePath = join(tmpdir(), `resume-builder-test-${name}-${Date.now()}.docx`);
  await fs.writeFile(filePath, await zip.generateAsync({ type: "nodebuffer" }));
  tempFiles.push(filePath);
  return filePath;
};

const readTotalTime = async (buffer) => {
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file("docProps/app.xml").async("string");
  return xml.match(/<TotalTime>(\d*)<\/TotalTime>/)?.[1] ?? null;
};

afterAll(async () => {
  for (const filePath of tempFiles) await fs.unlink(filePath).catch(() => {});
});

describe("mergeDocxMetadata editing time", () => {
  it("replaces an existing TotalTime with the requested minutes", async () => {
    const templatePath = await writeTemplate("word", WORD_APP_XML);
    const merged = await mergeDocxMetadata(templatePath, await buildGeneratedBuffer(), 45);
    await expect(readTotalTime(merged)).resolves.toBe("45");
  });

  it("inserts TotalTime when the template app.xml lacks the tag", async () => {
    const templatePath = await writeTemplate("bare");
    const merged = await mergeDocxMetadata(templatePath, await buildGeneratedBuffer(), 45);
    await expect(readTotalTime(merged)).resolves.toBe("45");
  });

  it("copies template metadata verbatim when minutes are null", async () => {
    const templatePath = await writeTemplate("word-null", WORD_APP_XML);
    const merged = await mergeDocxMetadata(templatePath, await buildGeneratedBuffer(), null);
    await expect(readTotalTime(merged)).resolves.toBe("7");
  });

  it("returns the generated buffer unchanged when the template is unreadable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const generated = await buildGeneratedBuffer();
    const merged = await mergeDocxMetadata(join(tmpdir(), "does-not-exist.docx"), generated, 45);
    expect(merged).toBe(generated);
  });
});

describe("applyEditingTime for download mode", () => {
  it("stamps TotalTime directly onto a generated buffer", async () => {
    const stamped = await applyEditingTime(await buildGeneratedBuffer(), 45);
    await expect(readTotalTime(stamped)).resolves.toBe("45");
  });

  it("returns the buffer unchanged on unreadable input", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const notAZip = Buffer.from("not a zip");
    expect(await applyEditingTime(notAZip, 45)).toBe(notAZip);
  });
});
