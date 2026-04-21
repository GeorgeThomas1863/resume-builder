// import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile, clearUploadDirectory } from "../src/upload-file.js";
import { runResumeUnfucker } from "../src/src.js";
import fs from "fs/promises";
import { checkDocHasContent } from "../src/resume.js";
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

async function mergeDocxMetadata(templatePath, generatedBuffer, editingMinutes) {
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
        let appXml = await file.async("string");
        appXml = appXml.replace(/<TotalTime>\d*<\/TotalTime>/, `<TotalTime>${editingMinutes}</TotalTime>`);
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

export const submitRouteController = async (req, res) => {
  const {
    nukeOhio,
    pi,
    inputPath: _ignored,
    aiType,
    modelType,
    serviceTier,
    maxTokens,
    temperature,
    jobInput,
    injectDoc,
    injectDocPath,
    overwriteConfirmed,
    editingMinutes,
  } = req.body;

  const isAdmin = !!req.session.isAdmin;
  const safeNukeOhio = isAdmin && !!nukeOhio;
  const safePi = isAdmin && !!pi;

  if (!jobInput || !String(jobInput).trim()) {
    return res.status(400).json({ error: "jobInput is required" });
  }
  if (!modelType || !String(modelType).trim()) {
    return res.status(400).json({ error: "modelType is required" });
  }

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
    let hasContent = true;
    try {
      hasContent = await checkDocHasContent(cleanPath);
    } catch { /* treat unreadable file as having content */ }
    if (hasContent && !overwriteConfirmed) {
      return res.json({ requiresConfirmation: true });
    }
  }

  const fileCheck = await runCheckFile(req.session.id);
  const inputPath = fileCheck?.success ? fileCheck.filePath : null;

  if (!safeNukeOhio && !inputPath) {
    return res.status(400).json({ error: "No resume found for this session" });
  }

  const inputParams = {
    aiType,
    modelType,
    serviceTier,
    temperature: temp,
    maxTokens: tokens,
    jobInput,
    inputPath,
    nukeOhio: safeNukeOhio,
    pi: safePi,
  };

  const buffer = await runResumeUnfucker(inputParams);
  if (!buffer) {
    return res.status(500).json({ error: "Failed to generate resume" });
  }

  if (injectDoc) {
    try {
      const mergedBuffer = await mergeDocxMetadata(injectDocPath.trim(), buffer, parsedEditingMinutes);
      await fs.writeFile(injectDocPath.trim(), mergedBuffer);
    } catch (e) {
      console.error("Error writing inject doc:", e);
      return res.status(500).json({ error: "Failed to write to the specified file" });
    }
    return res.json({ success: true });
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", 'attachment; filename="new-resume.docx"');
  return res.send(buffer);
};

export const defaultInjectPathController = async (req, res) => {
  return res.json({ path: process.env.INJECT_DOC_DEFAULT_PATH || "" });
};
