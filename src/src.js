import { extractResumeText } from "./resume.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  
  console.log("INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText();
  if (!resumeText) return null;
  console.log("RESUME TEXT");
  console.log(resumeText);

  const aiText = await runAI(resumeText, inputParams);
  if (!aiText) return null;

  // return data;
};
