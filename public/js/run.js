import { EYE_OPEN_SVG, EYE_CLOSED_SVG } from "./util/define-things.js";
import { sendToBack } from "./util/api-front.js";
import { checkFile } from "./util/file-front.js";

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
  const fileData = await checkFile();
  if (!fileData) return null;

  const submitRoute = await sendToBack({ route: "/get-backend-value-route", key: "submitRoute" });
  if (!submitRoute) return null;

  const params = {
    route: submitRoute,
    aiType: document.getElementById("ai-type-select").value,
    jobInput: document.getElementById("paste-job-input").value,
    filePath: fileData.filePath,
  };

  const data = await sendToBack(params);
  if (!data) return null;

  console.log("DATA");
  console.log(data);

  return data;
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
