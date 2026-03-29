// import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile, clearUploadDirectory } from "../src/upload-file.js";
import { runResumeUnfucker } from "../src/src.js";

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
    nukeOhio,
    pi,
    inputPath: _ignored,
    aiType,
    modelType,
    serviceTier,
    maxTokens,
    temperature,
    jobInput,
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

  const temp = +temperature;
  if (!Number.isFinite(temp) || temp < 0) {
    return res.status(400).json({ error: "temperature must be a non-negative number" });
  }
  const tokens = +maxTokens;
  if (!Number.isInteger(tokens) || tokens < 1) {
    return res.status(400).json({ error: "maxTokens must be a positive integer" });
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

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", 'attachment; filename="new-resume.docx"');
  return res.send(buffer);
};
