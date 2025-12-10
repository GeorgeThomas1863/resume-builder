import { EYE_OPEN_SVG, EYE_CLOSED_SVG } from "./util/define-things.js";
import { sendToBack } from "./util/api-front.js";

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

export const runUploadClick = async () => {
  //triggers the file picker for upload (per claude)
  const fileInput = document.getElementById("upload-file-input");
  if (!fileInput) return null;

  fileInput.click();
  return true;
};

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
    const response = await fetch("/upload-resume", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result || !result.ok) {
      uploadStatus.textContent = `✗ ${result.error}`;
      uploadStatus.style.color = "red";
      return null;
    }

    uploadStatus.textContent = `✓ ${file.name}`;
    uploadStatus.style.color = "green";
    uploadButton.textContent = "Change Resume";
    uploadButton.dataset.uploadedFile = result.filename;
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    uploadStatus.textContent = "✗ Upload failed";
    uploadStatus.style.color = "red";
    return null;
  } finally {
    uploadButton.disabled = false;
  }
};

//----------------------

export const runPwToggle = async () => {
  const pwButton = document.querySelector(".password-toggle-btn");
  const pwInput = document.querySelector(".password-input");

  console.log(pwButton);
  console.log(pwInput);
  const currentSvgId = pwButton.querySelector("svg").id;

  if (currentSvgId === "eye-closed-icon") {
    pwButton.innerHTML = EYE_OPEN_SVG;
    pwInput.type = "text";
    return true;
  }

  pwButton.innerHTML = EYE_CLOSED_SVG;
  pwInput.type = "password";
  return true;
};
