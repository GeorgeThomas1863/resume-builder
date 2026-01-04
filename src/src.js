import fsPromises from "fs/promises";
import path from "path";

import { extractResumeText, buildNewResume } from "./resume.js";
import { runCustomAI, runDefaultAI } from "./ai.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define upload directory
const outputDir = path.join(__dirname, "../data");

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { formatType } = inputParams;

  console.log("INPUT PARAMS");
  console.log(inputParams);

  if (formatType === "none") return await runDefaultAI(inputParams);

  const aiText = await runCustomAI(inputParams);
  if (!aiText) return null;

  console.log("AI TEXT");
  console.log(aiText);

  const buffer = await buildNewResume(aiText, inputParams);

  return buffer;

  // const outputPath = path.join(outputDir, "new-resume.docx");

  // await fsPromises.writeFile(outputPath, buffer);

  // console.log("NEW RESUME DATA");
  // console.log(data);

  // return buffer;
};
