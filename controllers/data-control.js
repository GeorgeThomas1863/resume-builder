import CONFIG from "../config/config.js";

import { runClearFiles, runCheckFile } from "../src/util/file-back.js";
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

  const clearFilesData = await runClearFiles(req.file);
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

export const checkRouteController = async (req, res) => {
  const data = await runCheckFile();
  if (!data) return res.json({ success: false, message: "Something crashed, no clue why" });
  return res.json(data);
};

export const submitRouteController = async (req, res) => {
  const inputParams = req.body;
  console.log("INPUT PARAMS");
  console.log(inputParams);

  const buffer = await runResumeUnfucker(inputParams);

  console.log("DATA");
  console.log(buffer.length);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.setHeader("Content-Disposition", 'attachment; filename="new-resume.docx"');
  return res.send(buffer);
};
