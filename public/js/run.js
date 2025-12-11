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
  const fileInput = document.getElementById("upload-file-input");
  if (!fileInput) return null;

  console.log("FILE INPUT");
  console.log(fileInput);
  console.log("FILE INPUT TYPE");
  console.log(fileInput.type);

  fileInput.click();
  // return true;
};

export const runUploadFile = async (file) => {
  if (!file) return null;

  const uploadRoute = await sendToBack({ route: "/get-backend-value-route", key: "uploadRoute" });
  if (!uploadRoute) return null;

  const uploadStatus = document.getElementById("upload-status");
  const uploadButton = document.getElementById("upload-button");

  uploadStatus.textContent = "Uploading...";
  uploadStatus.style.display = "inline";
  uploadButton.disabled = true;

  const formData = new FormData();
  formData.append("resume", file);

  try {
    const response = await fetch(uploadRoute, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.error) {
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

export const runMainSubmit = async () => {
  const checkRoute = await sendToBack({ route: "/get-backend-value-route", key: "checkFilePath" });
  const fileData = await sendToBack({ route: checkRoute, method: "GET" });
  console.log("FILE DATA");
  console.log(fileData);


  // const submitRoute = await sendToBack({ route: "/get-backend-value-route", key: "submitRoute" });
  // if (!submitRoute) return null;

  // const params = {
  //   route: submitRoute,
  //   aiType: document.getElementById("ai-type-select").value,
  //   jobInput: document.getElementById("paste-job-input").value,
  // };

  // const data = await sendToBack(params);
  // if (!data) return null;

  // console.log("DATA");
  // console.log(data);

  // return data;
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
