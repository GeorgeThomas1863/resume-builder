import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import JSZip from "jszip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_SAVE_DIR = path.resolve(__dirname, "../resumes");

const LOCK_CODES = ["EEXIST", "EBUSY", "EPERM", "EACCES"];
const MAX_WRITE_ATTEMPTS = 20;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//++++++++++++++++++++++++++++++
// DOCX metadata

export const applyDocxMetadata = async (generatedBuffer, { templatePath = null, editingMinutes = null } = {}) => {
  try {
    const zip = await JSZip.loadAsync(generatedBuffer);

    await copyTemplateMetadata(zip, templatePath);

    const offsetMinutes = Math.floor(Math.random() * 20) + 10; // 10..29 minutes
    const now = new Date();
    const created = new Date(now.getTime() - offsetMinutes * 60000);
    await stampCoreDates(zip, created, now);

    const totalTime = typeof editingMinutes === "number" ? editingMinutes : offsetMinutes;
    await stampTotalTime(zip, totalTime);
    await clampTotalTime(zip);

    return await zip.generateAsync({ type: "nodebuffer" });
  } catch (e) {
    console.error("Failed to apply DOCX metadata, returning generated buffer as-is:", e.message);
    return generatedBuffer;
  }
};

// copies docProps/core.xml and docProps/app.xml from a template docx into the generated zip;
// an unreadable/missing template just gets skipped so the generated zip's own metadata is stamped instead
const copyTemplateMetadata = async (generatedZip, templatePath) => {
  if (!templatePath) return;
  try {
    const templateBuf = await fs.readFile(templatePath);
    const templateZip = await JSZip.loadAsync(templateBuf);
    for (const metaFile of ["docProps/core.xml", "docProps/app.xml"]) {
      const file = templateZip.file(metaFile);
      if (!file) continue;
      const content = await file.async("nodebuffer");
      generatedZip.file(metaFile, content);
    }
  } catch (e) {
    console.warn(`[save-resume] could not read metadata template, skipping copy: ${templatePath} (${e.message})`);
  }
};

const stampCoreDates = async (zip, created, modified) => {
  const file = zip.file("docProps/core.xml");
  if (!file) return;
  let xml = await file.async("string");
  xml = xml.replace(/(<dcterms:created[^>]*>)[^<]*(<\/dcterms:created>)/, `$1${formatIsoNoMillis(created)}$2`);
  xml = xml.replace(/(<dcterms:modified[^>]*>)[^<]*(<\/dcterms:modified>)/, `$1${formatIsoNoMillis(modified)}$2`);
  zip.file("docProps/core.xml", xml);
};

const formatIsoNoMillis = (date) => date.toISOString().replace(/\.\d{3}Z$/, "Z");

const stampTotalTime = async (zip, editingMinutes) => {
  const file = zip.file("docProps/app.xml");
  if (!file) return;
  const xml = await file.async("string");
  zip.file("docProps/app.xml", insertTotalTime(xml, editingMinutes));
};

// templates that lost their <TotalTime> tag (e.g. after a failed merge wrote raw docx-lib output) must still get one
const insertTotalTime = (appXml, editingMinutes) => {
  const tag = `<TotalTime>${editingMinutes}</TotalTime>`;
  if (/<TotalTime>\d*<\/TotalTime>/.test(appXml)) return appXml.replace(/<TotalTime>\d*<\/TotalTime>/, tag);
  if (/<Properties[^>]*\/>/.test(appXml)) return appXml.replace(/<Properties([^>]*?)\s*\/>/, `<Properties$1>${tag}</Properties>`);
  return appXml.replace(/(<Properties[^>]*>)/, `$1${tag}`);
};

// a real document can't accumulate more editing time than the window it existed in — clamp
// TotalTime against whatever created/modified dates actually survived the stamping above
const clampTotalTime = async (zip) => {
  const appFile = zip.file("docProps/app.xml");
  if (!appFile) return;
  let appXml = await appFile.async("string");
  const totalTime = Number(appXml.match(/<TotalTime>(\d+)<\/TotalTime>/)?.[1]);
  if (Number.isNaN(totalTime)) return;

  const gapMinutes = await readMetadataGapMinutes(zip);
  if (totalTime <= gapMinutes) return;

  appXml = appXml.replace(/(<TotalTime>)\d+(<\/TotalTime>)/, `$1${gapMinutes}$2`);
  zip.file("docProps/app.xml", appXml);
};

// whole minutes between created and modified in the final core.xml — 0 when the dates
// are missing or unparseable (the conservative floor for TotalTime)
const readMetadataGapMinutes = async (zip) => {
  const coreFile = zip.file("docProps/core.xml");
  if (!coreFile) return 0;
  const coreXml = await coreFile.async("string");
  const created = Date.parse(coreXml.match(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/)?.[1] ?? "");
  const modified = Date.parse(coreXml.match(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/)?.[1] ?? "");
  if (Number.isNaN(created) || Number.isNaN(modified)) return 0;
  return Math.max(0, Math.floor((modified - created) / 60000));
};

//++++++++++++++++++++++++++++++
// filename + save directory

export const buildResumeFileName = (company, title, lastName) => {
  const mm = MONTHS[new Date().getMonth()];
  const yyyy = new Date().getFullYear();
  const safeCompany = sanitizeFileNamePart(company) || "Company";
  const safeTitle = typeof title === "string" ? title : "";
  const titleSlug = sanitizeFileNamePart(safeTitle.trim().split(/\s+/).slice(0, 3).join("_")) || "Role";
  const safeLastName = sanitizeFileNamePart(lastName) || "User";
  return `${safeCompany}_${titleSlug}_Resume_${safeLastName}_${mm}${yyyy}.docx`;
};

const sanitizeFileNamePart = (value) =>
  (typeof value === "string" ? value : "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

export const resolveSaveDir = (saveDir) => {
  const trimmed = typeof saveDir === "string" ? saveDir.trim() : "";
  if (trimmed) return path.resolve(trimmed);
  return resolveDefaultSaveDir();
};

export const resolveDefaultSaveDir = () => {
  const envDir = process.env.RESUME_SAVE_DIR?.trim();
  if (envDir) return path.resolve(envDir);
  return DEFAULT_SAVE_DIR;
};

//++++++++++++++++++++++++++++++
// lock-safe write

export const writeResumeFile = async (dirPath, fileName, buffer) => {
  const ext = path.extname(fileName);
  const base = fileName.slice(0, fileName.length - ext.length);

  await fs.mkdir(dirPath, { recursive: true });

  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    const candidateName = attempt === 0 ? fileName : `${base}_${attempt}${ext}`;
    const target = path.join(dirPath, candidateName);
    try {
      await fs.writeFile(target, buffer, { flag: "wx" });
      return { fileName: candidateName, filePath: target };
    } catch (e) {
      if (!LOCK_CODES.includes(e.code)) throw e;
      console.warn(`[save-resume] could not write ${candidateName} (${e.code}) — trying next name`);
    }
  }
  throw new Error(`Could not write resume — file locked or occupied after ${MAX_WRITE_ATTEMPTS} attempts: ${fileName}`);
};

//++++++++++++++++++++++++++++++
// editing time input

export const resolveEditingMinutes = (raw) => {
  if (raw === undefined || raw === null) return { success: true, value: null };
  const trimmed = String(raw).trim();
  if (trimmed === "" || trimmed.toLowerCase() === "auto") return { success: true, value: null };
  if (!/^\d+$/.test(trimmed)) return { success: false, message: "editingMinutes must be \"auto\" or a non-negative integer" };
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) return { success: false, message: "editingMinutes is too large" };
  return { success: true, value };
};
