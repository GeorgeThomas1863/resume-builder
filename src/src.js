import { extractResumeText, buildNewResume } from "./resume.js";
import { runAI } from "./ai.js";

export const runResumeUnfucker = async (inputParams) => {
  if (!inputParams) return null;
  const { filePath } = inputParams;

  console.log("INPUT PARAMS");
  console.log(inputParams);

  const resumeText = await extractResumeText(filePath);
  if (!resumeText) return null;
  console.log("RESUME TEXT");
  console.log(resumeText);

  const aiText = await runAI(resumeText, inputParams);
  if (!aiText) return null;

  await buildNewResume(aiText, resumeText);

  // return data;
};
