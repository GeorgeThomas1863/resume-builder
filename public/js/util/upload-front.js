import { sendToBack } from "./api-front.js";

export const runUploadFile = async (file) => {
  if (!file) return null;

  const uploadStatus = document.getElementById("upload-status");
  const uploadButton = document.getElementById("upload-button");

  uploadStatus.textContent = "Uploading...";
  uploadStatus.style.display = "inline";
  uploadButton.disabled = true;

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) {
      uploadStatus.textContent = `✗ ${data.error}`;
      uploadStatus.style.color = "red";
      return null;
    }

    await checkFile();

    return data;
  } catch (e) {
    console.error("Upload failed:", e);
    uploadStatus.textContent = "✗ Upload failed";
    uploadStatus.style.color = "red";
    return null;
  } finally {
    uploadButton.disabled = false;
  }
};

export const checkFile = async () => {
  const uploadStatus = document.getElementById("upload-status");
  const uploadButton = document.getElementById("upload-button");
  if (!uploadStatus || !uploadButton) return null;

  const fileData = await sendToBack({ route: "/check-file" }, "GET");
  if (!fileData || !fileData.success) return null;
  console.log("CHECK FILE FILE DATA");
  console.log(fileData);

  uploadStatus.textContent = `✓ ${fileData.filename}`;
  uploadStatus.style.color = "green";
  uploadButton.textContent = "Change Resume";
  uploadStatus.style.display = "inline";
  uploadButton.dataset.uploadedFile = fileData.filename;

  return fileData;
};
