import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const extractResumeText = async () => {
  console.log("EXTRACT RESUME TEXT");

  const filePath = await getResumeFilePath();
  console.log("FILE PATH");
  console.log(filePath);
  if (!filePath) return null;

  const data = await mammoth.extractRawText({ path: filePath });
  if (!data) return null;

  return data.value;
};

export const getResumeFilePath = async () => {
  console.log("GET RESUME FILE PATH");

  const fileDir = path.join(__dirname, "../", "data");
  console.log("FILE DIR");
  console.log(fileDir);

  const fileArray = fs.readdirSync(fileDir);

  console.log("FILE ARRAY");
  console.log(fileArray);

  for (const file of fileArray) {
    if (file.endsWith(".docx")) {
      const filePath = path.join(fileDir, file);
      console.log("FILE PATH");
      console.log(filePath);
      return filePath;
    }
  }

  return null;
};
