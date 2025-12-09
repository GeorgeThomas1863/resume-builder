import { buildInputForm } from "./forms/input-form.js";

const displayElement = document.getElementById("display-element");

export const buildDisplay = async () => {
  if (!displayElement) return null;

  const data = await buildInputForm();
  displayElement.append(data);

  return true;
};