import { EYE_CLOSED_SVG } from "../util/define-things.js";

export const buildAdminAuthForm = async () => {
  const adminAuthFormWrapper = document.createElement("ul");
  adminAuthFormWrapper.id = "admin-auth-form-wrapper";
  adminAuthFormWrapper.className = "auth-form-wrapper"; // reuse auth styles

  const adminAuthPwListItem = await buildAdminAuthPwListItem();
  const adminAuthButtonListItem = await buildAdminAuthButtonListItem();

  adminAuthFormWrapper.append(adminAuthPwListItem, adminAuthButtonListItem);

  return adminAuthFormWrapper;
};

export const buildAdminAuthPwListItem = async () => {
  const adminAuthPwListItem = document.createElement("li");
  adminAuthPwListItem.id = "admin-auth-pw-list-item";

  const adminAuthPwLabel = document.createElement("label");
  adminAuthPwLabel.id = "admin-auth-label";
  adminAuthPwLabel.setAttribute("for", "admin-auth-pw-input");
  adminAuthPwLabel.textContent = "⚠️ Admin Authorization Required ⚠️";

  const adminAuthPwWrapper = document.createElement("div");
  adminAuthPwWrapper.className = "password-input-wrapper";

  const adminAuthPwInput = document.createElement("input");
  adminAuthPwInput.type = "password";
  adminAuthPwInput.name = "admin-auth-pw-input";
  adminAuthPwInput.id = "admin-auth-pw-input";
  adminAuthPwInput.className = "password-input";
  adminAuthPwInput.placeholder = "Enter admin password";

  const toggleAdminAuthPwButton = document.createElement("button");
  toggleAdminAuthPwButton.type = "button";
  toggleAdminAuthPwButton.id = "toggle-admin-auth-pw-button";
  toggleAdminAuthPwButton.className = "password-toggle-btn";
  toggleAdminAuthPwButton.setAttribute("data-label", "adminPwToggle");
  toggleAdminAuthPwButton.innerHTML = EYE_CLOSED_SVG;

  adminAuthPwWrapper.append(adminAuthPwInput, toggleAdminAuthPwButton);
  adminAuthPwListItem.append(adminAuthPwLabel, adminAuthPwWrapper);

  return adminAuthPwListItem;
};

export const buildAdminAuthButtonListItem = async () => {
  const adminAuthButtonListItem = document.createElement("li");
  adminAuthButtonListItem.id = "admin-auth-button-list-item";

  const adminAuthButton = document.createElement("button");
  adminAuthButton.id = "admin-auth-button";
  adminAuthButton.className = "btn-submit";
  adminAuthButton.textContent = "AUTHORIZE";
  adminAuthButton.setAttribute("data-label", "admin-auth-submit");

  adminAuthButtonListItem.append(adminAuthButton);

  return adminAuthButtonListItem;
};
