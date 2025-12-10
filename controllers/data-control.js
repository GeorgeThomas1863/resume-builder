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
