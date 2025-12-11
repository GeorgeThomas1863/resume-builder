import fs from "fs";
import path from "path";

import { uploadDir } from "../../config/upload-config.js";

//deletes all files except one just uploaded
export const runClearFiles = async (file) => {
  // Get all files currently in the directory

  try {
    const fileArray = fs.readdirSync(uploadDir);

    // Delete all files EXCEPT the one that was just uploaded
    for (let i = 0; i < fileArray.length; i++) {
      if (fileArray[i] !== file.filename) {
        const filePath = path.join(uploadDir, fileArray[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (e) {
    console.error("Error managing files:", e);
    return { success: false, message: "Error clearing files" };
  }

  return { success: true, message: "Files cleared successfully" };
};

export const runCheckFile = async () => {
  const fileArray = fs.readdirSync(uploadDir);
  if (!fileArray || !fileArray.length) return { success: false, message: "No files found" };
  if (fileArray.length > 1) return { success: false, message: "Multiple files found" };

  const filename = fileArray[0];

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) return { success: false, message: "File not found" };

  const returnObj = {
    success: true,
    message: "File found",
    fileName: filename,
    filePath: filePath,
  };
  
  return returnObj;
};
