import { buildInputForm, buildNewSection } from "./display/input-form.js";
import { checkFile } from "./util/upload-front.js";

const displayElement = document.getElementById("display-element");

export const buildDisplay = async () => {
  if (!displayElement) return null;

  const data = await buildInputForm();
  if (!data) return null;
  displayElement.append(data);
  
  const newSection = await buildNewSection();
  displayElement.append(newSection);

  await checkFile()

  return true;
};

buildDisplay();
