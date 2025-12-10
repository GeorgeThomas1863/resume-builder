import { extractResumeText } from "./resume.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { aiType, jobInput } = inputParams;

  console.log("INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText();
  if (!resumeText) return null;
  console.log("RESUME TEXT");
  console.log(resumeText);

  const data = await runAI(resumeText, jobInput, aiType);
  if (!data) return null;

  return data;
};
