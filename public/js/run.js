import { EYE_OPEN_SVG, EYE_CLOSED_SVG } from "./util/define-things.js";
import { sendToBack } from "./util/api-front.js";
import { checkFile } from "./util/upload-front.js";

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

export const runMainSubmit = async () => {
  const jobInput = document.getElementById("paste-job-input").value.trim();
  if (!jobInput) {
    alert("You forgot to input a job description. Please paste it in the big stupid box and try again.");
    return null;
  }

  const params = {
    route: "/submit",
    aiType: document.getElementById("ai-type-select").value,
    formatType: document.getElementById("format-type-select").value,
    jobInput: jobInput,
    inputPath: null,
  };

  const fileData = await checkFile();
  console.log("FILE DATA");
  console.log(fileData);
  if (!fileData && params.formatType === "none") {
    alert("You forgot to upload a resume. Please upload a resume and try again.");
    return null;
  }

  if (fileData) params.inputPath = fileData.filePath;

  console.log("RUN MAIN SUBMIT");
  console.log(params);

  const data = await sendToBack(params);
  if (!data) return null;
  console.log("DATA");
  console.log(data);

  const blob = await data.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "new-resume.docx";
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();

  return true;
};

export const runUploadClick = async () => {
  const fileInput = document.getElementById("upload-file-input");
  if (!fileInput) return null;

  fileInput.click();
  // return true;
};

export const runDeleteResume = async () => {
  const data = await sendToBack({ route: "/delete-resume" }, "GET");

  if (!data || !data.success) {
    alert("Failed to delete resume. Please try again.");
    return null;
  }

  // Reset UI to initial state
  const uploadButton = document.getElementById("upload-button");
  const uploadStatus = document.getElementById("upload-status");
  const deleteButton = document.getElementById("delete-resume-button");
  const fileInput = document.getElementById("upload-file-input");

  uploadButton.textContent = "Upload your GARBAGE resume";
  uploadStatus.textContent = "";
  uploadStatus.style.display = "none";
  deleteButton.style.display = "none";
  fileInput.value = "";

  return true;
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
