import CONFIG from "../config/config.js";
import { runResumeUnfucker } from "../src/src.js";

export const uploadResumeController = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const data = {
    message: "File uploaded successfully",
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
  };

  res.json(data);
};

export const getBackendValueController = async (req, res) => {
  const { key } = req.body;
  if (!key) return null;

  const value = CONFIG[key];

  return res.json(value);
};

//------------------------

export const submitRouteController = async (req, res) => {
  const inputParams = req.body;
  console.log("INPUT PARAMS");
  console.log(inputParams);

  const data = await runResumeUnfucker(inputParams);
  if (!data) return res.json({ success: false, message: "Something crashed, no clue why" });

  return res.json(data);
};
