import { EYE_OPEN_SVG, EYE_CLOSED_SVG, modelMap } from "./util/define-things.js";
import { sendToBack } from "./util/api-front.js";
import { buildSubmitParams } from "./util/params.js";
import { checkFile } from "./util/upload-front.js";
import { showLoadStatus, hideLoadStatus } from "./display/loading.js";
import { hideArray, unhideArray } from "./display/collapse.js";
import { unhideAdminAuthModal, hideAdminAuthModal } from "./display/modal.js";

export const runMainSubmit = async () => {
  const jobInput = document.getElementById("paste-job-input").value.trim();
  if (!jobInput) {
    alert("You forgot to input a job description. Please paste it in the big stupid box and try again.");
    return null;
  }

  const params = await buildSubmitParams();
  if (!params) return null;

  const fileData = await checkFile();
  console.log("FILE DATA");
  console.log(fileData);
  if (!fileData && !params.nukeOhio) {
    alert("You forgot to upload a resume. Please upload a resume and try again.");
    return null;
  }

  if (fileData) params.inputPath = fileData.filePath;
  params.jobInput = jobInput;

  console.log("RUN MAIN SUBMIT PARAMS");
  console.dir(params);

  if (params.nukeOhio) {
    const adminAuthData = await checkAdminAuth();

    if (!adminAuthData.isAdmin) {
      // Show modal and wait for auth
      await unhideAdminAuthModal();
      // Store params for later use
      window.pendingSubmitParams = params;
      return null;
    }
  }

  await executeSubmit(params);

  return true;
};

export const executeSubmit = async (params) => {
  await showLoadStatus();

  const data = await sendToBack(params, "POST", true);
  await hideLoadStatus();

  if (!data) return null;

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

export const checkAdminAuth = async () => {
  const data = await sendToBack({ route: "/check-admin-auth" }, "GET");
  console.log("CHECK ADMIN AUTH");
  console.log(data);

  return data;
};

//----------------------

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

// export const runAdminAuthSubmit = async () => {
//   console.log("RUN ADMIN AUTH SUBMIT");
//   const adminAuthPwInput = document.getElementById("admin-auth-pw-input");
//   if (!adminAuthPwInput || !adminAuthPwInput.value) return null;

//   const data = await sendToBack({ route: "/admin-auth-submit", pw: adminAuthPwInput.value });
//   // if (!data || !data.redirect) return null;

//   console.log("DATA");
//   console.dir(data);

//   //maybe do submit here too?
//   window.location.href = data.redirect;
//   return data;
// };

export const runAdminAuthModalSubmit = async () => {
  const input = document.getElementById("admin-auth-modal-input");
  if (!input || !input.value) return null;

  const data = await sendToBack({
    route: "/admin-auth-submit",
    pw: input.value,
  });

  if (!data || !data.success) {
    alert("Invalid admin password");
    return null;
  }

  // Auth successful, hide modal
  await hideAdminAuthModal();

  // Continue with pending submission
  if (window.pendingSubmitParams) {
    const params = window.pendingSubmitParams;
    window.pendingSubmitParams = null;
    await executeSubmit(params);
  }

  return true;
};

export const runAdminAuthModalCancel = async () => {
  await hideAdminAuthModal();
  window.pendingSubmitParams = null;
  return true;
};

export const runUploadClick = async () => {
  const fileInput = document.getElementById("upload-file-input");
  if (!fileInput) return null;

  fileInput.click();
  // return true;
};

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

export const runAIModelSelect = async (modelType) => {
  if (!modelType) return null;
  const modelValue = modelMap[modelType];
  console.log("MODEL VALUE");
  console.log(modelValue);

  const modelSelect = document.getElementById("model-select");
  if (!modelSelect) return null;
  modelSelect.innerHTML = "";
  for (let i = 0; i < modelValue.length; i++) {
    const model = modelValue[i];
    const option = document.createElement("option");
    option.value = model.value;
    option.textContent = model.text;
    if (model.selected) option.selected = true;
    modelSelect.append(option);
  }
  return true;
};

export const runModelOptionsToggle = async () => {
  const modelOptionsListItem = document.getElementById("model-options-list-item");
  // const modelOptionsContentWrapper = document.getElementById("model-options-content-wrapper");
  const toggleButton = document.getElementById("model-options-toggle");

  //expanded to collapsed
  if (toggleButton.getAttribute("aria-expanded") === "true") {
    await hideArray([modelOptionsListItem]);
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.classList.remove("expanded");
    modelOptionsListItem.style.borderBottom = "none";
    modelOptionsListItem.style.borderTop = "none";
    modelOptionsListItem.style.paddingBottom = "0";
    modelOptionsListItem.style.paddingTop = "0";
    return true;
  }

  //collapsed to expanded
  await unhideArray([modelOptionsListItem]);
  toggleButton.setAttribute("aria-expanded", "true");
  toggleButton.classList.add("expanded");
  modelOptionsListItem.style.borderBottom = "1px solid rgba(209, 213, 219, 0.6)";
  modelOptionsListItem.style.borderTop = "1px solid rgba(209, 213, 219, 0.6)";
  modelOptionsListItem.style.paddingBottom = "2rem";
  modelOptionsListItem.style.paddingTop = "1.5rem";

  return true;
};

export const runUploadButtonToggle = async (changeType) => {
  const uploadListItem = document.getElementById("upload-list-item");
  if (!uploadListItem) return null;

  if (changeType === "default" || uploadListItem.classList.contains("hidden")) {
    await unhideArray([uploadListItem]);
    // uploadListItem.classList.remove("hidden");
    return true;
  }

  await hideArray([uploadListItem]);
  // uploadListItem.classList.add("hidden");
  return true;
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
