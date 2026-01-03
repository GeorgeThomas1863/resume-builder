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

    const deleteButton = document.getElementById("delete-resume-button");
    if (deleteButton) {
      deleteButton.style.display = "inline-block";
    }

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
  const fileData = await sendToBack({ route: "/check-file" }, "GET");
  if (!fileData || !fileData.success) return null;
  console.log("CHECK FILE FILE DATA");
  console.log(fileData);

  const uploadStatus = document.getElementById("upload-status");
  const uploadButton = document.getElementById("upload-button");
  const deleteButton = document.getElementById("delete-resume-button");
  if (uploadButton) {
    uploadButton.textContent = "Change Resume";
    uploadButton.dataset.uploadedFile = fileData.filename;
  }

  if (uploadStatus) {
    uploadStatus.textContent = `✓ ${fileData.filename}`;
    uploadStatus.style.color = "green";
    uploadStatus.style.display = "inline-block";
    // uploadStatus.style.display = "inline";
  }

  if (deleteButton) {
    deleteButton.style.display = "inline-block";
  }

  return fileData;
};
