// import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile, clearUploadDirectory } from "../src/upload-file.js";
import { runResumeUnfucker } from "../src/src.js";
import {
  applyDocxMetadata,
  buildResumeFileName,
  resolveDefaultSaveDir,
  resolveEditingMinutes,
  resolveSaveDir,
  writeResumeFile,
} from "../src/save-resume.js";

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
    saveDir,
    editingMinutes,
    verbose,
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

  const editingMinutesResult = resolveEditingMinutes(editingMinutes);
  if (!editingMinutesResult.success) return res.status(400).json({ error: editingMinutesResult.message });

  const temp = +temperature;
  if (!Number.isFinite(temp) || temp < 0) {
    return res.status(400).json({ error: "temperature must be a non-negative number" });
  }
  const tokens = +maxTokens;
  if (!Number.isInteger(tokens) || tokens < 1) {
    return res.status(400).json({ error: "maxTokens must be a positive integer" });
  }

  const rawSaveDir = typeof saveDir === "string" ? saveDir : "";
  if (rawSaveDir.includes("\0")) {
    return res.status(400).json({ error: "saveDir must not contain a null byte" });
  }
  const targetDir = resolveSaveDir(rawSaveDir);

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
    verbose: !!verbose,
  };

  const result = await runResumeUnfucker(inputParams);
  if (!result) {
    return res.status(500).json({ error: "Failed to generate resume" });
  }

  const { buffer, targetCompany, targetTitle, lastName } = result;
  const templatePath = process.env.INJECT_DOC_DEFAULT_PATH?.trim() || null;
  const stampedBuffer = await applyDocxMetadata(buffer, { templatePath, editingMinutes: editingMinutesResult.value });
  const fileName = buildResumeFileName(targetCompany, targetTitle, lastName);

  try {
    const written = await writeResumeFile(targetDir, fileName, stampedBuffer);
    return res.json({ success: true, fileName: written.fileName, filePath: written.filePath });
  } catch (e) {
    console.error("Error saving resume file:", e);
    return res.status(500).json({ error: "Failed to save resume file" });
  }
};

export const defaultSaveDirController = async (req, res) => {
  return res.json({ path: resolveDefaultSaveDir() });
};
