import { buildInputForm } from "./forms/input-form.js";
import { checkFile } from "./util/file-front.js";

const displayElement = document.getElementById("display-element");

export const buildDisplay = async () => {
  if (!displayElement) return null;

  const data = await buildInputForm();
  if (!data) return null;
  displayElement.append(data);

  await checkFile()

  return true;
};

buildDisplay();
