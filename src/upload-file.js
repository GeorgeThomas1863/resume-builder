import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define upload directory
const uploadDir = path.join(__dirname, "../data");

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only Word docs are allowed"));
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // keep the original name since we're only storing one file
    cb(null, file.originalname);
  },
});

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

//-------------

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
    filename: filename,
    filePath: filePath,
  };

  return returnObj;
};

// Helper function to clear all files in upload directory
export const clearUploadDirectory = async () => {
  try {
    const files = fs.readdirSync(uploadDir);
    files.forEach((file) => {
      const filePath = path.join(uploadDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
    return { success: true, message: "All files deleted" };
  } catch (error) {
    console.error("Error clearing upload directory:", error);
    return { success: false, message: "Error deleting files" };
  }
};

export { uploadDir };
