import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile, clearUploadDirectory } from "../src/upload-file.js";
import { runResumeUnfucker } from "../src/src.js";

export const getBackendValueController = async (req, res) => {
  const { key } = req.body;
  if (!key) return null;

  const value = CONFIG[key];

  return res.json(value);
};

//-------------------------

export const uploadResumeController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const clearFilesData = await runClearFiles(req.file, req.session.id);
  if (!clearFilesData.success) return res.status(500).json({ error: clearFilesData.message });

  const data = {
    message: "File uploaded successfully",
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
  };

  return res.json(data);
};

export const deleteResumeController = async (req, res) => {
  try {
    const data = await clearUploadDirectory(req.session.id);
    console.log("CLEAR UPLOAD DIRECTORY DATA");
    console.log("DATA");
    console.log(data);

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
  return res.json(data);
};

export const submitRouteController = async (req, res) => {
  const inputParams = req.body;
  // console.log("INPUT PARAMS");
  // console.log(inputParams);

  const buffer = await runResumeUnfucker(inputParams);

  console.log("DATA");
  console.log(buffer.length);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", 'attachment; filename="new-resume.docx"');
  return res.send(buffer);
};
