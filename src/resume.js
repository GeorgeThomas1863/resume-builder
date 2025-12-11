import mammoth from "mammoth";

export const extractResumeText = async (filePath) => {
  if (!filePath) return null;

  const data = await mammoth.extractRawText({ path: filePath });
  if (!data) return null;

  return data.value;
};

export const buildNewResume = async (aiText, resumeText) => {};
