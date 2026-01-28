import { buildAuthForm } from "./display/auth-form.js";
import { buildAdminAuthForm } from "./display/admin-auth-form.js";

const authElement = document.getElementById("auth-element");
const adminAuthElement = document.getElementById("admin-auth-element");

export const buildAuthDisplay = async () => {
  if (!authElement) return null;

  const authForm = await buildAuthForm();
  if (!authForm) {
    console.log("FAILED TO BUILD AUTH FORM");
    return null;
  }

  authElement.appendChild(authForm);
};

export const buildAdminAuthDisplay = async () => {
  if (!adminAuthElement) return null;

  const adminAuthForm = await buildAdminAuthForm();
  if (!adminAuthForm) {
    console.log("FAILED TO BUILD ADMIN AUTH FORM");
    return null;
  }

  adminAuthElement.appendChild(adminAuthForm);
};

if (authElement) buildAuthDisplay();
if (adminAuthElement) buildAdminAuthDisplay();
