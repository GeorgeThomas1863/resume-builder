// import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile, clearUploadDirectory, saveResumeCopy } from "../src/upload-file.js";
import { runResumeUnfucker } from "../src/src.js";
import fs from "fs/promises";
import JSZip from "jszip";

// export const getBackendValueController = async (req, res) => {
//   const { key } = req.body;
//   if (!key) return null;

//   const value = CONFIG[key];

//   return res.json(value);
// };

//-------------------------

export const uploadResumeController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const clearFilesData = await runClearFiles(req.file, req.session.id);
    if (!clearFilesData.success) return res.status(500).json({ error: clearFilesData.message });

    const data = {
      message: "File uploaded successfully",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    };

    return res.json(data);
  } catch (e) {
    console.error("Error uploading file:", e);
    return res.status(500).json({ error: "Server error uploading file" });
  }
};

export const deleteResumeController = async (req, res) => {
  try {
    const data = await clearUploadDirectory(req.session.id);
    // console.log("CLEAR UPLOAD DIRECTORY DATA");
    // console.log("DATA");
    // console.log(data);

    if (!data || !data.success) {
      return res.status(500).json({ success: false, message: data.message });
    }

    return res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (e) {
    console.error("Error deleting resume:", e);
    return res.status(500).json({ success: false, message: "Server error deleting resume" });
  }
};

export const checkRouteController = async (req, res) => {
  const data = await runCheckFile(req.session.id);
  if (!data) return res.json({ success: false, message: "Something crashed, no clue why" });
  return res.json({ success: data.success, message: data.message, filename: data.filename });
};

export async function mergeDocxMetadata(templatePath, generatedBuffer, editingMinutes) {
  try {
    const templateBuf = await fs.readFile(templatePath);
    const [templateZip, generatedZip] = await Promise.all([
      JSZip.loadAsync(templateBuf),
      JSZip.loadAsync(generatedBuffer),
    ]);
    for (const metaFile of ["docProps/core.xml", "docProps/app.xml"]) {
      const file = templateZip.file(metaFile);
      if (!file) continue;
      if (metaFile === "docProps/app.xml" && editingMinutes !== null) {
        const appXml = setTotalTime(await file.async("string"), editingMinutes);
        generatedZip.file(metaFile, appXml);
      } else {
        const content = await file.async("nodebuffer");
        generatedZip.file(metaFile, content);
      }
    }
    return generatedZip.generateAsync({ type: "nodebuffer" });
  } catch (e) {
    console.error("Failed to merge DOCX metadata, writing generated buffer as-is:", e);
    return generatedBuffer;
  }
}

// templates that lost their <TotalTime> tag (e.g. after a failed merge wrote raw docx-lib output) must still get one
const setTotalTime = (appXml, editingMinutes) => {
  const tag = `<TotalTime>${editingMinutes}</TotalTime>`;
  if (/<TotalTime>\d*<\/TotalTime>/.test(appXml)) return appXml.replace(/<TotalTime>\d*<\/TotalTime>/, tag);
  if (/<Properties[^>]*\/>/.test(appXml)) return appXml.replace(/<Properties([^>]*?)\s*\/>/, `<Properties$1>${tag}</Properties>`);
  return appXml.replace(/(<Properties[^>]*>)/, `$1${tag}`);
};

export async function applyEditingTime(generatedBuffer, editingMinutes) {
  try {
    const zip = await JSZip.loadAsync(generatedBuffer);
    const file = zip.file("docProps/app.xml");
    if (!file) return generatedBuffer;
    zip.file("docProps/app.xml", setTotalTime(await file.async("string"), editingMinutes));
    return await zip.generateAsync({ type: "nodebuffer" });
  } catch (e) {
    console.error("Failed to set editing time, sending generated buffer as-is:", e);
    return generatedBuffer;
  }
}

// archiving is best-effort — the user still gets their resume if the copy can't be written
const archiveResume = async (buffer, companyName) => {
  const saveResult = await saveResumeCopy(buffer, companyName);
  if (saveResult.success) console.log(`Saved resume copy: ${saveResult.filePath}`);
  else if (!saveResult.skipped) console.error(`Resume copy not saved: ${saveResult.message}`);
  return saveResult.success ? saveResult.filePath : null;
};

export const submitRouteController = async (req, res) => {
  const {
    useSpecialInfo,
    pi,
    inputPath: _ignored,
    aiType,
    modelType,
    screenerAiType: bodyScreenerAiType,
    screenerModelType: bodyScreenerModelType,
    serviceTier,
    maxTokens,
    temperature,
    jobInput,
    injectDoc,
    injectDocPath,
    editingMinutes,
  } = req.body;

  const isAdmin = !!req.session.isAdmin;
  const safeUseSpecialInfo = isAdmin && !!useSpecialInfo;
  const safePi = isAdmin && !!pi;

  if (!jobInput || !String(jobInput).trim()) {
    return res.status(400).json({ error: "jobInput is required" });
  }
  if (!modelType || !String(modelType).trim()) {
    return res.status(400).json({ error: "modelType is required" });
  }
  const screenerAiType = String(bodyScreenerAiType || aiType).trim();
  const screenerModelType = String(bodyScreenerModelType || modelType).trim();
  if (!screenerModelType) return res.status(400).json({ error: "screenerModelType is required" });

  let parsedEditingMinutes = null;
  if (editingMinutes !== undefined && String(editingMinutes).trim() !== "") {
    parsedEditingMinutes = parseInt(editingMinutes, 10);
    if (!Number.isInteger(parsedEditingMinutes) || parsedEditingMinutes < 0) {
      return res.status(400).json({ error: "editingMinutes must be a non-negative integer" });
    }
  }

  const temp = +temperature;
  if (!Number.isFinite(temp) || temp < 0) {
    return res.status(400).json({ error: "temperature must be a non-negative number" });
  }
  const tokens = +maxTokens;
  if (!Number.isInteger(tokens) || tokens < 1) {
    return res.status(400).json({ error: "maxTokens must be a positive integer" });
  }

  if (injectDoc) {
    const cleanPath = typeof injectDocPath === "string" ? injectDocPath.trim() : "";
    if (!cleanPath || cleanPath.includes("\0") || !cleanPath.toLowerCase().endsWith(".docx")) {
      return res.status(400).json({ error: "injectDocPath must be a valid .docx file path" });
    }
    try {
      await fs.access(cleanPath);
    } catch {
      return res.status(400).json({ error: `File not found: ${cleanPath}` });
    }
  }

  const fileCheck = await runCheckFile(req.session.id);
  const inputPath = fileCheck?.success ? fileCheck.filePath : null;

  if (!safeUseSpecialInfo && !inputPath) {
    return res.status(400).json({ error: "No resume found for this session" });
  }

  const inputParams = {
    aiType,
    modelType,
    screenerAiType,
    screenerModelType,
    serviceTier,
    temperature: temp,
    maxTokens: tokens,
    jobInput,
    inputPath,
    useSpecialInfo: safeUseSpecialInfo,
    pi: safePi,
  };

  const result = await runResumeUnfucker(inputParams);
  const { buffer, companyName } = result || {};
  if (!buffer) {
    return res.status(500).json({ error: "Failed to generate resume" });
  }

  if (injectDoc) {
    let mergedBuffer;
    try {
      mergedBuffer = await mergeDocxMetadata(injectDocPath.trim(), buffer, parsedEditingMinutes);
      await fs.writeFile(injectDocPath.trim(), mergedBuffer);
    } catch (e) {
      console.error("Error writing inject doc:", e);
      return res.status(500).json({ error: "Failed to write to the specified file" });
    }
    const injectSavedPath = await archiveResume(mergedBuffer, companyName);
    return res.json({ success: true, savedPath: injectSavedPath });
  }

  const downloadBuffer = parsedEditingMinutes !== null ? await applyEditingTime(buffer, parsedEditingMinutes) : buffer;
  const savedPath = await archiveResume(downloadBuffer, companyName);
  if (savedPath) res.setHeader("X-Saved-Resume-Path", encodeURIComponent(savedPath));
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", 'attachment; filename="new-resume.docx"');
  return res.send(downloadBuffer);
};

export const defaultInjectPathController = async (req, res) => {
  return res.json({ path: process.env.INJECT_DOC_DEFAULT_PATH || "" });
};
