import { EYE_CLOSED_SVG } from "../util/define-things.js";

export const buildAuthForm = async () => {
  const authFormWrapper = document.createElement("ul");
  authFormWrapper.id = "auth-form-wrapper";

  //build FORM list items
  const authPwListItem = await buildAuthPwListItem();
  const authButtonListItem = await buildAuthButtonListItem();

  authFormWrapper.append(authPwListItem, authButtonListItem);

  return authFormWrapper;
};

export const buildAuthPwListItem = async () => {
  const authPwListItem = document.createElement("li");
  authPwListItem.id = "auth-pw-list-item";

  const authPwLabel = document.createElement("label");
  authPwLabel.id = "auth-label";
  authPwLabel.setAttribute("for", "auth-pw-input");
  authPwLabel.textContent = "Welcome to the Resume Prettifier";

  const authPwWrapper = document.createElement("div");
  authPwWrapper.className = "password-input-wrapper";

  const authPwInput = document.createElement("input");
  authPwInput.type = "password";
  authPwInput.name = "auth-pw-input";
  authPwInput.id = "auth-pw-input";
  authPwInput.className = "password-input";

  authPwInput.placeholder = "Input the site password here";

  const toggleAuthPwButton = document.createElement("button");
  toggleAuthPwButton.type = "button";
  toggleAuthPwButton.id = "toggle-auth-pw-button";
  toggleAuthPwButton.className = "password-toggle-btn";
  toggleAuthPwButton.setAttribute("data-label", "pwToggle");

  toggleAuthPwButton.innerHTML = EYE_CLOSED_SVG;

  authPwWrapper.append(authPwInput, toggleAuthPwButton);
  authPwListItem.append(authPwLabel, authPwWrapper);

  return authPwListItem;
};

export const buildAuthButtonListItem = async () => {
  const authButtonListItem = document.createElement("li");
  authButtonListItem.id = "auth-button-list-item";

  const authButton = document.createElement("button");
  authButton.id = "auth-button";
  authButton.className = "btn-submit";
  authButton.textContent = "SUBMIT";
  authButton.setAttribute("data-label", "auth-submit");

  authButtonListItem.append(authButton);

  return authButtonListItem;
};

//----------------------------

export const unhideAdminAuthModal = async () => {
  let modal = document.getElementById("admin-auth-modal-overlay");

  if (!modal) {
    modal = await buildAdminAuthModal();
    document.body.append(modal);
  }

  modal.classList.add("active");

  // Focus the input
  const input = document.getElementById("admin-auth-modal-input");
  if (input) input.focus();

  return true;
};

export const hideAdminAuthModal = async () => {
  const modal = document.getElementById("admin-auth-modal-overlay");
  if (!modal) return;

  modal.classList.remove("active");

  // Clear input
  const input = document.getElementById("admin-auth-modal-input");
  if (input) input.value = "";

  return true;
};

// modal.js
export const buildAdminAuthModal = async () => {
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "admin-auth-modal-overlay";
  modalOverlay.className = "modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  const modalTitle = document.createElement("h2");
  modalTitle.textContent = "⚠️ Admin Authorization Required ⚠️";
  modalTitle.className = "modal-title";

  const pwWrapper = document.createElement("div");
  pwWrapper.className = "password-input-wrapper";

  const pwInput = document.createElement("input");
  pwInput.type = "password";
  pwInput.id = "admin-auth-modal-input";
  pwInput.className = "password-input";
  pwInput.placeholder = "Enter admin password";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "password-toggle-btn";
  toggleButton.setAttribute("data-label", "pwToggle");
  toggleButton.innerHTML = EYE_CLOSED_SVG;

  pwWrapper.append(pwInput, toggleButton);

  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "modal-button-wrapper";

  const submitButton = document.createElement("button");
  submitButton.id = "admin-auth-modal-submit";
  submitButton.className = "btn-submit";
  submitButton.textContent = "AUTHORIZE";
  submitButton.setAttribute("data-label", "admin-auth-modal-submit");

  const cancelButton = document.createElement("button");
  cancelButton.id = "admin-auth-modal-cancel";
  cancelButton.className = "btn-cancel";
  cancelButton.textContent = "CANCEL";
  cancelButton.setAttribute("data-label", "admin-auth-modal-cancel");

  buttonWrapper.append(cancelButton, submitButton);

  modalContent.append(modalTitle, pwWrapper, buttonWrapper);
  modalOverlay.append(modalContent);

  return modalOverlay;
};
