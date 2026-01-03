import { EYE_OPEN_SVG, EYE_CLOSED_SVG } from "./util/define-things.js";
import { sendToBack, sendToBackFile } from "./util/api-front.js";
import { checkFile } from "./util/upload-front.js";

export const runAuthSubmit = async () => {
  const authPwInput = document.getElementById("auth-pw-input");
  if (!authPwInput || !authPwInput.value) return null;

  const data = await sendToBack({ route: "/site-auth-route", pw: authPwInput.value });
  if (!data || !data.redirect) return null;

  window.location.href = data.redirect;
  return data;
};

export const runUploadClick = async () => {
  const fileInput = document.getElementById("upload-file-input");
  if (!fileInput) return null;

  fileInput.click();
  // return true;
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
    // inputPath: fileData.filePath,
  };

  const fileData = await checkFile();
  console.log("FILE DATA");
  console.log(fileData);
  if (!fileData && params.formatType === "none") return null;

  params.inputPath = fileData.filePath;

  console.log("RUN MAIN SUBMIT");
  console.log(params);

  // await sendToBackFile(params);

  // return true;
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
