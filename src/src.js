import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runResumeUnfucker = async (inputParams) => {
  const resumeInput = await extractResumeText();

  console.log("RESUME INPUT");
  console.log(resumeInput);
};

export const extractResumeText = async () => {
  const filePath = await getResumeFilePath();
  if (!filePath) return null;

  const data = await mammoth.extractRawText({ path: filePath });
  if (!data) return null;

  return data.value;
};

export const getResumeFilePath = async () => {
  const fileDir = path.join(__dirname, "data");
  const fileArray = fs.readdirSync(fileDir);

  for (const file of fileArray) {
    if (file.endsWith(".docx")) {
      const filePath = path.join(fileDir, file);
      return filePath;
    }
  }

  return null;
};
