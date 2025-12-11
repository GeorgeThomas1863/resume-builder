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

  const filePath = path.join(uploadDir, fileArray[0]);
  if (!fs.existsSync(filePath)) return { success: false, message: "File not found" };
  return { success: true, message: "File found", filePath };
};
